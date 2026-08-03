/**
 * Định dạng chữ đậm / in nghiêng cho nội dung bài viết.
 *
 * Trình soạn thảo lưu đánh dấu kiểu Markdown rút gọn thay vì HTML thô:
 *   **chữ đậm**   -> <strong>
 *   *chữ nghiêng* -> <em>
 *
 * Cách này tránh được XSS: toàn bộ chuỗi được escape trước, sau đó chỉ hai
 * thẻ <strong> và <em> được chèn lại. Người soạn bài không thể nhét <script>
 * hay thuộc tính sự kiện vào nội dung.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char)

/**
 * Trả về HTML an toàn để dùng với v-html.
 * Xử lý **đậm** trước *nghiêng* để cặp hai dấu sao không bị hiểu nhầm.
 */
export const renderInlineMarkup = (raw?: string | null): string => {
  if (typeof raw !== 'string' || raw.length === 0) return ''

  return escapeHtml(raw)
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

/** Bỏ đánh dấu, dùng cho meta description hoặc chỗ chỉ nhận chữ thuần. */
export const stripInlineMarkup = (raw?: string | null): string => {
  if (typeof raw !== 'string' || raw.length === 0) return ''

  return raw.replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1')
}
