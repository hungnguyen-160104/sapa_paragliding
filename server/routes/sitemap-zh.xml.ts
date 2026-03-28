import { buildLocaleSpecificSitemap } from '../utils/sitemap'

export default defineEventHandler(() => {
  return new Response(buildLocaleSpecificSitemap('zh'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
})