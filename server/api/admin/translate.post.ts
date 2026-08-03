import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import {
  applyBlockStrings,
  extractBlockStrings,
  translateItems,
  type TranslatableItem
} from '../../utils/translator'

/**
 * Dịch nội dung bài viết tiếng Việt sang tiếng Anh.
 *
 * Endpoint này gọi API tính tiền theo lượt nên KHÔNG để mở như các endpoint
 * admin khác — nếu mở, bất kỳ ai cũng có thể gọi và đốt hết credit.
 * Hai lớp chặn: kiểm tra token admin, và giới hạn số lượt theo phút.
 */

const MAX_CALLS_PER_MINUTE = 10
const recentCalls: number[] = []

function assertAdmin(event: Parameters<typeof getHeader>[0]) {
  const header = getHeader(event, 'authorization') || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Thiếu token admin' })
  }

  let username = ''
  try {
    username = Buffer.from(token, 'base64').toString('utf8').split(':')[0] ?? ''
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Token không hợp lệ' })
  }

  const expected = process.env.DEFAULT_ADMIN_USERNAME || 'admin'
  if (username !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Token không hợp lệ' })
  }
}

function assertWithinRateLimit() {
  const now = Date.now()

  while (recentCalls.length > 0 && now - recentCalls[0]! > 60_000) {
    recentCalls.shift()
  }

  if (recentCalls.length >= MAX_CALLS_PER_MINUTE) {
    throw createError({
      statusCode: 429,
      statusMessage: `Quá ${MAX_CALLS_PER_MINUTE} lượt dịch mỗi phút, thử lại sau`
    })
  }

  recentCalls.push(now)
}

export default defineEventHandler(async (event) => {
  assertAdmin(event)
  assertWithinRateLimit()

  const body = await readBody(event)
  const blocks = Array.isArray(body?.blocks) ? body.blocks : []
  const fields = body?.fields && typeof body.fields === 'object' ? body.fields : {}

  // Gom chuỗi từ block và từ các ô rời (tiêu đề, mô tả ngắn, SEO) vào cùng
  // một lượt gọi — rẻ hơn và bản dịch nhất quán hơn so với gọi nhiều lần.
  const blockItems = extractBlockStrings(blocks)
  const fieldItems: TranslatableItem[] = Object.entries(fields)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([key, value]) => ({ id: `field:${key}`, text: String(value) }))

  const items = [...blockItems, ...fieldItems]

  if (items.length === 0) {
    return { success: true, blocks, fields: {}, translatedCount: 0 }
  }

  try {
    const translations = await translateItems(items)

    const blockTranslations = new Map<string, string>()
    const fieldTranslations: Record<string, string> = {}

    for (const [id, text] of translations) {
      if (id.startsWith('field:')) {
        fieldTranslations[id.slice('field:'.length)] = text
      } else {
        blockTranslations.set(id, text)
      }
    }

    return {
      success: true,
      blocks: applyBlockStrings(blocks, blockTranslations),
      fields: fieldTranslations,
      translatedCount: translations.size,
      requestedCount: items.length
    }
  } catch (error: any) {
    // Lỗi đã có statusCode (thiếu key, bị từ chối, JSON hỏng) thì giữ nguyên
    if (error?.statusCode) throw error

    console.error('Translate error:', error)
    throw createError({
      statusCode: 502,
      statusMessage: error?.message || 'Không gọi được dịch vụ dịch'
    })
  }
})
