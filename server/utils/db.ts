import mongoose from 'mongoose'

// Use Mongoose's ObjectId
const ObjectId = mongoose.Types.ObjectId

// Get MongoDB URI from environment
const getMongoUri = () => {
  try {
    const config = useRuntimeConfig()
    return String(config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/sapa_paragliding')
  } catch {
    return String(process.env.MONGODB_URI || 'mongodb://localhost:27017/sapa_paragliding')
  }
}

/**
 * Kết nối đang dở dang, dùng chung cho mọi lời gọi đồng thời.
 *
 * Trước đây hàm dưới chỉ xử lý readyState 0 (chưa kết nối) và 1 (đã kết nối).
 * Khi readyState là 2 (ĐANG kết nối) thì cả hai nhánh đều bị bỏ qua, hàm đọc
 * mongoose.connection.db lúc còn undefined rồi ném lỗi. Tình huống này xảy ra
 * thường xuyên trên Vercel: lần khởi động lạnh, request đầu tiên bắt đầu
 * connect, request thứ hai ập tới ngay sau đó và rơi đúng vào khe readyState 2.
 * Hậu quả nặng nhất nằm ở sitemap — xem server/utils/sitemap.ts.
 *
 * Giữ lại promise để mọi request cùng chờ một kết nối duy nhất.
 */
let connectionPromise: Promise<unknown> | null = null

export async function connectToDatabase() {
  const readyState = mongoose.connection.readyState

  // 1 = đã kết nối
  if (readyState === 1 && mongoose.connection.db) {
    return { client: mongoose.connection.getClient(), db: mongoose.connection.db }
  }

  // 0 = đã ngắt hẳn: bỏ promise cũ để lần này kết nối lại từ đầu.
  // Mongoose đặt readyState = 2 ngay trong lời gọi connect() nên readyState 0
  // bảo đảm không có request nào khác đang kết nối dở.
  if (readyState === 0) {
    connectionPromise = null
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoUri()).catch((error) => {
      // Xoá promise hỏng, nếu không mọi request sau đều nhận lại đúng lỗi này
      // và tiến trình không bao giờ tự phục hồi được.
      connectionPromise = null
      console.error('Failed to connect to MongoDB in utils/db:', error)
      throw error
    })
  }

  await connectionPromise

  const db = mongoose.connection.db
  if (!db) {
    throw new Error('MongoDB connection is missing db instance after connect')
  }
  return { client: mongoose.connection.getClient(), db }
}

export async function getPostsCollection() {
  const { db } = await connectToDatabase()
  return db.collection('posts')
}

export async function getBookingsCollection() {
  const { db } = await connectToDatabase()
  return db.collection('bookings')
}

export async function getAllPosts(filter: any = {}) {
  const collection = await getPostsCollection()
  const posts = await collection.find(filter).sort({ date: -1 }).toArray()
  
  // Ensure all posts have an id field (use _id as fallback)
  return posts.map(post => ({
    ...post,
    id: post.id || post._id?.toString()
  }))
}

export async function getPostById(id: string) {
  const collection = await getPostsCollection()
  let post = await collection.findOne({ id })
  
  // If not found by id field, try by _id (for posts created without id field)
  if (!post) {
    try {
      post = await collection.findOne({ _id: new ObjectId(id) })
      // If found by _id, ensure it has an id field
      if (post) {
        post.id = post.id || post._id?.toString()
      }
    } catch (e) {
      // Not a valid ObjectId, return null
      return null
    }
  }
  
  return post
}

export async function createPost(postData: any) {
  const collection = await getPostsCollection()
  const newPost = {
    ...postData,
    id: postData.id || Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await collection.insertOne(newPost)
  return newPost
}

export async function updatePost(id: string, updateData: any) {
  const collection = await getPostsCollection()
  const result = await collection.findOneAndUpdate(
    { id },
    {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  )
  return result?.value || null
}

export async function deletePost(id: string) {
  const collection = await getPostsCollection()
  const result = await collection.deleteOne({ id })
  return result.deletedCount > 0
}

export async function getPostsByCategory(category: string) {
  const collection = await getPostsCollection()
  return collection.find({ category, published: true }).sort({ date: -1 }).toArray()
}
