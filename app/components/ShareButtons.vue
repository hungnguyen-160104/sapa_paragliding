<template>
  <div
    :class="[
      'inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-1.5',
      dark
        ? 'border-white/15 bg-white/5 backdrop-blur-md'
        : 'border-gray-200 bg-white shadow-sm'
    ]"
  >
    <span :class="['text-xs font-semibold', dark ? 'text-white/75' : 'text-gray-500']">{{ label }}:</span>

    <div class="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        :class="[btnBase, 'bg-[#1877F2] hover:bg-[#0F62D6]']"
        aria-label="Facebook"
        title="Facebook"
        @click="shareFacebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.93 8.44-9.94Z" />
        </svg>
      </button>

      <button
        type="button"
        :class="[btnBase, 'bg-[#0068FF] hover:bg-[#0055D4]']"
        aria-label="Zalo"
        title="Zalo"
        @click="shareZalo"
      >
        <span class="text-[10px] font-black leading-none tracking-tight">Zalo</span>
      </button>

      <button
        type="button"
        :class="[btnBase, 'bg-black hover:bg-neutral-800']"
        aria-label="X (Twitter)"
        title="X (Twitter)"
        @click="shareX"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z" />
        </svg>
      </button>

      <button
        type="button"
        :class="[btnBase, copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-500 hover:bg-sky-600']"
        :aria-label="copied ? t.copied : t.copyLink"
        :title="copied ? t.copied : t.copyLink"
        @click="copyLink"
      >
        <svg
          v-if="copied"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
          <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
          <path d="M8 12h8" />
        </svg>
      </button>

      <button
        v-if="canNativeShare"
        type="button"
        :class="[btnBase, 'bg-violet-500 hover:bg-violet-600']"
        :aria-label="t.nativeShare"
        :title="t.nativeShare"
        @click="nativeShare"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
    </div>

    <span v-if="copied" class="text-[11px] font-medium text-emerald-500">{{ t.copied }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * Hàng nút chia sẻ dùng chung cho bài viết / điểm bay.
 *
 * Link chia sẻ lấy từ URL đang xem lúc bấm (window.location) nên tự đúng cho
 * mọi bản ngôn ngữ (/en/posts/..., /fr/posts/...) mà không cần truyền props.
 * Máy có Web Share API sẽ hiện thêm nút gọi bảng chia sẻ của hệ điều hành.
 */

type Lang = 'vi' | 'en' | 'fr' | 'ru' | 'zh' | 'hi'

const props = withDefaults(
  defineProps<{
    /** Đổi nhãn cho hợp ngữ cảnh trang. */
    variant?: 'generic' | 'article' | 'spot'
    /** Tiêu đề kèm khi chia sẻ (X, Web Share API). */
    title?: string
    /** Đặt trên nền tối thì bật, để nền nút trong suốt thay vì nền trắng. */
    dark?: boolean
  }>(),
  { variant: 'generic', title: '', dark: false }
)

const I18N: Record<Lang, Record<string, string>> = {
  vi: { share: 'Chia sẻ', shareArticle: 'Chia sẻ bài viết', shareSpot: 'Chia sẻ điểm bay', copyLink: 'Sao chép liên kết', copied: 'Đã sao chép!', nativeShare: 'Chia sẻ' },
  en: { share: 'Share', shareArticle: 'Share this post', shareSpot: 'Share this flying site', copyLink: 'Copy link', copied: 'Copied!', nativeShare: 'Share' },
  fr: { share: 'Partager', shareArticle: 'Partager cet article', shareSpot: 'Partager ce site de vol', copyLink: 'Copier le lien', copied: 'Copié !', nativeShare: 'Partager' },
  ru: { share: 'Поделиться', shareArticle: 'Поделиться статьёй', shareSpot: 'Поделиться местом полётов', copyLink: 'Скопировать ссылку', copied: 'Скопировано!', nativeShare: 'Поделиться' },
  zh: { share: '分享', shareArticle: '分享这篇文章', shareSpot: '分享此飞行点', copyLink: '复制链接', copied: '已复制！', nativeShare: '分享' },
  hi: { share: 'साझा करें', shareArticle: 'यह लेख साझा करें', shareSpot: 'यह उड़ान स्थल साझा करें', copyLink: 'लिंक कॉपी करें', copied: 'कॉपी हो गया!', nativeShare: 'साझा करें' }
}

const { locale } = useI18n()

const btnBase =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md ring-1 ring-white/25 transition-all hover:scale-110 hover:shadow-lg'

const t = computed(() => {
  const code = String(locale.value ?? 'vi').slice(0, 2).toLowerCase() as Lang
  return I18N[code] ?? I18N.vi
})

const label = computed(() => {
  if (props.variant === 'article') return t.value.shareArticle
  if (props.variant === 'spot') return t.value.shareSpot
  return t.value.share
})

const copied = ref(false)

// Chỉ biết máy có Web Share API sau khi lên trình duyệt. Để false lúc SSR
// rồi bật ở onMounted, tránh lệch HTML khi hydrate.
const canNativeShare = ref(false)
onMounted(() => {
  canNativeShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

/** URL đang xem, bỏ query/hash để link chia sẻ luôn sạch. */
function currentUrl(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}`
}

function openPopup(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer,width=640,height=640')
}

function shareFacebook() {
  openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`)
}

function shareZalo() {
  openPopup(`https://sp.zalo.me/plugins/share?u=${encodeURIComponent(currentUrl())}`)
}

function shareX() {
  const text = props.title ? `&text=${encodeURIComponent(props.title)}` : ''
  openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl())}${text}`)
}

async function copyLink() {
  const url = currentUrl()

  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // Trình duyệt cũ hoặc không cấp quyền clipboard — dùng cách thủ công
    const el = document.createElement('textarea')
    el.value = url
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  copied.value = true
  window.setTimeout(() => (copied.value = false), 2000)
}

async function nativeShare() {
  try {
    await navigator.share({ title: props.title || document.title, url: currentUrl() })
  } catch {
    // người dùng huỷ bảng chia sẻ — không cần báo lỗi
  }
}
</script>
