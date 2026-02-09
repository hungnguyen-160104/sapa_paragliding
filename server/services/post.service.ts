/**
 * Post Service
 * Business logic for blog/content management
 */
import mongoose from 'mongoose'
import { Post } from '../models'
import type { PostStatus, PostCategory, PaginationParams } from '../types'

// ============================================
// TYPES
// ============================================

interface PaginatedPostResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface PostFilterOptions extends PaginationParams {
  status?: PostStatus
  category?: PostCategory
  search?: string
  tag?: string
  locale?: string
}

interface CreatePostDTO {
  slug: string
  title: Record<string, string>
  excerpt: Record<string, string>
  content: Record<string, string>
  featuredImage?: string
  category: PostCategory
  tags?: string[]
  status?: PostStatus
  author: string
  seoTitle?: Record<string, string>
  seoDescription?: Record<string, string>
}

interface UpdatePostDTO extends Partial<Omit<CreatePostDTO, 'slug' | 'author'>> {}

// ============================================
// POST SERVICE CLASS
// ============================================

export class PostService {
  
  /**
   * Create a new post
   */
  async createPost(data: CreatePostDTO): Promise<any> {
    // Check for duplicate slug
    const existing = await Post.findBySlug(data.slug)
    if (existing) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug already exists',
      })
    }
    
    const post = await Post.create({
      ...data,
      status: data.status || 'draft',
      tags: data.tags || [],
      views: 0,
    })
    
    return post.toObject()
  }
  
  /**
   * Get post by slug
   */
  async getBySlug(slug: string, incrementViews: boolean = false): Promise<any> {
    const post = await Post.findBySlug(slug)
    
    if (post && incrementViews) {
      await Post.incrementViews(slug)
    }
    
    return post?.toObject() || null
  }
  
  /**
   * Get post by ID
   */
  async getById(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    return Post.findById(id).lean()
  }
  
  /**
   * Get paginated posts with filters
   */
  async getPosts(options: PostFilterOptions): Promise<PaginatedPostResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      status,
      category,
      search,
      tag,
      locale = 'vi',
    } = options
    
    // Build filter
    const filter: Record<string, any> = {}
    
    if (status) {
      filter.status = status
    }
    
    if (category) {
      filter.category = category
    }
    
    if (tag) {
      filter.tags = tag.toLowerCase()
    }
    
    if (search) {
      // Search in the specified locale's title and content
      filter.$or = [
        { [`title.${locale}`]: { $regex: search, $options: 'i' } },
        { [`excerpt.${locale}`]: { $regex: search, $options: 'i' } },
        { [`title.en`]: { $regex: search, $options: 'i' } }, // Fallback to English
      ]
    }
    
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }
  
  /**
   * Get published posts for public display
   */
  async getPublishedPosts(options: {
    category?: PostCategory
    limit?: number
    page?: number
    locale?: string
  } = {}): Promise<PaginatedPostResponse> {
    return this.getPosts({
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      category: options.category,
      locale: options.locale,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    })
  }
  
  /**
   * Update post
   */
  async updatePost(id: string, updates: UpdatePostDTO): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean()
    
    return post
  }
  
  /**
   * Publish post
   */
  async publishPost(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    return Post.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean()
  }
  
  /**
   * Unpublish post (set to draft)
   */
  async unpublishPost(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    return Post.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'draft',
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean()
  }
  
  /**
   * Archive post
   */
  async archivePost(id: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    
    return Post.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'archived',
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).lean()
  }
  
  /**
   * Delete post
   */
  async deletePost(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false
    }
    
    const result = await Post.findByIdAndDelete(id)
    return !!result
  }
  
  /**
   * Get related posts by category or tags
   */
  async getRelatedPosts(
    postId: string,
    limit: number = 4
  ): Promise<any[]> {
    const post = await Post.findById(postId)
    
    if (!post) {
      return []
    }
    
    return Post.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
  }
  
  /**
   * Get popular posts by views
   */
  async getPopularPosts(limit: number = 5): Promise<any[]> {
    return Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(limit)
      .lean()
  }
  
  /**
   * Get all tags with counts
   */
  async getAllTags(): Promise<{ tag: string; count: number }[]> {
    const result = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1,
        },
      },
    ])
    
    return result
  }
  
  /**
   * Generate unique slug from title
   */
  generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đ]/g, 'd')
      .replace(/[Đ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    // Add timestamp to ensure uniqueness
    return `${slug}-${Date.now().toString(36)}`
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const postService = new PostService()
