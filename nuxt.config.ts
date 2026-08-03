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
      title: 'Sapa Paragliding',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image'
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
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  image: {
    format: ['webp'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },

  nitro: {
    compressPublicAssets: true,
    minify: true
  },

  runtimeConfig: {
    // Chỉ ở phía server (không nằm trong public) nên không lộ ra trình duyệt
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

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
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      gaId: process.env.NUXT_PUBLIC_GA_ID || 'G-2HK1VGSVMP'
    }
  }
})