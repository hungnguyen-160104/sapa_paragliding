/**
 * Post Model
 * Mongoose schema for SEO-optimized blog content
 */
import mongoose, { Schema, Document, Model } from 'mongoose'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type PostStatus = 'draft' | 'published' | 'archived'
export type PostCategory = 'news' | 'guide' | 'experience' | 'promotion'

export interface MultilingualText {
  vi: string
  en?: string
  fr?: string
  ru?: string
}

export interface IPost {
  slug: string
  title: MultilingualText
  excerpt: MultilingualText
  content: MultilingualText
  featuredImage?: string
  category: PostCategory
  tags: string[]
  status: PostStatus
  author: string
  views: number
  seoTitle?: MultilingualText
  seoDescription?: MultilingualText
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IPostDocument extends Document, IPost {}

export interface IPostModel extends Model<IPostDocument> {
  findBySlug(slug: string): Promise<IPostDocument | null>
  getPublishedPosts(options?: {
    category?: PostCategory
    limit?: number
    skip?: number
  }): Promise<IPostDocument[]>
  incrementViews(slug: string): Promise<void>
}

// ============================================
// MULTILINGUAL TEXT SCHEMA
// ============================================

const MultilingualTextSchema = new Schema(
  {
    vi: { type: String, default: '' },
    en: { type: String, default: '' },
    fr: { type: String, default: '' },
    ru: { type: String, default: '' },
  },
  { _id: false }
)

// ============================================
// POST SCHEMA
// ============================================

const PostSchema = new Schema<IPostDocument, IPostModel>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: MultilingualTextSchema,
      required: true,
    },
    excerpt: {
      type: MultilingualTextSchema,
      required: true,
    },
    content: {
      type: MultilingualTextSchema,
      required: true,
    },
    featuredImage: {
      type: String,
    },
    category: {
      type: String,
      enum: ['news', 'guide', 'experience', 'promotion'],
      default: 'news',
      index: true,
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    author: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    seoTitle: MultilingualTextSchema,
    seoDescription: MultilingualTextSchema,
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'posts',
  }
)

// ============================================
// INDEXES
// ============================================

PostSchema.index({ status: 1, publishedAt: -1 })
PostSchema.index({ category: 1, status: 1, publishedAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ 'title.vi': 'text', 'title.en': 'text' })

// ============================================
// STATIC METHODS
// ============================================

PostSchema.statics.findBySlug = async function (
  slug: string
): Promise<IPostDocument | null> {
  return this.findOne({ slug })
}

PostSchema.statics.getPublishedPosts = async function (
  options: { category?: PostCategory; limit?: number; skip?: number } = {}
): Promise<IPostDocument[]> {
  const query = this.find({ status: 'published' })
  
  if (options.category) {
    query.where('category').equals(options.category)
  }
  
  return query
    .sort({ publishedAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 10)
}

PostSchema.statics.incrementViews = async function (
  slug: string
): Promise<void> {
  await this.updateOne({ slug }, { $inc: { views: 1 } })
}

// ============================================
// PRE-SAVE HOOKS
// ============================================

PostSchema.pre('save', function (this: IPostDocument, next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// ============================================
// MODEL EXPORT
// ============================================

export const Post: IPostModel =
  (mongoose.models.Post as IPostModel) ||
  mongoose.model<IPostDocument, IPostModel>('Post', PostSchema)
