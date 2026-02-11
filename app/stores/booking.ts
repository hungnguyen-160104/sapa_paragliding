import { defineStore } from 'pinia'

export interface PassengerInfo {
  fullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  weight: number
  passportOrId: string
}

export interface BookingData {
  // Step 1: Service Selection
  serviceId: string
  serviceName: string
  servicePrice: number
  numberOfPassengers: number
  totalPrice: number
  discount: number
  selectedOptions: string[] // Optional services: hotel-transfer, drone, camera360
  serviceQuantities?: Record<string, number> // Quantity for drone and camera360

  // Step 2: Contact Information
  contactName: string
  email: string
  phone: string
  preferredDate: string
  preferredTime: string
  specialRequests: string
  pickupLocation: string // Địa điểm đón (if hotel-transfer selected)

  /**
   * OPTIONAL: chat id của KHÁCH (chỉ khi khách đã /start bot).
   * Không dùng để gửi admin. Admin ID sẽ do server đọc từ .env.
   */
  telegramChatId?: string

  // Step 3: Passenger Details
  passengers: PassengerInfo[]

  // Step 4: Terms Agreement
  agreedToTerms: boolean

  // Booking Status
  bookingId?: string
  status: 'draft' | 'submitted' | 'confirmed' | 'completed'
}

function createEmptyPassenger(): PassengerInfo {
  return {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    weight: 0,
    passportOrId: ''
  }
}

function createInitialBookingData(): BookingData {
  return {
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    numberOfPassengers: 1,
    totalPrice: 0,
    discount: 0,
    selectedOptions: [],
    serviceQuantities: {
      drone: 1,
      camera360: 1
    },

    contactName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    specialRequests: '',
    pickupLocation: '',

    // ✅ KHÔNG hardcode telegramChatId
    telegramChatId: undefined,

    passengers: [],
    agreedToTerms: false,
    status: 'draft'
  }
}

export const useBookingStore = defineStore('booking', {
  state: (): { currentStep: number; bookingData: BookingData } => ({
    currentStep: 1,
    bookingData: createInitialBookingData()
  }),

  getters: {
    // Discount per person (VND)
    calculatedDiscountPerPerson: (state): number => {
      const passengers = state.bookingData.numberOfPassengers
      if (passengers >= 6) return 150000
      if (passengers >= 4) return 100000
      if (passengers >= 3) return 70000
      if (passengers >= 2) return 50000
      return 0
    },

    optionalServicesTotal: (state): number => {
      let total = 0
      const selectedOptions = state.bookingData.selectedOptions || []
      const quantities = state.bookingData.serviceQuantities || { drone: 1, camera360: 1 }
      const passengers = state.bookingData.numberOfPassengers

      selectedOptions.forEach(optionId => {
        if (optionId === 'hotel-transfer') {
          total += 100000 * passengers
        } else if (optionId === 'drone') {
          total += 300000 * (quantities['drone'] || 1)
        } else if (optionId === 'camera360') {
          total += 500000 * (quantities['camera360'] || 1)
        }
      })

      return total
    },

    totalDiscountAmount(): number {
      return this.calculatedDiscountPerPerson * this.bookingData.numberOfPassengers
    },

    finalPrice(): number {
      const basePrice = this.bookingData.servicePrice * this.bookingData.numberOfPassengers
      return basePrice - this.totalDiscountAmount + this.optionalServicesTotal
    },

    // Validate steps
    isStepValid: (state): boolean => {
      switch (state.currentStep) {
        case 1:
          return !!state.bookingData.serviceId && state.bookingData.numberOfPassengers > 0

        case 2:
          return !!(
            state.bookingData.contactName &&
            state.bookingData.email &&
            state.bookingData.phone &&
            state.bookingData.preferredDate
          )

        case 3:
          return (
            state.bookingData.passengers.length === state.bookingData.numberOfPassengers &&
            state.bookingData.passengers.every(p =>
              p.fullName &&
              p.dateOfBirth &&
              p.gender &&
              p.nationality &&
              p.weight > 0 &&
              p.passportOrId
            )
          )

        case 4:
          return state.bookingData.agreedToTerms

        default:
          return false
      }
    },

    bookingSummary: (state) => ({
      service: state.bookingData.serviceName || '',
      passengers: state.bookingData.numberOfPassengers || 0,
      date: state.bookingData.preferredDate || '',
      time: state.bookingData.preferredTime || '',
      contact: {
        name: state.bookingData.contactName || '',
        email: state.bookingData.email || '',
        phone: state.bookingData.phone || ''
      },
      pricing: {
        basePrice: state.bookingData.servicePrice || 0,
        quantity: state.bookingData.numberOfPassengers || 0,
        discountPerPerson: state.bookingData.discount || 0,
        total: state.bookingData.totalPrice || 0
      }
    })
  },

  actions: {
    // Step 1
    setService(serviceId: string, serviceName: string, servicePrice: number) {
      this.bookingData.serviceId = serviceId
      this.bookingData.serviceName = serviceName
      this.bookingData.servicePrice = servicePrice
      this.updatePricing()
    },

    setNumberOfPassengers(count: number) {
      const safeCount = Math.max(1, Math.floor(count || 1))
      this.bookingData.numberOfPassengers = safeCount

      // init passengers
      this.bookingData.passengers = Array.from({ length: safeCount }, () => createEmptyPassenger())

      this.updatePricing()
    },

    updatePricing() {
      this.bookingData.discount = this.calculatedDiscountPerPerson
      this.bookingData.totalPrice = this.finalPrice
    },

    setSelectedOptions(options: string[]) {
      this.bookingData.selectedOptions = Array.isArray(options) ? options : []
      this.updatePricing()
    },

    setServiceQuantities(quantities: Record<string, number>) {
      this.bookingData.serviceQuantities = quantities || { drone: 1, camera360: 1 }
      this.updatePricing()
    },

    setPickupLocation(location: string) {
      this.bookingData.pickupLocation = location
    },

    // Step 2
    setContactInfo(data: {
      contactName: string
      email: string
      phone: string
      preferredDate: string
      preferredTime: string
      specialRequests?: string
    }) {
      Object.assign(this.bookingData, {
        ...data,
        specialRequests: data.specialRequests ?? this.bookingData.specialRequests
      })
    },

    // Step 3
    setPassengerInfo(index: number, passengerData: PassengerInfo) {
      if (index < 0 || index >= this.bookingData.passengers.length) return
      this.bookingData.passengers[index] = passengerData
    },

    setAllPassengers(passengers: PassengerInfo[]) {
      this.bookingData.passengers = passengers || []
    },

    // Step 4
    setTermsAgreement(agreed: boolean) {
      this.bookingData.agreedToTerms = agreed
    },

    // OPTIONAL: nếu muốn lưu chat id của khách (không phải admin)
    setTelegramChatId(chatId?: string) {
      const v = (chatId || '').trim()
      this.bookingData.telegramChatId = v ? v : undefined
    },

    // Navigation
    nextStep() {
      if (this.currentStep < 5 && this.isStepValid) this.currentStep++
    },

    previousStep() {
      if (this.currentStep > 1) this.currentStep--
    },

    goToStep(step: number) {
      if (step >= 1 && step <= 5) this.currentStep = step
    },

    // Submit booking
    async submitBooking() {
      try {
        this.bookingData.status = 'submitted'

        const response: any = await $fetch('/api/send-booking', {
          method: 'POST',
          body: this.bookingData
        })

        if (!response?.success) {
          this.bookingData.status = 'draft'
          return { success: false, error: 'Booking submission failed' }
        }

        const bookingId = response.bookingId || ''
        if (bookingId) this.bookingData.bookingId = bookingId
        this.bookingData.status = 'confirmed'
        this.currentStep = 5

        // ✅ Gửi Telegram: KHÔNG gửi adminChatId từ client.
        // Server sẽ đọc TELEGRAM_ADMIN_CHAT_ID trong .env và gửi cho nhiều người.
        try {
          // Tạo plain object từ reactive proxy để $fetch serialize đúng
          const telegramPayload = JSON.parse(JSON.stringify(this.bookingData))
          telegramPayload.bookingId = bookingId

          await $fetch('/api/send-booking-telegram', {
            method: 'POST',
            body: telegramPayload
          })
          console.log('✅ Booking notification requested (server will fan-out to admins)')
        } catch (telegramError) {
          console.warn('⚠️ Failed to send Telegram notification:', telegramError)
        }

        return { success: true, bookingId: this.bookingData.bookingId || '' }
      } catch (error) {
        console.error('Booking error:', error)
        this.bookingData.status = 'draft'
        return { success: false, error: 'Network error' }
      }
    },

    resetBooking() {
      this.currentStep = 1
      this.bookingData = createInitialBookingData()
    }
  }
})
