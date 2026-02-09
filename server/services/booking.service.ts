/**
 * Booking Service
 * Core business logic for booking operations with transaction support
 */
import mongoose from 'mongoose'
import { Booking, Customer } from '../models'
import type { CreateBookingDTO, BookingStatus, PaginationParams } from '../types'
import { notificationService } from './notification.service'

// ============================================
// TYPES
// ============================================

interface BookingFilterOptions extends PaginationParams {
  status?: BookingStatus
  contactStatus?: string
  source?: string
  from?: string
  to?: string
  search?: string
  customerId?: string
}

interface PaginatedBookingResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BookingResult {
  booking: any
  customer: { id: string; isNew: boolean }
  bookingId: string
}

// ============================================
// BOOKING SERVICE CLASS
// ============================================

export class BookingService {
  
  /**
   * Create a new booking with transaction
   * This ensures Customer and Booking are created atomically
   */
  async createBooking(data: CreateBookingDTO): Promise<BookingResult> {
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession()
    
    try {
      session.startTransaction()
      
      // Step 1: Find or create customer
      const { customer, isNew } = await Customer.findOrCreate({
        email: data.email,
        phone: data.phone,
        fullName: data.contactName,
        nationality: data.nationality,
      })
      
      // Step 2: Generate unique booking ID
      const bookingId = this.generateBookingId(data.phone)
      
      // Step 3: Calculate pricing
      const totalPrice = this.calculateTotalPrice(data)
      
      // Step 4: Create booking
      const booking = await Booking.create([{
        bookingId,
        customerId: customer._id,
        
        // Service
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        
        // Passengers
        numberOfPassengers: data.numberOfPassengers,
        passengers: data.passengers,
        
        // Pricing
        totalPrice,
        discountAmount: data.discount || 0,
        optionalServicesTotal: data.optionalServicesTotal || 0,
        
        // Schedule
        flightDate: new Date(data.preferredDate),
        flightTime: data.preferredTime,
        
        // Location
        pickupLocation: data.pickupLocation,
        
        // Status
        status: 'PENDING',
        contactStatus: 'NOT_CONTACTED',
        
        // Notes
        specialRequests: data.specialRequests,
        
        // Metadata
        source: 'website',
        telegramChatId: data.telegramChatId,
      }], { session })
      
      // Step 5: Update customer stats
      await customer.incrementBookingStats(totalPrice)
      
      // Step 6: Commit transaction
      await session.commitTransaction()
      
      // Step 7: Send notifications (outside transaction - non-blocking)
      const createdBooking = booking[0]
      if (createdBooking) {
        this.sendNotifications(createdBooking, customer, data).catch((err) => {
          console.error('Failed to send notifications:', err)
        })
      }
      
      return {
        booking: createdBooking?.toObject() ?? {},
        customer: {
          id: customer._id?.toString() ?? '',
          isNew,
        },
        bookingId,
      }
      
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
  
  /**
   * Get booking by ID with customer details
   */
  async getBookingById(bookingId: string): Promise<any> {
    return Booking.findOne({ bookingId }).populate('customerId').lean()
  }
  
  /**
   * Get paginated bookings with filters
   */
  async getBookings(options: BookingFilterOptions): Promise<PaginatedBookingResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      contactStatus,
      source,
      from,
      to,
      search,
      customerId,
    } = options
    
    // Build filter query
    const filter: Record<string, any> = {}
    
    if (status) filter.status = status
    if (contactStatus) filter.contactStatus = contactStatus
    if (source) filter.source = source
    if (customerId) filter.customerId = new mongoose.Types.ObjectId(customerId)
    
    // Date range filter
    if (from || to) {
      filter.flightDate = {}
      if (from) filter.flightDate.$gte = new Date(from)
      if (to) {
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        filter.flightDate.$lte = endDate
      }
    }
    
    // Search by bookingId, customer name, email, or phone
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { 'passengers.name': { $regex: search, $options: 'i' } },
      ]
    }
    
    // Calculate skip
    const skip = (page - 1) * limit
    
    // Execute query
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customerId', 'fullName email phone')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }
  
  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    notes?: string
  ): Promise<any> {
    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          status,
          ...(notes && { internalNotes: notes }),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate('customerId')
    
    // If cancelled, update customer stats
    if (booking && status === 'CANCELLED') {
      const customer = await Customer.findById(booking.customerId)
      if (customer) {
        await customer.decrementBookingStats(booking.totalPrice)
      }
    }
    
    return booking
  }
  
  /**
   * Update booking details
   */
  async updateBooking(
    bookingId: string,
    updates: Record<string, any>
  ): Promise<any> {
    // Remove fields that shouldn't be updated directly
    const { _id, bookingId: _, customerId, createdAt, ...safeUpdates } = updates
    
    return Booking.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          ...safeUpdates,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate('customerId').lean()
  }
  
  /**
   * Cancel booking with reason
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    return this.updateBookingStatus(bookingId, 'CANCELLED', reason)
  }
  
  /**
   * Get upcoming bookings for a customer
   */
  async getCustomerUpcomingBookings(customerId: string): Promise<any[]> {
    return Booking.find({
      customerId: new mongoose.Types.ObjectId(customerId),
      flightDate: { $gte: new Date() },
      status: { $in: ['PENDING', 'CONFIRMED'] },
    })
      .sort({ flightDate: 1 })
      .lean()
  }
  
  /**
   * Get today's bookings for operations
   */
  async getTodayBookings(): Promise<any[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return Booking.find({
      flightDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['PENDING', 'CONFIRMED'] },
    })
      .populate('customerId')
      .sort({ flightTime: 1 })
      .lean()
  }
  
  // ==========================================
  // PRIVATE HELPERS
  // ==========================================
  
  private generateBookingId(phone: string): string {
    const now = new Date()
    const datePart = now.toISOString().split('T')[0]?.replace(/-/g, '').slice(2) ?? '' // YYMMDD
    const phoneDigits = phone.replace(/\D/g, '').slice(-4)
    const timestamp = Date.now().toString(36).toUpperCase() // Unique timestamp in base36
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    
    return `BK${datePart}${phoneDigits}${timestamp}${random}`
  }
  
  private calculateTotalPrice(data: CreateBookingDTO): number {
    const basePrice = data.servicePrice * data.numberOfPassengers
    const optionalServices = data.optionalServicesTotal || 0
    const discount = (data.discount || 0) * data.numberOfPassengers
    
    return Math.max(0, basePrice + optionalServices - discount)
  }
  
  private async sendNotifications(
    booking: any,
    customer: any,
    originalData: CreateBookingDTO
  ): Promise<void> {
    // Send Telegram notification
    await notificationService.sendTelegramBookingNotification({
      bookingId: booking.bookingId,
      customerName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      serviceName: booking.serviceName,
      flightDate: booking.flightDate,
      flightTime: booking.flightTime,
      numberOfPassengers: booking.numberOfPassengers,
      totalPrice: booking.totalPrice,
      pickupLocation: booking.pickupLocation,
      specialRequests: booking.specialRequests,
    })
    
    // Send confirmation email
    await notificationService.sendBookingConfirmationEmail({
      to: customer.email,
      customerName: customer.fullName,
      bookingId: booking.bookingId,
      serviceName: booking.serviceName,
      flightDate: booking.flightDate,
      flightTime: booking.flightTime,
      totalPrice: booking.totalPrice,
    })
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const bookingService = new BookingService()
