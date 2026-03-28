import { buildLocaleSpecificSitemap } from '../utils/sitemap'

export default defineEventHandler(() => {
  return new Response(buildLocaleSpecificSitemap('hi'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
})