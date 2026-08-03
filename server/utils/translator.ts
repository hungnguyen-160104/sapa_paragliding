import Anthropic from '@anthropic-ai/sdk'

/**
 * Dịch nội dung bài viết từ tiếng Việt sang tiếng Anh bằng Claude.
 *
 * Cách tiếp cận: KHÔNG bắt mô hình dựng lại cấu trúc block. Thay vào đó rút
 * toàn bộ chuỗi cần dịch ra thành một danh sách phẳng có id, dịch danh sách
 * đó, rồi ghép ngược vào đúng vị trí cũ. Nhờ vậy số hàng/cột của bảng, thứ tự
 * block và mọi trường không phải chữ (url, ảnh, level tiêu đề) luôn nguyên vẹn
 * kể cả khi mô hình trả về thiếu hoặc thừa phần tử.
 */

export interface TranslatableItem {
  id: string
  text: string
}

interface ContentBlockLike {
  id?: string
  type: string
  data?: Record<string, any>
}

/** Chuỗi rỗng hoặc chỉ có khoảng trắng thì bỏ qua, khỏi tốn token. */
const isTranslatable = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

/**
 * Rút chuỗi cần dịch từ danh sách block.
 * id có dạng "<chỉ số block>.<đường dẫn trong data>" để ghép ngược chính xác.
 */
export function extractBlockStrings(blocks: ContentBlockLike[]): TranslatableItem[] {
  const items: TranslatableItem[] = []

  blocks.forEach((block, index) => {
    const data = block?.data ?? {}
    const push = (path: string, value: unknown) => {
      if (isTranslatable(value)) items.push({ id: `${index}.${path}`, text: value })
    }

    switch (block?.type) {
      case 'heading':
      case 'paragraph':
        push('text', data.text)
        break
      case 'quote':
        push('text', data.text)
        push('author', data.author)
        break
      case 'bulletList':
        (Array.isArray(data.items) ? data.items : []).forEach((item: unknown, i: number) =>
          push(`items.${i}`, item)
        )
        break
      case 'image':
        push('caption', data.caption)
        push('alt', data.alt)
        break
      case 'video':
        push('caption', data.caption)
        break
      case 'linkCard':
        push('title', data.title)
        push('description', data.description)
        break
      case 'cta':
        push('text', data.text)
        break
      case 'table':
        (Array.isArray(data.headers) ? data.headers : []).forEach((cell: unknown, c: number) =>
          push(`headers.${c}`, cell)
        )
        ;(Array.isArray(data.rows) ? data.rows : []).forEach((row: unknown, r: number) => {
          ;(Array.isArray(row) ? row : []).forEach((cell: unknown, c: number) =>
            push(`rows.${r}.${c}`, cell)
          )
        })
        break
      default:
        break
    }
  })

  return items
}

/** Ghi giá trị đã dịch vào đúng vị trí, dựa trên id đã sinh ở trên. */
export function applyBlockStrings(
  blocks: ContentBlockLike[],
  translations: Map<string, string>
): ContentBlockLike[] {
  const next = JSON.parse(JSON.stringify(blocks)) as ContentBlockLike[]

  for (const [id, value] of translations) {
    const [rawIndex, ...pathParts] = id.split('.')
    const blockIndex = Number(rawIndex)
    const block = next[blockIndex]

    if (!block || pathParts.length === 0) continue
    block.data = block.data ?? {}

    // Đi tới phần tử cha rồi mới gán, để xử lý được mảng lồng (rows.r.c)
    let target: any = block.data
    for (let i = 0; i < pathParts.length - 1; i++) {
      const key = pathParts[i]!
      if (target?.[key] === undefined) { target = null; break }
      target = target[key]
    }

    const lastKey = pathParts[pathParts.length - 1]!
    if (target && typeof target === 'object') target[lastKey] = value
  }

  return next
}

const SYSTEM_PROMPT = `Bạn dịch nội dung marketing du lịch từ tiếng Việt sang tiếng Anh cho một công ty dù lượn ở Sapa, Việt Nam.

Quy tắc:
- Dịch tự nhiên như người bản ngữ viết, không dịch máy từng chữ.
- Giữ nguyên đánh dấu **chữ đậm** và *chữ nghiêng* đúng vị trí tương ứng.
- Giữ nguyên tên riêng, địa danh, tên người: Sapa, Mường Hoa, Fansipan, Lào Cai.
- Giữ nguyên số, giá tiền, đơn vị, ngày giờ, số điện thoại, URL.
- Giọng văn ấm áp, mời gọi, hợp ngành du lịch trải nghiệm.
- Ô bảng và mục danh sách thường là cụm từ ngắn — dịch ngắn gọn tương ứng, đừng viết thành câu dài.
- Chỉ trả bản dịch. Không thêm giải thích, không thêm chú thích.`

/**
 * Gọi Claude dịch danh sách chuỗi. Trả về Map id -> bản dịch.
 * Chuỗi nào mô hình không trả về thì đơn giản là không có trong Map, và phía
 * gọi sẽ giữ nguyên bản gốc — không bao giờ mất nội dung.
 */
export async function translateItems(items: TranslatableItem[]): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  if (items.length === 0) return result

  const config = useRuntimeConfig()
  const apiKey = String(config.anthropicApiKey || '')

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Chưa cấu hình ANTHROPIC_API_KEY'
    })
  }

  const client = new Anthropic({ apiKey })

  const response = await client.beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    // Suy luận thích ứng: giữ được văn phong và ngữ cảnh tốt hơn dịch thẳng
    thinking: { type: 'adaptive' },
    // Bộ phân loại an toàn có thể từ chối; "default" cho Anthropic tự chọn
    // mô hình thay thế theo loại từ chối, khỏi phải ghim tên mô hình.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Prompt hệ thống cố định giữa các lần gọi -> cache lại cho rẻ
        cache_control: { type: 'ephemeral' }
      }
    ],
    // Ràng buộc đầu ra theo schema: khỏi phải tự parse JSON mô hình trả về
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            translations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  text: { type: 'string' }
                },
                required: ['id', 'text'],
                additionalProperties: false
              }
            }
          },
          required: ['translations'],
          additionalProperties: false
        }
      }
    },
    messages: [
      {
        role: 'user',
        content: `Dịch trường "text" của từng phần tử sang tiếng Anh. Giữ nguyên "id".\n\n${JSON.stringify(
          items,
          null,
          2
        )}`
      }
    ]
  })

  // Phải kiểm tra stop_reason trước khi đọc content: khi bị từ chối thì
  // content rỗng (hoặc chỉ có một phần), đọc thẳng content[0] sẽ nổ.
  if (response.stop_reason === 'refusal') {
    throw createError({
      statusCode: 422,
      statusMessage: `Claude từ chối dịch nội dung này${
        response.stop_details?.category ? ` (nhóm: ${response.stop_details.category})` : ''
      }`
    })
  }

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return result

  let parsed: { translations?: Array<{ id?: string; text?: string }> }
  try {
    parsed = JSON.parse(textBlock.text)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Claude trả về dữ liệu không hợp lệ' })
  }

  const known = new Set(items.map((item) => item.id))
  for (const entry of parsed.translations ?? []) {
    // Bỏ qua id lạ để mô hình không thể ghi vào vị trí ngoài danh sách gửi đi
    if (typeof entry?.id === 'string' && typeof entry.text === 'string' && known.has(entry.id)) {
      result.set(entry.id, entry.text)
    }
  }

  return result
}
