// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },

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
                { name: 'description', content: 'Experience the dream of flying in Sapa - Where you feel freedom and the sky closer than ever.' },
                { property: 'og:title', content: 'Sapa Paragliding' },
                { property: 'og:description', content: 'Book your paragliding adventure in Sapa, Vietnam' },
                { property: 'og:image', content: '/images/hero-bg.jpg' },
                { property: 'og:type', content: 'website' }
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
            ]
        }
    },

    modules: [
        '@nuxtjs/tailwindcss',
        '@nuxtjs/i18n',
        '@pinia/nuxt'
    ],

    i18n: {
        // URL: / (vi là mặc định), /en/...
        strategy: 'prefix',
        locales: [
            { code: 'vi', name: 'Tiếng Việt', iso: 'vi-VN', file: 'vi.json' },
            { code: 'en', name: 'English', iso: 'en-US', file: 'en.json' },
            { code: 'fr', name: 'Français', iso: 'fr-FR', file: 'fr.json' },
            { code: 'ru', name: 'Русский', iso: 'ru-RU', file: 'ru.json' },
            { code: 'zh', name: '中文', iso: 'zh-CN', file: 'zh.json' },
            {code: 'hi',name: 'हिन्दी',iso: 'hi-IN',file: 'hi.json'}
        ],
        defaultLocale: 'vi',
        langDir: 'locales/',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root'
        }
    },

    css: [
        '~/assets/css/main.css'
    ],

    experimental: {
        payloadExtraction: false
    },

    runtimeConfig: {
        // Private keys (server-side only) - MUST be set via environment variables
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
        telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
        turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || '',

        // Public keys (exposed to client)
        public: {
            zaloUrl: process.env.NUXT_PUBLIC_ZALO_URL || 'https://zalo.me/84386887489',
            whatsappUrl: process.env.NUXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/84386887489',
            cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
            cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
            turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ''
        }
    }
})
