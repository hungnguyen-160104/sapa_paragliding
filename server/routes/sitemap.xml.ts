import { DOMAIN, LOCALES, getLastMod } from '../utils/sitemap'

function buildSitemapIndex(): string {
  const lastmod = getLastMod()

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const locale of LOCALES) {
    xml += '  <sitemap>\n'
    xml += `    <loc>${DOMAIN}/sitemap-${locale}.xml</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += '  </sitemap>\n'
  }

  xml += '</sitemapindex>'
  return xml
}

export default defineEventHandler(() => {
  return new Response(buildSitemapIndex(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
})