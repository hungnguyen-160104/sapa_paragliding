/**
 * Server middleware to redirect duluon.com to paraglidingsapa.com
 * This handles domain consolidation with proper 301 redirects
 */

export default defineEventHandler(async (event) => {
  const host = getHeader(event, 'host') || ''

  // Redirect duluon.com (and www.duluon.com) to paraglidingsapa.com
  //
  // paraglidingsapa.com (tên miền trần) cũng gom về đây: hiện Vercel edge
  // đang tự chuyển hướng nó bằng 307 (tạm thời) — Google coi 307 là tạm nên
  // không dồn hẳn tín hiệu về www. Mã 307/308 đó đặt ở Vercel dashboard
  // (Settings → Domains), code không đổi được; dòng này là lớp dự phòng 301
  // cho trường hợp tên miền trần được trỏ thẳng vào app.
  if (host === 'duluon.com' || host === 'www.duluon.com' || host === 'paraglidingsapa.com') {
    const url = getRequestURL(event)
    const path = url.pathname + url.search
    const newUrl = `https://www.paraglidingsapa.com${path}`

    return sendRedirect(event, newUrl, 301)
  }
})
