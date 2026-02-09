import { MongoClient } from 'mongodb'

const mongoUri = 'mongodb://admin:admin123@localhost:27018/sapa_paragliding?authSource=admin'

async function createAdmin() {
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('sapa_paragliding')
    const adminsCollection = db.collection('admins')

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username: 'admin' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      return
    }

    // Create admin account
    const adminAccount = {
      username: 'admin',
      password: 'admin123', // In production, use bcrypt to hash this
      role: 'admin',
      email: 'admin@sapa-paragliding.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await adminsCollection.insertOne(adminAccount)
    console.log('✅ Admin account created successfully')
    console.log(`   ID: ${result.insertedId}`)
    console.log(`   Username: admin`)
    console.log(`   Password: admin123`)
  } catch (error) {
    console.error('❌ Error creating admin account:', error)
  } finally {
    await client.close()
    console.log('✅ MongoDB connection closed')
  }
}

createAdmin()
