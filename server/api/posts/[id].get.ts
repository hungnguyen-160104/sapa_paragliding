// Get a single post by ID or slug
import { connectToDatabase } from '../../utils/db'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Post ID is required'
    })
  }

  try {
    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')
    
    // Tìm theo id, slug, hoặc _id
    let post = await postsCollection.findOne({ id })
    
    if (!post) {
      post = await postsCollection.findOne({ slug: id })
    }
    
    if (!post) {
      try {
        post = await postsCollection.findOne({ _id: new ObjectId(id) })
      } catch (e) {
        // Not a valid ObjectId
      }
    }
    
    console.log(`Looking for post with id: ${id}`)
    console.log('Found post:', post?.title)
    console.log('Post gallery from DB:', post?.gallery)

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }
    
    // Chỉ trả về bài đã published (trừ khi là preview)
    if (post.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }
    
    // Transform data cho frontend
    const transformedPost = {
      id: post.id || post._id?.toString(),
      title: post.title,
      titleVi: post.title,
      excerpt: post.excerpt,
      excerptVi: post.excerpt,
      content: post.content,
      contentVi: post.content,
      contentBlocks: post.contentBlocks,
      image: post.coverImage || post.thumbnailUrl || '',
      author: 'Admin',
      date: post.publishedAt || post.updatedAt || post.createdAt,
      category: post.categoryId || 'Tin tức',
      published: true,
      slug: post.slug,
      gallery: post.gallery,
      seo: post.seo
    }

    return {
      success: true,
      data: transformedPost
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error
    }
    console.error('Error fetching post:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch post'
    })
  }
})
