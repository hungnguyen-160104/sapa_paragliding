import { connectToDatabase } from './db'
import { PILOT_SLUG_BY_KEY, VISIBLE_PILOT_KEYS } from '../../shared/pilots'

export const DOMAIN = 'https://www.paraglidingsapa.com'
export const DEFAULT_LOCALE = 'en'
export const LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi'] as const

export type Locale = (typeof LOCALES)[number]

/**
 * Bài viết chỉ có bản tiếng Anh và tiếng Việt trong cơ sở dữ liệu; bốn địa chỉ
 * còn lại phục vụ y hệt nội dung tiếng Anh. Khai chúng trong sitemap là tự
 * mời Google đi lập chỉ mục 196 bản sao — và Google trả lời đúng như vậy:
 * "đã thu thập dữ liệu — hiện chưa được lập chỉ mục".
 *
 * Trang tĩnh thì dịch đủ sáu thứ tiếng nên vẫn khai đủ.
 */
export const POST_LOCALES: readonly Locale[] = ['vi', 'en']

/**
 * Trang phi công thì NGƯỢC LẠI với bài viết: nội dung nằm trong i18n và đã
 * dịch thật đủ sáu thứ tiếng (đã đối chiếu 13 phi công x 6 ngôn ngữ, không bản
 * nào là bản tiếng Anh chép lại), nên khai đủ sáu như trang tĩnh.
 *
 * Slug lấy từ shared/pilots.ts — cùng một nguồn với route và với link trên
 * trang, để sitemap không bao giờ khai ra địa chỉ mà site trả 404.
 */
const PILOT_PRIORITY = '0.6'
const PILOT_CHANGEFREQ = 'monthly'

export const PAGE_ROUTES: Array<{
  path: string
  priority: string
  changefreq: string
}> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/booking', priority: '0.9', changefreq: 'weekly' },
  { path: '/prices', priority: '0.9', changefreq: 'monthly' },
  { path: '/flying-site', priority: '0.8', changefreq: 'monthly' },
  { path: '/posts', priority: '0.8', changefreq: 'weekly' },
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

/**
 * Returns a stable lastmod date. Using a fixed build-time value prevents
 * Google from distrusting lastmod (which happens when it changes on every request).
 * Update this date manually when content actually changes.
 */
const SITE_LAST_MODIFIED = '2026-07-29T00:00:00.000Z'

export function getLastMod(): string {
  return SITE_LAST_MODIFIED
}

export async function buildLocaleSpecificSitemap(locale: Locale): Promise<string> {
  const lastmod = getLastMod()

  // KHÔNG nuốt lỗi database ở đây.
  //
  // Bản cũ bắt lỗi rồi lặng lẽ trả sitemap chỉ có 8 trang tĩnh. Vì route đặt
  // Cache-Control: public, max-age=3600 nên CDN của Vercel ghim đúng bản thiếu
  // đó suốt một tiếng — và với Google, một sitemap 200 mà mất 44 URL không phải
  // là "tạm lỗi", nó là tín hiệu các trang kia đã biến mất.
  //
  // Để lỗi bay lên thành 500 thì Google giữ nguyên sitemap đã biết rồi thử lại,
  // còn CDN không cache phản hồi 5xx. Hỏng ồn ào an toàn hơn hỏng im lặng.
  const { db } = await connectToDatabase()
  const posts = await db.collection('posts')
    .find({ status: 'PUBLISHED' }, { projection: { slug: 1, publishedAt: 1 } })
    .toArray() as unknown as Array<{ slug: string; publishedAt?: Date }>

  if (posts.length === 0) {
    throw new Error('Sitemap: truy vấn posts trả về rỗng, không phát hành sitemap thiếu bài')
  }

  // Ngôn ngữ không có bản dịch riêng cho bài thì sitemap chỉ gồm trang tĩnh.
  const includePosts = POST_LOCALES.includes(locale)

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  for (const page of PAGE_ROUTES) {
    // Trang danh sách bài cũng chỉ có nội dung thật ở vi/en — bốn ngôn ngữ
    // còn lại hiện đúng danh sách tiêu đề tiếng Anh, nên bỏ khỏi sitemap
    // cùng lý do với từng bài.
    if (page.path === '/posts' && !includePosts) continue

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

  for (const key of VISIBLE_PILOT_KEYS) {
    const pilotPagePath = `/pilots/${PILOT_SLUG_BY_KEY[key]}`
    const currentUrl = `${DOMAIN}/${locale}${pilotPagePath}`

    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(currentUrl)}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`

    for (const altLocale of LOCALES) {
      const altUrl = `${DOMAIN}/${altLocale}${pilotPagePath}`
      xml += `    <xhtml:link rel="alternate" hreflang="${getLangIso(altLocale)}" href="${escapeXml(altUrl)}" />\n`
    }

    const defaultUrl = `${DOMAIN}/${DEFAULT_LOCALE}${pilotPagePath}`
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultUrl)}" />\n`
    xml += `    <changefreq>${PILOT_CHANGEFREQ}</changefreq>\n`
    xml += `    <priority>${PILOT_PRIORITY}</priority>\n`
    xml += '  </url>\n'
  }

  for (const post of includePosts ? posts : []) {
    const postPath = `/posts/${post.slug}`
    const currentUrl = `${DOMAIN}/${locale}${postPath}`
    const postLastmod = post.publishedAt ? new Date(post.publishedAt).toISOString() : lastmod

    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(currentUrl)}</loc>\n`
    xml += `    <lastmod>${postLastmod}</lastmod>\n`

    for (const altLocale of POST_LOCALES) {
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