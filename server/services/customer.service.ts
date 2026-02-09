/**
 * Customer Service
 * Business logic for customer management
 */
import mongoose from 'mongoose'
import { Customer } from '../models'
import type { CreateCustomerDTO, PaginationParams } from '../types'

// ============================================
// TYPES
// ============================================

interface PaginatedCustomerResponse {
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

interface CustomerFilterOptions extends PaginationParams {
  isReturning?: boolean
  search?: string
  from?: string
  to?: string
}

// ============================================
// CUSTOMER SERVICE CLASS
// ============================================

export class CustomerService {
  
  /**
   * Find customer by email or phone
   */
  async findByEmailOrPhone(email: string, phone: string): Promise<any> {
    return Customer.findByEmailOrPhone(email, phone)
  }
  
  /**
   * Find or create customer
   */
  async findOrCreate(data: CreateCustomerDTO): Promise<{ customer: any; isNew: boolean }> {
    return Customer.findOrCreate(data)
  }
  
  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    return Customer.findById(id).lean()
  }
  
  /**
   * Get paginated customers with filters
   */
  async getCustomers(options: CustomerFilterOptions): Promise<PaginatedCustomerResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isReturning,
      search,
      from,
      to,
    } = options
    
    // Build filter
    const filter: Record<string, any> = {}
    
    if (typeof isReturning === 'boolean') {
      filter.isReturningCustomer = isReturning
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }
    
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) {
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = endDate
      }
    }
    
    const skip = (page - 1) * limit
    
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return {
      data: customers,
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
   * Update customer
   */
  async updateCustomer(id: string, updates: Record<string, any>): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    // Remove fields that shouldn't be updated directly
    const { _id, createdAt, totalBookings, totalSpent, ...safeUpdates } = updates
    
    return Customer.findByIdAndUpdate(
      id,
      { $set: { ...safeUpdates, updatedAt: new Date() } },
      { new: true }
    ).lean()
  }
  
  /**
   * Get top customers by spending
   */
  async getTopCustomers(limit: number = 10): Promise<any[]> {
    return Customer.find()
      .sort({ totalSpent: -1 })
      .limit(limit)
      .lean()
  }
  
  /**
   * Get returning customers
   */
  async getReturningCustomers(limit: number = 50): Promise<any[]> {
    return Customer.find({ isReturningCustomer: true })
      .sort({ totalBookings: -1 })
      .limit(limit)
      .lean()
  }
  
  /**
   * Merge duplicate customers (by admin)
   */
  async mergeCustomers(
    primaryId: string,
    duplicateId: string
  ): Promise<any> {
    const session = await mongoose.startSession()
    
    try {
      session.startTransaction()
      
      const [primary, duplicate] = await Promise.all([
        Customer.findById(primaryId).session(session),
        Customer.findById(duplicateId).session(session),
      ])
      
      if (!primary || !duplicate) {
        throw new Error('One or both customers not found')
      }
      
      // Update all bookings from duplicate to primary
      const { Booking } = await import('../models')
      await Booking.updateMany(
        { customerId: duplicate._id },
        { $set: { customerId: primary._id } },
        { session }
      )
      
      // Merge stats
      primary.totalBookings += duplicate.totalBookings
      primary.totalSpent += duplicate.totalSpent
      primary.isReturningCustomer = primary.totalBookings > 1
      
      // Keep earliest firstBookingAt
      if (duplicate.firstBookingAt && primary.firstBookingAt && duplicate.firstBookingAt < primary.firstBookingAt) {
        primary.firstBookingAt = duplicate.firstBookingAt
      }
      
      // Keep latest lastBookingAt
      if (duplicate.lastBookingAt && primary.lastBookingAt && duplicate.lastBookingAt > primary.lastBookingAt) {
        primary.lastBookingAt = duplicate.lastBookingAt
      }
      
      await primary.save({ session })
      
      // Delete duplicate
      await Customer.findByIdAndDelete(duplicateId).session(session)
      
      await session.commitTransaction()
      
      return primary.toObject()
      
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const customerService = new CustomerService()
