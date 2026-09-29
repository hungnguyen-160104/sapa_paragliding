import { buildLocaleSpecificSitemap } from '../utils/sitemap'

export default defineEventHandler(async () => {
  return new Response(await buildLocaleSpecificSitemap('de'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
})