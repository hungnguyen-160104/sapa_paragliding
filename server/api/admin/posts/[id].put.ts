import { ObjectId } from 'mongodb'
import { getRouterParam, readBody } from 'h3'
import { defineEventHandler } from 'h3'
import { connectToDatabase } from '../../../utils/db'

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
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

    // Validate ID
    if (!id) {
      return {
        success: false,
        error: 'Invalid post ID'
      }
    }

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

    const updateData: Record<string, any> = {
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
      updatedAt: new Date()
    }

    // Handle scheduled publishing
    if (status === 'SCHEDULED' && scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt)
    }

    // Set publishedAt when publishing for the first time
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    const filters: Array<Record<string, any>> = [{ id }]
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) })
    }

    const query = filters.length > 1 ? { $or: filters } : filters[0]

    const result = await postsCollection.updateOne(
      query as Record<string, any>,
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: 'Post not found'
      }
    }

    return {
      success: true,
      message: 'Post updated successfully',
      post: {
        id,
        ...updateData
      }
    }
  } catch (error) {
    console.error('Error updating post:', error)
    return {
      success: false,
      error: 'Failed to update post'
    }
  }
})
