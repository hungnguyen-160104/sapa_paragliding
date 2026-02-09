// Get all published posts
import { connectToDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')
    
    // Query posts với status PUBLISHED
    const posts = await postsCollection
      .find({ status: 'PUBLISHED' })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .toArray()
    
    console.log('All published posts:', posts.map((p: any) => ({ id: p.id, title: p.title })))
    
    // Transform data cho frontend
    const transformedPosts = posts.map(post => ({
      id: post.id || post._id?.toString(),
      title: post.title,
      titleVi: post.title, // Sử dụng title làm titleVi
      excerpt: post.excerpt,
      excerptVi: post.excerpt, // Sử dụng excerpt làm excerptVi
      image: post.coverImage || post.thumbnailUrl || '',
      author: 'Admin',
      date: post.publishedAt || post.updatedAt || post.createdAt,
      category: post.categoryId || 'Tin tức',
      published: true,
      slug: post.slug
    }))
    
    return {
      success: true,
      data: transformedPosts,
      total: transformedPosts.length
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})
