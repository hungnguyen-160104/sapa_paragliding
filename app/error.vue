<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 py-16 text-center">
    <p class="text-7xl font-black text-red-500 md:text-8xl">{{ statusCode }}</p>

    <h1 class="mt-4 text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
      {{ heading }}
    </h1>

    <p class="mt-3 max-w-md text-base leading-relaxed text-slate-300">
      {{ message }}
    </p>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <NuxtLink
        :to="homePath"
        class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-7 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
      >
        {{ copy.home }}
      </NuxtLink>

      <NuxtLink
        :to="postsPath"
        class="inline-flex items-center justify-center rounded-xl border border-white/30 px-7 py-3 font-bold text-white transition-colors duration-300 hover:bg-white/10"
      >
        {{ copy.posts }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Trang lỗi dùng chung. Trước đây dự án KHÔNG có file này, nên URL sai rơi về
 * khung lỗi trần của Nuxt — trên Vercel còn hiện "500 - Server Error" thay vì
 * 404, tức là báo sai cả với người dùng lẫn với Google.
 *
 * Cố ý KHÔNG dùng $t: trang lỗi có thể render trước khi ngữ cảnh i18n sẵn
 * sàng (và với URL không khớp route nào thì không suy ra được locale từ
 * router). Dùng $t ở đây chính là kiểu lỗi làm hỏng trang lỗi rồi bị Nuxt hạ
 * xuống thành 500. Nên tự tra locale từ đường dẫn và dùng bảng chữ tĩnh.
 */
const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode ?? 500)

const LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi'] as const
type LocaleCode = (typeof LOCALES)[number]

const route = useRoute()

const currentLocale = computed<LocaleCode>(() => {
  const first = route.path.split('/').filter(Boolean)[0]
  return LOCALES.includes(first as LocaleCode) ? (first as LocaleCode) : 'vi'
})

const TEXT: Record<LocaleCode, {
  notFound: string
  notFoundBody: string
  serverError: string
  serverErrorBody: string
  home: string
  posts: string
}> = {
  vi: {
    notFound: 'Không tìm thấy trang',
    notFoundBody: 'Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Hãy quay lại trang chủ để tiếp tục.',
    serverError: 'Có lỗi xảy ra',
    serverErrorBody: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.',
    home: 'Về trang chủ',
    posts: 'Xem bài viết'
  },
  en: {
    notFound: 'Page not found',
    notFoundBody: 'The page you are looking for does not exist or has been moved. Head back to the homepage to continue.',
    serverError: 'Something went wrong',
    serverErrorBody: 'The server ran into a problem. Please try again in a few minutes.',
    home: 'Back to homepage',
    posts: 'Read our posts'
  },
  fr: {
    notFound: 'Page introuvable',
    notFoundBody: "La page que vous cherchez n'existe pas ou a été déplacée. Revenez à l'accueil pour continuer.",
    serverError: 'Une erreur est survenue',
    serverErrorBody: 'Le serveur rencontre un problème. Veuillez réessayer dans quelques minutes.',
    home: "Retour à l'accueil",
    posts: 'Voir les articles'
  },
  ru: {
    notFound: 'Страница не найдена',
    notFoundBody: 'Запрошенная страница не существует или была перемещена. Вернитесь на главную, чтобы продолжить.',
    serverError: 'Произошла ошибка',
    serverErrorBody: 'На сервере возникла проблема. Попробуйте ещё раз через несколько минут.',
    home: 'На главную',
    posts: 'Читать статьи'
  },
  zh: {
    notFound: '页面未找到',
    notFoundBody: '您访问的页面不存在或已被移动。请返回首页继续浏览。',
    serverError: '出错了',
    serverErrorBody: '服务器遇到问题，请稍后再试。',
    home: '返回首页',
    posts: '查看文章'
  },
  hi: {
    notFound: 'पेज नहीं मिला',
    notFoundBody: 'आप जो पेज ढूंढ रहे हैं वह मौजूद नहीं है या हटा दिया गया है। जारी रखने के लिए होमपेज पर लौटें।',
    serverError: 'कुछ गलत हो गया',
    serverErrorBody: 'सर्वर में समस्या आई है। कृपया कुछ मिनट बाद पुनः प्रयास करें।',
    home: 'होमपेज पर जाएँ',
    posts: 'लेख पढ़ें'
  }
}

const copy = computed(() => TEXT[currentLocale.value])
const isNotFound = computed(() => statusCode.value === 404)

const heading = computed(() => (isNotFound.value ? copy.value.notFound : copy.value.serverError))
const message = computed(() => (isNotFound.value ? copy.value.notFoundBody : copy.value.serverErrorBody))

// Tự dựng đường dẫn thay vì localePath(): route hiện tại không khớp route nào
// nên composable của i18n không đáng tin ở đây.
const homePath = computed(() => `/${currentLocale.value}`)
const postsPath = computed(() => `/${currentLocale.value}/posts`)

useHead({
  title: computed(() => `${statusCode.value} — ${heading.value}`),
  meta: [{ name: 'robots', content: 'noindex, follow' }]
})
</script>
