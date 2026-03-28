// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true
  },

  future: {
    compatibilityVersion: 4
  },

  vite: {
    server: {
      allowedHosts: ['localhost', '.trycloudflare.com']
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'vi'
      },

      titleTemplate: '%s | Sapa Paragliding',

      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        {
          name: 'description',
          content:
            'Book paragliding in Sapa, Vietnam. Enjoy breathtaking mountain views with certified pilots, safe flights, and easy online booking.'
        },
        {
          name: 'keywords',
          content:
            'paragliding sapa, sapa paragliding, book paragliding sapa, paragliding vietnam, fly sapa, du luon sapa, dù lượn sapa'
        },
        {
          name: 'robots',
          content:
            'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        },
        {
          name: 'googlebot',
          content:
            'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        },
        {
          name: 'format-detection',
          content: 'telephone=no'
        },
        {
          name: 'theme-color',
          content: '#ffffff'
        },

        { property: 'og:site_name', content: 'Sapa Paragliding' },
        { property: 'og:locale', content: 'vi_VN' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: 'Paragliding Sapa | Book Flight Experience in Vietnam'
        },
        {
          property: 'og:description',
          content:
            'Experience paragliding in Sapa with certified pilots. Safe flights, stunning views, and simple online booking.'
        },
        {
          property: 'og:image',
          content: 'https://www.paraglidingsapa.com/images/hero-bg.jpg'
        },
        {
          property: 'og:image:alt',
          content: 'Paragliding experience in Sapa, Vietnam'
        },

        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:title',
          content: 'Paragliding Sapa | Book Flight Experience in Vietnam'
        },
        {
          name: 'twitter:description',
          content:
            'Book paragliding in Sapa with certified pilots and enjoy breathtaking views of Vietnam.'
        },
        {
          name: 'twitter:image',
          content: 'https://www.paraglidingsapa.com/images/hero-bg.jpg'
        }
      ],

      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },

        { rel: 'alternate', hreflang: 'vi-VN', href: 'https://www.paraglidingsapa.com/vi' },
        { rel: 'alternate', hreflang: 'en-US', href: 'https://www.paraglidingsapa.com/en' },
        { rel: 'alternate', hreflang: 'fr-FR', href: 'https://www.paraglidingsapa.com/fr' },
        { rel: 'alternate', hreflang: 'ru-RU', href: 'https://www.paraglidingsapa.com/ru' },
        { rel: 'alternate', hreflang: 'zh-CN', href: 'https://www.paraglidingsapa.com/zh' },
        { rel: 'alternate', hreflang: 'hi-IN', href: 'https://www.paraglidingsapa.com/hi' },
        { rel: 'alternate', hreflang: 'x-default', href: 'https://www.paraglidingsapa.com/vi' }
      ],

      script: [
        {
          type: 'application/ld+json',
          textContent: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Sapa Paragliding',
            url: 'https://www.paraglidingsapa.com',
            inLanguage: ['vi-VN', 'en-US', 'fr-FR', 'ru-RU', 'zh-CN', 'hi-IN'],
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.paraglidingsapa.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })
        },
        {
          type: 'application/ld+json',
          textContent: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Sapa Paragliding',
            url: 'https://www.paraglidingsapa.com',
            logo: 'https://www.paraglidingsapa.com/images/Sapa_logo.png',
            image: 'https://www.paraglidingsapa.com/images/hero-bg.jpg',
            description:
              'Paragliding service in Sapa, Vietnam with certified pilots and safe flight experiences.',
            telephone: '+84-386-887-489',
            email: 'sapa.paragliding@gmail.com',
            sameAs: [
              'https://facebook.com/sapaparagliding',
              'https://instagram.com/sapaparagliding',
              'https://tiktok.com/@sapaparagliding'
            ],
            contactPoint: [
              {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                telephone: '+84-386-887-489',
                areaServed: 'VN',
                availableLanguage: [
                  'Vietnamese',
                  'English',
                  'French',
                  'Russian',
                  'Chinese',
                  'Hindi'
                ]
              }
            ]
          })
        },
        {
          type: 'application/ld+json',
          textContent: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: ['Home', 'Booking', 'Pilots', 'Pre-flight Notice', 'About Us'],
            url: [
              'https://www.paraglidingsapa.com/vi',
              'https://www.paraglidingsapa.com/vi/booking',
              'https://www.paraglidingsapa.com/vi/pilots',
              'https://www.paraglidingsapa.com/vi/pre-notice',
              'https://www.paraglidingsapa.com/vi/about'
            ]
          })
        }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],

  i18n: {
    strategy: 'prefix',
    locales: [
      { code: 'vi', name: 'Tiếng Việt', iso: 'vi-VN', file: 'vi.json' },
      { code: 'en', name: 'English', iso: 'en-US', file: 'en.json' },
      { code: 'fr', name: 'Français', iso: 'fr-FR', file: 'fr.json' },
      { code: 'ru', name: 'Русский', iso: 'ru-RU', file: 'ru.json' },
      { code: 'zh', name: '中文', iso: 'zh-CN', file: 'zh.json' },
      { code: 'hi', name: 'हिन्दी', iso: 'hi-IN', file: 'hi.json' }
    ],
    defaultLocale: 'vi',
    langDir: 'locales/',
    baseUrl: 'https://www.paraglidingsapa.com',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'vi'
    }
  },

  css: ['~/assets/css/main.css'],

  experimental: {
    payloadExtraction: false
  },

  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',

    emailUser: process.env.EMAIL_USER || '',
    emailPass: process.env.EMAIL_PASS || '',
    mailFrom: process.env.MAIL_FROM || '',
    adminEmails: process.env.ADMIN_EMAILS || '',

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.paraglidingsapa.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Sapa Paragliding',
      zaloUrl: process.env.NUXT_PUBLIC_ZALO_URL || 'https://zalo.me/84386887489',
      whatsappUrl: process.env.NUXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/84386887489',
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ''
    }
  }
})