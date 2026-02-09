/**
 * Mongoose Connection Plugin
 * Initializes MongoDB connection on server startup
 */
import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  
  // Ensure mongoUri is treated as a string
  const mongoUri = String(config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/sapa_paragliding')
  
  // Skip connection if using placeholder URI
  if (mongoUri.includes('USERNAME:PASSWORD') || mongoUri.includes('<password>')) {
    console.warn('⚠️ MongoDB URI not configured. Please set MONGODB_URI in .env file.')
    console.warn('📝 Admin features requiring database will not work until configured.')
    return
  }
  
  try {
    await mongoose.connect(mongoUri as string, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    console.log('✅ MongoDB connected successfully via Mongoose')
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    console.warn('⚠️ App will continue without database. Admin features may not work.')
    // Don't throw - let app continue without DB for frontend development
  }
})
