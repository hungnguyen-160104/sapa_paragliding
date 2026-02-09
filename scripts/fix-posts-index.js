import { MongoClient } from 'mongodb'

const mongoUri = 'mongodb://admin:admin123@localhost:27018/sapa_paragliding?authSource=admin'

async function fixPostsIndex() {
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('sapa_paragliding')
    const postsCollection = db.collection('posts')

    // Drop the problematic index if it exists
    try {
      await postsCollection.dropIndex('id_1')
      console.log('✅ Dropped duplicate id_1 index')
    } catch (error) {
      console.log('ℹ️  Index id_1 does not exist or already dropped')
    }

    // Remove any documents with null id field
    const result = await postsCollection.deleteMany({ id: null })
    console.log(`✅ Deleted ${result.deletedCount} documents with null id`)

    // List all indexes
    const indexes = await postsCollection.listIndexes().toArray()
    console.log('📋 Current indexes:')
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, index.key)
    })

    console.log('✅ MongoDB posts collection fixed successfully')
  } catch (error) {
    console.error('❌ Error fixing posts index:', error)
  } finally {
    await client.close()
    console.log('✅ MongoDB connection closed')
  }
}

fixPostsIndex()
