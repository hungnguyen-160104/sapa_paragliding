import { apiFetch } from './http'

export interface PostPayload {
  title: string
  slug: string
  excerpt?: string
  contentHtml: string
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED'
  thumbnailUrl?: string
  galleryUrls?: string[]
}

export interface AdminPostSummary {
  id: string
  title: string
  slug: string
  excerpt?: string
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED'
  updatedAt?: string
  thumbnailUrl?: string
}

export interface PostListResponse {
  success: boolean
  data: AdminPostSummary[]
  total: number
}

export interface PostDetailResponse {
  success: boolean
  data: (PostPayload & { id: string; galleryUrls: string[] })
}

export const fetchPosts = (params: {
  search?: string
  status?: string
  categoryId?: string
  page?: number
  pageSize?: number
} = {}) => {
  return apiFetch<PostListResponse>(`/admin/posts`, {
    method: 'GET',
    params
  })
}

export const fetchPostById = (id: string) => {
  return apiFetch<PostDetailResponse>(`/admin/posts/${id}`, { method: 'GET' })
}

export const createPost = (payload: PostPayload) => {
  return apiFetch(`/admin/posts`, {
    method: 'POST',
    body: payload
  })
}

export const updatePost = (id: string, payload: PostPayload) => {
  return apiFetch(`/admin/posts/${id}`, {
    method: 'PUT',
    body: payload
  })
}

export const deletePost = (id: string) => {
  return apiFetch(`/admin/posts/${id}`, {
    method: 'DELETE'
  })
}
