/**
 * Booking Model
 * Mongoose schema with optimized indexes for analytics
 */
import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
export type ContactStatus = 'NOT_CONTACTED' | 'CONTACTED' | 'CONFIRMED' | 'NO_RESPONSE'
export type BookingSource = 'website' | 'telegram' | 'phone' | 'walk-in' | 'partner'

export interface PassengerInfo {
  name: string
  weight?: number
  age?: number
  nationality?: string
}

export interface IBooking {
  bookingId: string
  customerId: Types.ObjectId
  serviceId: string
  serviceName: string
  servicePrice: number
  numberOfPassengers: number
  passengers: PassengerInfo[]
  totalPrice: number
  discountAmount: number
  optionalServicesTotal: number
  flightDate: Date
  flightTime: string
  pickupLocation?: string
  status: BookingStatus
  contactStatus: ContactStatus
  specialRequests?: string
  internalNotes?: string
  source: BookingSource
  telegramChatId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IBookingDocument extends Document, IBooking {
  isUpcoming: boolean
  netRevenue: number
}

export interface IBookingModel extends Model<IBookingDocument> {
  findByBookingId(bookingId: string): Promise<IBookingDocument | null>
  getUpcomingBookings(days?: number): Promise<IBookingDocument[]>
}

// ============================================
// PASSENGER SUB-SCHEMA
// ============================================

const PassengerSchema = new Schema<PassengerInfo>(
  {
    name: { type: String, required: true },
    weight: { type: Number },
    age: { type: Number },
    nationality: { type: String },
  },
  { _id: false }
)

// ============================================
// BOOKING SCHEMA
// ============================================

const BookingSchema = new Schema<IBookingDocument, IBookingModel>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    serviceId: {
      type: String,
      required: true,
      index: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    servicePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfPassengers: {
      type: Number,
      required: true,
      min: 1,
    },
    passengers: [PassengerSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    optionalServicesTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    flightDate: {
      type: Date,
      required: true,
      index: true,
    },
    flightTime: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    contactStatus: {
      type: String,
      enum: ['NOT_CONTACTED', 'CONTACTED', 'CONFIRMED', 'NO_RESPONSE'],
      default: 'NOT_CONTACTED',
    },
    specialRequests: { type: String },
    internalNotes: { type: String },
    source: {
      type: String,
      enum: ['website', 'telegram', 'phone', 'walk-in', 'partner'],
      default: 'website',
      index: true,
    },
    telegramChatId: { type: String },
  },
  {
    timestamps: true,
    collection: 'bookings',
  }
)

// ============================================
// COMPOUND INDEXES
// ============================================

BookingSchema.index({ flightDate: 1, status: 1, totalPrice: 1 })
BookingSchema.index({ flightDate: -1, createdAt: -1 })
BookingSchema.index({ customerId: 1, flightDate: -1 })
BookingSchema.index({ status: 1, flightDate: -1 })
BookingSchema.index({ source: 1, createdAt: -1 })
BookingSchema.index({ serviceId: 1, flightDate: -1 })

// ============================================
// VIRTUAL FIELDS
// ============================================

BookingSchema.virtual('isUpcoming').get(function (this: IBookingDocument) {
  return this.flightDate > new Date() && this.status !== 'CANCELLED'
})

BookingSchema.virtual('netRevenue').get(function (this: IBookingDocument) {
  if (this.status === 'CANCELLED' || this.status === 'REFUNDED') {
    return 0
  }
  return this.totalPrice
})

// ============================================
// PRE-SAVE HOOKS
// ============================================

BookingSchema.pre('save', function (this: IBookingDocument, next) {
  if (!this.bookingId) {
    const now = new Date()
    const datePart = now.toISOString().split('T')[0]?.replace(/-/g, '') || ''
    const timePart = now.toTimeString().split(' ')[0]?.replace(/:/g, '') || ''
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    this.bookingId = `BK-${datePart}-${timePart}-${random}`
  }
  next()
})

// ============================================
// STATIC METHODS
// ============================================

BookingSchema.statics.findByBookingId = async function (
  bookingId: string
): Promise<IBookingDocument | null> {
  return this.findOne({ bookingId }).populate('customerId')
}

BookingSchema.statics.getUpcomingBookings = async function (
  days: number = 7
): Promise<IBookingDocument[]> {
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.find({
    flightDate: { $gte: now, $lte: futureDate },
    status: { $in: ['PENDING', 'CONFIRMED'] },
  })
    .sort({ flightDate: 1 })
    .populate('customerId')
}

// ============================================
// MODEL EXPORT
// ============================================

export const Booking: IBookingModel =
  (mongoose.models.Booking as IBookingModel) ||
  mongoose.model<IBookingDocument, IBookingModel>('Booking', BookingSchema)
