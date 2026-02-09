/**
 * Customer Model
 * Mongoose schema with optimized indexes
 */
import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================
// INTERFACE DEFINITION
// ============================================

export interface ICustomer {
  email: string
  phone: string
  fullName: string
  nationality?: string
  totalBookings: number
  totalSpent: number
  isReturningCustomer: boolean
  firstBookingAt?: Date
  lastBookingAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface ICustomerDocument extends Document, ICustomer {
  incrementBookingStats(bookingAmount: number): Promise<void>
  decrementBookingStats(bookingAmount: number): Promise<void>
}

export interface ICustomerModel extends Model<ICustomerDocument> {
  findByEmailOrPhone(email: string, phone: string): Promise<ICustomerDocument | null>
  findOrCreate(customerData: {
    email: string
    phone: string
    fullName: string
    nationality?: string
  }): Promise<{ customer: ICustomerDocument; isNew: boolean }>
}

// ============================================
// SCHEMA DEFINITION
// ============================================

const CustomerSchema = new Schema<ICustomerDocument, ICustomerModel>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    isReturningCustomer: {
      type: Boolean,
      default: false,
      index: true,
    },
    firstBookingAt: {
      type: Date,
    },
    lastBookingAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'customers',
  }
)

// ============================================
// COMPOUND INDEXES
// ============================================

CustomerSchema.index({ email: 1, phone: 1 }, { unique: true })
CustomerSchema.index({ isReturningCustomer: 1, createdAt: -1 })
CustomerSchema.index({ totalSpent: -1 })
CustomerSchema.index({ totalBookings: -1 })

// ============================================
// STATIC METHODS
// ============================================

CustomerSchema.statics.findByEmailOrPhone = async function (
  email: string,
  phone: string
): Promise<ICustomerDocument | null> {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { phone: phone.replace(/\D/g, '') },
    ],
  })
}

CustomerSchema.statics.findOrCreate = async function (
  customerData: { email: string; phone: string; fullName: string; nationality?: string }
): Promise<{ customer: ICustomerDocument; isNew: boolean }> {
  const normalizedEmail = customerData.email.toLowerCase().trim()
  const normalizedPhone = customerData.phone.replace(/\s/g, '')
  
  let customer = await this.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  })
  
  if (customer) {
    if (customerData.fullName && customerData.fullName !== customer.fullName) {
      customer.fullName = customerData.fullName
      await customer.save()
    }
    return { customer, isNew: false }
  }
  
  customer = await this.create({
    email: normalizedEmail,
    phone: normalizedPhone,
    fullName: customerData.fullName,
    nationality: customerData.nationality,
    totalBookings: 0,
    totalSpent: 0,
    isReturningCustomer: false,
    firstBookingAt: new Date(),
    lastBookingAt: new Date(),
  })
  
  return { customer, isNew: true }
}

// ============================================
// INSTANCE METHODS
// ============================================

CustomerSchema.methods.incrementBookingStats = async function (
  bookingAmount: number
): Promise<void> {
  this.totalBookings += 1
  this.totalSpent += bookingAmount
  this.lastBookingAt = new Date()
  
  if (this.totalBookings > 1) {
    this.isReturningCustomer = true
  }
  
  await this.save()
}

CustomerSchema.methods.decrementBookingStats = async function (
  bookingAmount: number
): Promise<void> {
  this.totalBookings = Math.max(0, this.totalBookings - 1)
  this.totalSpent = Math.max(0, this.totalSpent - bookingAmount)
  
  if (this.totalBookings <= 1) {
    this.isReturningCustomer = false
  }
  
  await this.save()
}

// ============================================
// MODEL EXPORT
// ============================================

export const Customer: ICustomerModel =
  (mongoose.models.Customer as ICustomerModel) ||
  mongoose.model<ICustomerDocument, ICustomerModel>('Customer', CustomerSchema)
