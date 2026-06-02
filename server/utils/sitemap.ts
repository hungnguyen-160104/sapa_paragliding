import { connectToDatabase } from './db'

export const DOMAIN = 'https://www.paraglidingsapa.com'
export const DEFAULT_LOCALE = 'vi'
export const LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi'] as const

export type Locale = (typeof LOCALES)[number]

export const PAGE_ROUTES: Array<{
  path: string
  priority: string
  changefreq: string
}> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/booking', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/pilots', priority: '0.8', changefreq: 'monthly' },
  { path: '/pre-notice', priority: '0.7', changefreq: 'monthly' }
]

export function getLangIso(locale: Locale): string {
  switch (locale) {
    case 'vi':
      return 'vi-VN'
    case 'en':
      return 'en-US'
    case 'fr':
      return 'fr-FR'
    case 'ru':
      return 'ru-RU'
    case 'zh':
      return 'zh-CN'
    case 'hi':
      return 'hi-IN'
  }
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function getLastMod(): string {
  return new Date().toISOString()
}

export async function buildLocaleSpecificSitemap(locale: Locale): Promise<string> {
  const lastmod = getLastMod()

  let posts: Array<{ slug: string; publishedAt?: Date }> = []
  try {
    const { db } = await connectToDatabase()
    posts = await db.collection('posts')
      .find({ status: 'PUBLISHED' }, { projection: { slug: 1, publishedAt: 1 } })
      .toArray() as Array<{ slug: string; publishedAt?: Date }>
  } catch {
    // DB unavailable — build sitemap with static pages only
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  for (const page of PAGE_ROUTES) {
    const pagePath = page.path === '/' ? '' : page.path
    const currentUrl = `${DOMAIN}/${locale}${pagePath}`

    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(currentUrl)}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`

    for (const altLocale of LOCALES) {
      const altUrl = `${DOMAIN}/${altLocale}${pagePath}`
      xml += `    <xhtml:link rel="alternate" hreflang="${getLangIso(altLocale)}" href="${escapeXml(altUrl)}" />\n`
    }

    const defaultUrl = `${DOMAIN}/${DEFAULT_LOCALE}${pagePath}`
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultUrl)}" />\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    xml += '  </url>\n'
  }

  for (const post of posts) {
    const postPath = `/posts/${post.slug}`
    const currentUrl = `${DOMAIN}/${locale}${postPath}`
    const postLastmod = post.publishedAt ? new Date(post.publishedAt).toISOString() : lastmod

    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(currentUrl)}</loc>\n`
    xml += `    <lastmod>${postLastmod}</lastmod>\n`

    for (const altLocale of LOCALES) {
      const altUrl = `${DOMAIN}/${altLocale}${postPath}`
      xml += `    <xhtml:link rel="alternate" hreflang="${getLangIso(altLocale)}" href="${escapeXml(altUrl)}" />\n`
    }

    const defaultUrl = `${DOMAIN}/${DEFAULT_LOCALE}${postPath}`
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultUrl)}" />\n`
    xml += `    <changefreq>monthly</changefreq>\n`
    xml += `    <priority>0.6</priority>\n`
    xml += '  </url>\n'
  }

  xml += '</urlset>'
  return xml
}