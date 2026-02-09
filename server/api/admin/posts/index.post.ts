import { readBody } from 'h3'
import { connectToDatabase } from '../../../utils/db'
import { defineEventHandler } from 'h3'


const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const {
      title,
      slug,
      excerpt,
      contentHtml,
      contentBlocks,
      categoryId,
      status,
      thumbnailUrl,
      galleryUrls,
      tags,
      seo,
      scheduledAt
    } = body

    if (!title || !categoryId) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    if (status === 'PUBLISHED' && !thumbnailUrl) {
      return {
        success: false,
        error: 'Thumbnail is required to publish'
      }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const now = new Date()
    const newId = Date.now().toString()
    
    const newPost: Record<string, any> = {
      id: newId,
      title,
      slug: normalizeSlug(slug || title),
      excerpt: excerpt || '',
      contentHtml: contentHtml || '',
      contentBlocks: Array.isArray(contentBlocks) ? contentBlocks : [],
      categoryId,
      status: ['PUBLISHED', 'DRAFT', 'SCHEDULED'].includes(status) ? status : 'DRAFT',
      thumbnailUrl: thumbnailUrl || '',
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls.filter(Boolean) : [],
      tags: Array.isArray(tags) ? tags : [],
      seo: seo || {},
      views: 0,
      createdAt: now,
      updatedAt: now
    }

    // Handle scheduled publishing
    if (status === 'SCHEDULED' && scheduledAt) {
      newPost.scheduledAt = new Date(scheduledAt)
    }

    // Set publishedAt when publishing
    if (status === 'PUBLISHED') {
      newPost.publishedAt = now
    }

    await postsCollection.insertOne(newPost)

    return {
      success: true,
      message: 'Post created successfully',
      post: newPost
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      success: false,
      error: 'Failed to create post'
    }
  }
})
