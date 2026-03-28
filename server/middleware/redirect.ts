/**
 * Server middleware to redirect duluon.com to paraglidingsapa.com
 * This handles domain consolidation with proper 301 redirects
 */

export default defineEventHandler(async (event) => {
  const host = getHeader(event, 'host') || ''

  // Redirect duluon.com (and www.duluon.com) to paraglidingsapa.com
  if (host === 'duluon.com' || host === 'www.duluon.com') {
    const url = getRequestURL(event)
    const path = url.pathname + url.search
    const newUrl = `https://www.paraglidingsapa.com${path}`

    return sendRedirect(event, newUrl, 301)
  }
})
