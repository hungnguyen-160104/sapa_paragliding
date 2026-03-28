/**
 * SEO Utilities for Nuxt / i18n
 * Helper functions for canonical URLs, hreflang, and structured data
 */

export const DOMAIN = 'https://www.paraglidingsapa.com'

export const SUPPORTED_LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi']
export const DEFAULT_LOCALE = 'vi'

// Map locale code to hreflang syntax
export const localeToHreflang: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  fr: 'fr-FR',
  ru: 'ru-RU',
  zh: 'zh-CN',
  hi: 'hi-IN'
}

/**
 * Build canonical URL for current page
 */
export const getCanonicalUrl = (route: any, locale: string): string => {
  if (!route) return DOMAIN

  const rawPath = route.path || '/'
  // Determine if path has the current locale prefix, strip it for clean path
  const regex = new RegExp(`^/${locale}(/|$)`)
  const cleanPath = rawPath.replace(regex, '/')
  const safeCleanPath = cleanPath === '/' ? '' : cleanPath

  // Since strategy is 'prefix', EVERY language gets a prefix (e.g. /vi/..., /en/...)
  const url = `${DOMAIN}/${locale}${safeCleanPath}`

  return url.replace(/\/$/, '') || DOMAIN
}

/**
 * Build hreflang links for all locales
 */
export const buildHreflangLinks = (basePath: string, currentLocale: string) => {
  const links: any[] = []

  // Ensure clean base path
  const regex = new RegExp(`^/${currentLocale}(/|$)`)
  const cleanPath = basePath.replace(regex, '/')
  const safeCleanPath = cleanPath === '/' ? '' : cleanPath

  SUPPORTED_LOCALES.forEach(locale => {
    links.push({
      rel: 'alternate',
      hreflang: localeToHreflang[locale],
      href: `${DOMAIN}/${locale}${safeCleanPath}`.replace(/\/$/, '') || DOMAIN
    })
  })

  // Add x-default (points to vi prefix)
  links.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${DOMAIN}/${DEFAULT_LOCALE}${safeCleanPath}`.replace(/\/$/, '') || DOMAIN
  })

  return links
}

/**
 * Build JSON-LD for Organization
 */
export const buildOrganizationJsonLD = (locale: string = 'en') => {
  const labels: Record<string, any> = {
    vi: {
      name: 'Sapa Paragliding',
      description: 'Trải nghiệm bay lượn tại Sapa - Nơi bạn cảm nhận tự do và bầu trời gần hơn bao giờ hết'
    },
    en: {
      name: 'Sapa Paragliding',
      description: 'Experience the dream of flying in Sapa - Where you feel freedom and the sky closer than ever'
    },
    fr: {
      name: 'Sapa Paragliding',
      description: 'Vivez l\'aventure du vol à voile à Sapa - Où vous ressentez la liberté et le ciel plus proche que jamais'
    },
    ru: {
      name: 'Sapa Paragliding',
      description: 'Испытайте удовольствие полета на параплане в Сапе - Где вы чувствуете свободу и небо ближе, чем когда-либо'
    },
    zh: {
      name: 'Sapa Paragliding',
      description: '在沙坝体验滑翔伞飞行 - 感受自由和天空比以往任何时候都更近'
    },
    hi: {
      name: 'Sapa Paragliding',
      description: 'सापा में पैराग्लाइडिंग का अनुभव लें - जहाँ आप स्वतंत्रता और आकाश को पहले से कहीं अधिक करीब महसूस करते हैं'
    }
  }

  const label = labels[locale] || labels.en

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: label.name,
    url: DOMAIN,
    logo: `${DOMAIN}/images/Sapa_logo.png`,
    description: label.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+84-386-887-489'
    },
    sameAs: [
      'https://facebook.com/sapaparagliding',
      'https://instagram.com/sapaparagliding',
      'https://tiktok.com/@sapaparagliding'
    ]
  }
}

/**
 * Build JSON-LD for Website
 */
export const buildWebsiteJsonLD = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: DOMAIN,
    name: 'Sapa Paragliding',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DOMAIN}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * Generate page title based on locale and route
 */
export const getPageTitle = (route: any, locale: string, t: Function): string => {
  const path = route.path.replace(`/${locale}`, '').replace(/\/$/, '') || '/'

  const titles: Record<string, string> = {
    '/': 'menu.home',
    '/booking': 'menu.booking',
    '/about': 'menu.about',
    '/pilots': 'menu.pilots',
    '/posts': 'menu.posts',
    '/pre-notice': 'menu.preNotice'
  }

  return t(titles[path] || 'hero.title') || 'Sapa Paragliding'
}
