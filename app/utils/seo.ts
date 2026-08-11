import { TAKEOFF_OFFICE, LANDING_OFFICE } from '~~/shared/flying-site'

/**
 * SEO Utilities for Nuxt / i18n
 * Centralized helpers for canonical URLs, hreflang, OG locale and JSON-LD.
 */

export const DOMAIN = 'https://www.paraglidingsapa.com'

export const SUPPORTED_LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
// 'en': x-default hreflang tro ve ban tieng Anh — khach khong khop ngon
// ngu nao (da so la khach quoc te) duoc Google dua ve /en thay vi /vi.
export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const localeToHreflang: Record<SupportedLocale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  fr: 'fr-FR',
  ru: 'ru-RU',
  zh: 'zh-CN',
  hi: 'hi-IN'
}

type RouteLike = {
  path?: string
}

type BreadcrumbItem = {
  name: string
  item: string
}

type PersonSchemaInput = {
  name: string
  description: string
  url: string
  image?: string
  jobTitle?: string
}

export const normalizePath = (path?: string): string => {
  if (typeof path !== 'string' || path.length === 0) return '/'

  const noQuery = path.split('?')[0] ?? ''
  const noHash = noQuery.split('#')[0] ?? ''
  const cleanPath = noHash.replace(/\/+/g, '/')

  if (cleanPath.length === 0) return '/'

  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
}

export const stripLocalePrefix = (path?: string): string => {
  const normalizedPath = normalizePath(path)
  const localePattern = SUPPORTED_LOCALES.join('|')
  const regex = new RegExp(`^/(${localePattern})(?=/|$)`)
  const strippedPath = normalizedPath.replace(regex, '') || '/'

  return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`
}

export const buildLocalizedPath = (path: string, locale: string): string => {
  const normalizedLocale: SupportedLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE

  const cleanPath = stripLocalePrefix(path)

  return cleanPath === '/' ? `/${normalizedLocale}` : `/${normalizedLocale}${cleanPath}`
}

const joinUrl = (base: string, path: string): string => {
  const normalizedBase = base.replace(/\/$/, '')
  const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '')
  return `${normalizedBase}${normalizedPath}`
}

export const buildLocalizedUrl = (path: string, locale: string): string => {
  return joinUrl(DOMAIN, buildLocalizedPath(path, locale))
}

export const getCanonicalUrl = (route: RouteLike, locale: string): string => {
  return buildLocalizedUrl(route.path ?? '/', locale)
}

/**
 * Ngôn ngữ mà BÀI VIẾT thực sự có bản dịch riêng.
 *
 * Bài trong cơ sở dữ liệu chỉ có hai bản: tiếng Anh (title/contentBlocks) và
 * tiếng Việt (titleVi/contentBlocksVi). Bốn địa chỉ còn lại — /fr /ru /zh /hi
 * — vẫn mở được nhưng nội dung y hệt bản tiếng Anh, tức mỗi bài đang có thêm
 * bốn bản sao. Đó chính là thứ Search Console báo về: "Trang trùng lặp,
 * Google đã chọn một trang chính tắc khác" và hàng loạt "đã thu thập dữ liệu
 * — hiện chưa được lập chỉ mục".
 *
 * Các trang tĩnh (trang chủ, bảng giá, đặt bay...) thì dịch đủ sáu thứ tiếng
 * trong i18n, nên hằng số này CHỈ áp cho bài viết.
 */
export const POST_LOCALES: SupportedLocale[] = ['vi', 'en']

/** Bài chưa dịch thì bản tiếng Anh là bản gốc để Google lập chỉ mục. */
export const POST_SOURCE_LOCALE: SupportedLocale = 'en'

export const buildHreflangLinks = (
  basePath: string,
  _currentLocale: string,
  locales: readonly SupportedLocale[] = SUPPORTED_LOCALES
) => {
  const cleanPath = stripLocalePrefix(basePath)

  const links = locales.map((locale) => ({
    rel: 'alternate',
    hreflang: localeToHreflang[locale],
    href: joinUrl(DOMAIN, buildLocalizedPath(cleanPath, locale))
  }))

  links.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: joinUrl(
      DOMAIN,
      buildLocalizedPath(cleanPath, locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0]!)
    )
  })

  return links
}

export const getOgLocale = (locale: string): string => {
  const normalizedLocale: SupportedLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE

  return localeToHreflang[normalizedLocale].replace('-', '_')
}

/** 1200x630 — tỉ lệ chuẩn cho Open Graph / Twitter card. */
export const getDefaultOgImage = (): string => `${DOMAIN}/images/og-default.jpg`

export const buildOrganizationJsonLD = (locale: string = 'en') => {
  const labels: Record<SupportedLocale, { name: string; description: string }> = {
    vi: {
      name: 'Sapa Paragliding',
      description:
        'Trải nghiệm bay lượn tại Sapa - Nơi bạn cảm nhận tự do và bầu trời gần hơn bao giờ hết'
    },
    en: {
      name: 'Sapa Paragliding',
      description:
        'Experience the dream of flying in Sapa - Where you feel freedom and the sky closer than ever'
    },
    fr: {
      name: 'Sapa Paragliding',
      description:
        "Vivez l'aventure du vol à voile à Sapa - Où vous ressentez la liberté et le ciel plus proche que jamais"
    },
    ru: {
      name: 'Sapa Paragliding',
      description:
        'Испытайте удовольствие полета на параплане в Сапе - Где вы чувствуете свободу и небо ближе, чем когда-либо'
    },
    zh: {
      name: 'Sapa Paragliding',
      description: '在沙坝体验滑翔伞飞行 - 感受自由和天空比以往任何时候都更近'
    },
    hi: {
      name: 'Sapa Paragliding',
      description:
        'सापा में पैराग्लाइडिंग का अनुभव लें - जहाँ आप स्वतंत्रता और आकाश को पहले से कहीं अधिक करीब महसूस करते हैं'
    }
  }

  const normalizedLocale: SupportedLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE

  const label = labels[normalizedLocale]

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: label.name,
    url: DOMAIN,
    logo: `${DOMAIN}/images/Sapa_logo.png`,
    image: getDefaultOgImage(),
    email: 'sapa.paragliding@gmail.com',
    description: label.description,
    sameAs: [
      'https://www.facebook.com/bayduluonsapa',
      'https://www.instagram.com/SAPA_PARAGLIDING',
      'https://www.tiktok.com/@sapa_paragliding',
      // Listing OTA chinh chu — khai bao de Google gom tin hieu review/entity
      // ve cung mot doanh nghiep (chu KHONG phai listing cua Fly Sapa doi thu).
      'https://www.tripadvisor.com/Attraction_Review-g311304-d33242005-Reviews-Paragliding_Experience_in_Sapa_Hotel_Pickup_and_Drop_off-Sapa_Lao_Cai_Province.html',
      'https://www.klook.com/en-US/activity/158451-paragliding-experience-in-sapa/',
      'https://www.viator.com/tours/Sapa/Paragliding-Experience-in-Sapa-Hotel-Pickup-and-Drop-off/d50492-5583754P4',
      'https://www.getyourguide.com/en-gb/sapa-paraglidingjsc-s680385/',
      'https://www.getyourguide.com/en-gb/sa-pa-l1049/paragliding-adventure-in-sapa-with-top-vietnamese-pilots-t1128335/',
      'https://www.seeksophie.com/experiences/sapa-sapa-paragliding-over-terraced-valleys-o32jl0rgj6',
      'https://www.youtube.com/@sapa.paragliding'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+84-386-887-489',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese', 'English', 'French', 'Russian', 'Chinese', 'Hindi']
      }
    ]
  }
}

export const buildWebsiteJsonLD = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: DOMAIN,
    name: 'Sapa Paragliding',
    inLanguage: SUPPORTED_LOCALES.map((locale) => localeToHreflang[locale])
  }
}

export const buildBreadcrumbJsonLD = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  }
}

export const buildPersonJsonLD = (person: PersonSchemaInput) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description: person.description,
    jobTitle: person.jobTitle,
    url: person.url,
    image: person.image
  }
}

type BlogPostingInput = {
  title: string
  description: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
}

export const buildBlogPostingJsonLD = (post: BlogPostingInput) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author || 'Admin'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sapa Paragliding',
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/images/Sapa_logo.png`
      }
    },
    url: post.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url
    }
  }
}

export const buildLocalBusinessJsonLD = (locale: string = 'en') => {
  const descriptions: Record<SupportedLocale, string> = {
    vi: 'Trải nghiệm bay dù lượn đôi tại điểm cất cánh cao nhất Việt Nam. Phi công quốc tế chuyên nghiệp, hơn 50.000 khách hàng, an toàn tuyệt đối.',
    en: 'Experience tandem paragliding at the highest takeoff site in Vietnam. Professional international pilots, 50,000+ customers, 100% safety record.',
    fr: "Vol en parapente tandem au site de décollage le plus haut du Vietnam. Pilotes professionnels internationaux, plus de 50 000 clients, sécurité 100%.",
    ru: 'Тандемный полёт на параплане с самой высокой точки взлёта во Вьетнаме. Профессиональные пилоты, более 50 000 довольных клиентов.',
    zh: '在越南最高起飞点体验双人滑翔伞。专业国际飞行员，超过5万名客户，100%安全记录。',
    hi: 'वियतनाम के सबसे ऊंचे टेकऑफ साइट पर टैंडम पैराग्लाइडिंग का अनुभव करें। पेशेवर अंतरराष्ट्रीय पायलट, 50,000+ ग्राहक।'
  }

  const normalizedLocale: SupportedLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : DEFAULT_LOCALE

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SportsActivityLocation', 'TouristAttraction'],
    '@id': `${DOMAIN}/#business`,
    name: 'SAPA PARAGLIDING',
    alternateName: 'Dù Lượn Sapa',
    url: DOMAIN,
    logo: `${DOMAIN}/images/Sapa_logo.png`,
    image: `${DOMAIN}/images/hero.jpeg`,
    description: descriptions[normalizedLocale],
    telephone: '+84386887489',
    email: 'sapa.paragliding@gmail.com',
    priceRange: '2.190.000 VND/pax',
    currenciesAccepted: 'VND',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    // Trụ sở chính = văn phòng Bản Hang Đá, cũng là bãi cất cánh.
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tổ 3, Bản Hang Đá',
      addressLocality: 'Phường Sa Pa',
      addressRegion: 'Lào Cai',
      addressCountry: 'VN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: TAKEOFF_OFFICE.latitude,
      longitude: TAKEOFF_OFFICE.longitude
    },
    // Văn phòng thứ hai tại Cầu Lao Chải (bãi hạ cánh). Khai bằng
    // `department` — cách schema.org mô tả một cơ sở khác của cùng doanh
    // nghiệp, để Google hiểu công ty có hai địa điểm hoạt động thật.
    department: [
      {
        '@type': 'LocalBusiness',
        name: `SAPA PARAGLIDING — ${LANDING_OFFICE.name}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Cầu Lao Chải',
          addressLocality: 'Xã Tả Van',
          addressRegion: 'Lào Cai',
          addressCountry: 'VN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: LANDING_OFFICE.latitude,
          longitude: LANDING_OFFICE.longitude
        },
        hasMap: LANDING_OFFICE.mapUrl,
        telephone: '+84386887489'
      }
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '06:00',
        closes: '18:00'
      }
    ],
    sameAs: [
      'https://www.facebook.com/bayduluonsapa',
      'https://www.instagram.com/SAPA_PARAGLIDING',
      'https://www.tiktok.com/@sapa_paragliding',
      // Listing OTA chinh chu — khai bao de Google gom tin hieu review/entity
      // ve cung mot doanh nghiep (chu KHONG phai listing cua Fly Sapa doi thu).
      'https://www.tripadvisor.com/Attraction_Review-g311304-d33242005-Reviews-Paragliding_Experience_in_Sapa_Hotel_Pickup_and_Drop_off-Sapa_Lao_Cai_Province.html',
      'https://www.klook.com/en-US/activity/158451-paragliding-experience-in-sapa/',
      'https://www.viator.com/tours/Sapa/Paragliding-Experience-in-Sapa-Hotel-Pickup-and-Drop-off/d50492-5583754P4',
      'https://www.getyourguide.com/en-gb/sapa-paraglidingjsc-s680385/',
      'https://www.getyourguide.com/en-gb/sa-pa-l1049/paragliding-adventure-in-sapa-with-top-vietnamese-pilots-t1128335/',
      'https://www.seeksophie.com/experiences/sapa-sapa-paragliding-over-terraced-valleys-o32jl0rgj6',
      'https://www.youtube.com/@sapa.paragliding'
    ],
    hasMap: TAKEOFF_OFFICE.mapUrl,
    sport: 'Paragliding'
  }
}

export const buildFAQPageJsonLD = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export const getPageTitle = (route: RouteLike, _locale: string, t: (key: string) => string): string => {
  const rawPath = route.path ?? '/'
  const path = stripLocalePrefix(rawPath).replace(/\/$/, '') || '/'

  const titles: Record<string, string> = {
    '/': 'menu.home',
    '/booking': 'menu.booking',
    '/prices': 'menu.prices',
    '/flying-site': 'menu.flyingSite',
    '/about': 'menu.about',
    '/pilots': 'menu.pilots',
    '/posts': 'menu.posts',
    '/pre-notice': 'menu.preNotice'
  }

  return t(titles[path] || 'hero.title') || 'Sapa Paragliding'
}
/**
 * Cắt meta description về tối đa ~160 ký tự tại ranh giới từ.
 *
 * Bài viết dùng excerpt làm meta description, mà excerpt viết cho người đọc
 * trên thẻ bài nên hay dài 190–220 ký tự — Google cắt cụt ở ~160 kèm dấu "…"
 * giữa chừng câu. Cắt chủ động tại ranh giới từ thì đoạn hiển thị trên kết
 * quả tìm kiếm luôn gọn và trọn vẹn.
 *
 * Cắt ở tầng render thay vì sửa dữ liệu từng bài: excerpt trên trang vẫn giữ
 * nguyên bản đầy đủ, và mọi bài đăng sau này tự được xử lý.
 */
export const truncateMetaDescription = (text: string, maxLength = 160): string => {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) return trimmed

  const slice = trimmed.slice(0, maxLength)
  // Lùi về khoảng trắng gần nhất để không cắt giữa từ; nếu khoảng trắng nằm
  // quá xa (chuỗi không dấu cách, ví dụ tiếng Trung) thì giữ nguyên lát cắt.
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > maxLength - 30 ? slice.slice(0, lastSpace) : slice

  return `${cut.replace(/[,;:–—-]$/, '')}…`
}
