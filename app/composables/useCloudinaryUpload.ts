/**
 * Cloudinary Upload Composable
 * Hỗ trợ upload ảnh lên Cloudinary với progress tracking
 */

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
}

export interface UploadOptions {
  folder?: string
  transformation?: string
  onProgress?: (percent: number) => void
}

export function useCloudinaryUpload() {
  // Cloudinary config từ environment variables
  const config = useRuntimeConfig()
  const CLOUD_NAME = config.public.cloudinaryCloudName
  const UPLOAD_PRESET = config.public.cloudinaryUploadPreset
  
  /**
   * Upload single image to Cloudinary
   */
  async function uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File không phải là ảnh')
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      throw new Error('Ảnh quá lớn. Tối đa 10MB')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    
    if (options.folder) {
      formData.append('folder', options.folder)
    }
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Progress tracking
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100)
          options.onProgress(percent)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve({
              url: data.secure_url,
              publicId: data.public_id,
              width: data.width,
              height: data.height
            })
          } catch (e) {
            reject(new Error('Lỗi phân tích response'))
          }
        } else {
          reject(new Error(`Upload thất bại: ${xhr.status}`))
        }
      }
      
      xhr.onerror = () => {
        reject(new Error('Lỗi kết nối khi upload'))
      }
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
      xhr.send(formData)
    })
  }
  
  /**
   * Upload multiple images
   */
  async function uploadMultipleImages(
    files: File[],
    options: UploadOptions & { onFileProgress?: (fileIndex: number, percent: number) => void } = {}
  ): Promise<CloudinaryUploadResult[]> {
    const results: CloudinaryUploadResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      
      const result = await uploadImage(file, {
        ...options,
        onProgress: (percent) => {
          options.onFileProgress?.(i, percent)
        }
      })
      results.push(result)
    }
    
    return results
  }
  
  /**
   * Transform Cloudinary URL với các parameters
   */
  function cloudinaryTransform(url: string, params: string): string {
    if (!url || !url.includes('cloudinary.com')) return url
    
    // Insert transformation before /upload/
    const uploadIndex = url.indexOf('/upload/')
    if (uploadIndex === -1) return url
    
    return url.slice(0, uploadIndex + 8) + params + '/' + url.slice(uploadIndex + 8)
  }
  
  /**
   * Shortcut transforms
   */
  function getCoverUrl(url: string): string {
    return cloudinaryTransform(url, 'w_1600,h_900,c_fill,q_auto,f_auto')
  }
  
  function getThumbnailUrl(url: string): string {
    return cloudinaryTransform(url, 'w_400,h_300,c_fill,q_auto,f_auto')
  }
  
  function getContentImageUrl(url: string): string {
    return cloudinaryTransform(url, 'w_1200,q_auto,f_auto')
  }
  
  function getGalleryThumbUrl(url: string): string {
    return cloudinaryTransform(url, 'w_200,h_200,c_fill,q_auto,f_auto')
  }
  
  /**
   * Validate image URL
   */
  function isValidImageUrl(url: string): boolean {
    if (!url) return false
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }
  
  return {
    uploadImage,
    uploadMultipleImages,
    cloudinaryTransform,
    getCoverUrl,
    getThumbnailUrl,
    getContentImageUrl,
    getGalleryThumbUrl,
    isValidImageUrl
  }
}
