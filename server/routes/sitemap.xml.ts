/**
 * Sitemap.xml generator
 * Handles /sitemap.xml (index) and /sitemap-[locale].xml (language-specific)
 */

const DOMAIN = 'https://www.paraglidingsapa.com'
const LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi']
const DEFAULT_LOCALE = 'vi'

// Primary pages that should be indexed
const PAGE_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/booking', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/pilots', priority: '0.8', changefreq: 'monthly' },
  { path: '/pre-notice', priority: '0.7', changefreq: 'monthly' }
]

function buildSitemapIndex(): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  // cSpell:disable-next-line
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  LOCALES.forEach(locale => {
    xml += `  <sitemap>\n`
    xml += `    <loc>${DOMAIN}/sitemap-${locale}.xml</loc>\n`
    xml += `  </sitemap>\n`
  })

  // cSpell:disable-next-line
  xml += '</sitemapindex>'
  return xml
}

function buildLocaleSpecificSitemap(locale: string): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  PAGE_ROUTES.forEach(page => {
    // Strategy is 'prefix', so all URLs must include the locale
    const path = `/${locale}${page.path === '/' ? '' : page.path}`

    xml += '  <url>\n'
    xml += `    <loc>${DOMAIN}${path}</loc>\n`

    // Add hreflang links
    LOCALES.forEach((alt_locale: string) => {
      const alt_path = `/${alt_locale}${page.path === '/' ? '' : page.path}`
      const langIso = alt_locale === 'vi' ? 'vi-VN' :
                      alt_locale === 'en' ? 'en-US' :
                      alt_locale === 'fr' ? 'fr-FR' :
                      alt_locale === 'ru' ? 'ru-RU' :
                      alt_locale === 'zh' ? 'zh-CN' : 'hi-IN';
      xml += `    <xhtml:link rel="alternate" hreflang="${langIso}" href="${DOMAIN}${alt_path}" />\n`
    })
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/${DEFAULT_LOCALE}${page.path === '/' ? '' : page.path}" />\n`

    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += '  </url>\n'
  })

  xml += '</urlset>'
  return xml
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  // Handle /sitemap-[locale].xml
  const match = url.pathname.match(/\/sitemap-([a-z]{2})\.xml/)
  const localeMatch = match?.[1]
  if (localeMatch && LOCALES.includes(localeMatch)) {
    return buildLocaleSpecificSitemap(localeMatch)
  }

  // Default: /sitemap.xml - return index
  return buildSitemapIndex()
})
