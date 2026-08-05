<template>
  <div>
    <!-- Horizontal Header Bar (static, part of page) -->
    <header class="relative bg-white/95 backdrop-blur-md shadow-lg" style="position: relative; z-index: 60;">
      <!-- min-h-20: vẫn 80px như đã chốt, nhưng cho phép nở ra thay vì cắt mất
           nội dung. Cần thiết vì trên điện thoại 6 nút ngôn ngữ (đã to lên)
           cộng chữ thương hiệu buộc hàng nút phải xuống dòng. -->
      <div class="container-custom flex items-center justify-between min-h-20 py-1">
        <!-- Logo -->
        <!-- min-w-0 cho phép khối logo+chữ co lại thay vì đẩy nút ngôn ngữ
             ra ngoài: tiếng Nga 20 ký tự tràn ~25px trên máy 390px -->
        <NuxtLink :to="localePath('/')"
          class="flex min-w-0 items-center gap-1.5 lg:gap-3 hover:opacity-80 transition-opacity">
          <!-- Bản đã cắt bỏ chữ "SAPA PARAGLIDING" trong ảnh (trùng với chữ bên
               cạnh). Ảnh gốc 1000x1000 có hình chỉ chiếm 670px chiều cao, nên
               trong khung 80px hình chỉ cao 53.6px. Bản cắt 820x670 lấp trọn
               khung -> hình to lên 49% mà khung menu vẫn giữ đúng 80px.
               Sapa_logo.png (bản đầy đủ) vẫn dùng cho JSON-LD và ảnh chia sẻ. -->
          <!-- width/height BẮT BUỘC: thiếu thì @nuxt/image lấy mốc màn lớn
               nhất và yêu cầu bản w=1536 (~39 KB) cho một logo chỉ cao 65px,
               trên MỌI trang. Ảnh gốc 820x670, hiển thị cao tối đa 65px tức
               ~80px ngang; đặt 200px là đã dư cho màn hình 2x. -->
          <NuxtImg src="/images/Sapa_logo_mark.png" alt="Sapa Paragliding Logo"
            width="200" height="163"
            class="h-12 lg:h-[4.05rem] w-auto shrink-0 object-contain" format="webp"
            @error="handleLogoError" />

          <!-- MOBILE/TABLET (<lg): tách 2 dòng ("DÙ LƯỢN" / "SAPA"). Để 1 hàng
               thì dòng dài 12 ký tự chen với 6 nút ngôn ngữ nên bị đè; tách 2
               dòng thì dòng dài nhất chỉ còn 7 ký tự, vừa hết chật vừa cho
               phép chữ to hơn (13px -> 15px).

               leading PHẢI >= 1: truncate đặt overflow:hidden, nên line-height
               nhỏ hơn 1 (trước là 0.95) làm hộp dòng thấp hơn chữ và CẮT MẤT
               dấu tiếng Việt — dấu huyền trên chữ Ù và dấu nặng dưới chữ Ợ
               trong "DÙ LƯỢN". Chỉ tiếng Việt bị vì các ngôn ngữ khác không
               có dấu chồng trên/dưới. 1.15 đủ chỗ cho cả dấu trên lẫn dưới. -->
          <div
            class="flex lg:hidden min-w-0 flex-col justify-center leading-[1.15] text-[#194d9b] font-black [-webkit-text-stroke:0.8px_#194d9b]">
            <span class="truncate" :class="brandTextSize">{{ brandLines[0] }}</span>
            <span v-if="brandLines[1]" class="truncate" :class="brandTextSize">{{ brandLines[1] }}</span>
          </div>

          <!-- DESKTOP (xl+): tách 2 dòng cân đối.
               leading 0.9: nới thêm một chút từ 0.8325 vì hai dòng vẫn hơi
               sát. Mức 70% (0.65) từng thử và làm "DÙ LƯỢN" với "SAPA" dính
               hẳn vào nhau, nên chỉ tăng dần từng nấc nhỏ.
               Ẩn ở dải 1024-1279px vì menu ngang 8 mục chiếm hết chỗ.
               Màu #194d9b lấy từ .text-stroke-sapa. -->
          <div class="hidden xl:flex flex-col justify-center leading-[0.9] text-[#194d9b] font-black">
            <span class="text-[1.35rem] 2xl:text-2xl">{{ brandLines[0] }}</span>
            <span v-if="brandLines[1]" class="text-[1.35rem] 2xl:text-2xl">{{ brandLines[1] }}</span>
          </div>
        </NuxtLink>

        <!-- Menu Items (Desktop) — hiện từ 1024px.
             Cỡ chữ và khoảng cách phải co theo bề ngang, nếu không 8 mục menu
             tiếng Việt/Pháp sẽ tràn. Ở 1024px khoảng cách phải hẹp (gap-2) để
             bù cho cỡ chữ đã tăng và logo 105.6px. -->
        <nav class="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4">
          <!-- Gạch chân dưới từng mục: 8 mục cùng cỡ chữ, cùng màu, nằm sát
               nhau nên nhìn thành một dải chữ liền. Gạch chân cắt chúng thành
               từng khối rõ ràng.

               Màu lấy đúng từ bộ nhận diện:
                 #194d9b — xanh của chữ thương hiệu "DÙ LƯỢN SAPA" (cũng là
                           màu trong .text-stroke-sapa)
                 #f02424 — đỏ của logo, lấy mẫu trực tiếp từ Sapa_logo_mark.png
                           (màu chủ đạo, 57k điểm ảnh)
               Mục đang mở đổi sang đỏ để nổi hẳn khỏi dải xanh còn lại.

               border-b chứ không phải underline: underline bám sát chân chữ
               nên bị dấu tiếng Việt (dấu nặng ở "Bảng Giá", "Phi Công") đè lên
               và mỗi mục một độ cao khác nhau. Viền dưới nằm ở đáy hộp nên
               luôn thẳng hàng. -->
          <NuxtLink v-for="item in menuItems" :key="item.path" :to="getLocalizedPath(item.path)"
            :class="[
              'uppercase whitespace-nowrap text-gray-700 hover:text-[#f02424] font-bold transition-colors',
              'border-b-[3px] border-[#194d9b] pb-1',
              navTextSize
            ]"
            active-class="!text-[#f02424] !border-[#f02424]">
            {{ $t(item.label) }}
          </NuxtLink>
        </nav>

        <!-- Right Controls
             shrink-0: nhóm nút không bao giờ bị bóp, nên chữ thương hiệu bên
             trái phải tự truncate thay vì đè lên. Đây là chốt chặn cứng, không
             phụ thuộc ước lượng bề rộng ký tự của từng ngôn ngữ. -->
        <div ref="headerControlsRef" class="flex shrink-0 items-center gap-1.5 lg:gap-3">
          <!-- Menu Button (Mobile) -->
          <button @click.stop="toggleMenu"
            class="lg:hidden shrink-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-300"
            aria-label="Toggle menu">
            <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Language Switcher -->
          <LanguageSwitcherHorizontal />
        </div>
      </div>
    </header>

    <!-- Floating Icons (visible only when scrolled down) -->
    <div v-if="!isAtTop" class="fixed top-0 left-0 right-0 z-50">
      <!-- Logo in top-left corner -->
      <div class="fixed top-2 sm:top-4 left-2 sm:left-4 z-50">
        <!-- Viền đệm mỏng lại (p-2/p-4 -> p-0.5/p-1) và dùng bản ảnh đã cắt:
             ảnh gốc có sẵn ~33% khoảng trắng nên trông như viền rất dày,
             giảm padding thôi chưa đủ. -->
        <NuxtLink :to="localePath('/')"
          class="flex items-center justify-center bg-white/10 backdrop-blur-sm p-0.5 sm:p-1 rounded-full hover:shadow-xl transition-all duration-300 hover:scale-110">
          <NuxtImg src="/images/Sapa_logo_mark.png" alt="Sapa Paragliding Logo"
            width="200" height="163"
            class="h-12 sm:h-20 w-auto object-contain" format="webp" @error="handleLogoError" />
        </NuxtLink>
      </div>

      <!-- Floating Menu Button and Language Switcher (top-right) -->
      <div ref="floatingControlsRef"
        class="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex flex-col items-center gap-2 sm:gap-3">
        <!-- Menu Button -->
        <button @click.stop="toggleMenu"
          class="bg-white hover:bg-gray-100 text-red-600 p-2.5 sm:p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
          aria-label="Toggle menu">
          <svg v-if="!isMenuOpen" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Language Switcher -->
        <LanguageSwitcher />
      </div>
    </div>

    <!-- Vùng bắt chạm để đóng menu. Trong suốt hoàn toàn: các nút bên dưới
         tự nổi bằng nền trắng + đổ bóng riêng, nên không cần lớp phủ làm tối
         trang. Người dùng vẫn nhìn xuyên xuống nội dung trang phía sau. -->
    <Transition name="fade">
      <div v-if="isMenuOpen" @click="closeMenu" class="lg:hidden fixed inset-0 z-[9998]" />
    </Transition>

    <!-- Các nút menu ĐỘC LẬP, mỗi nút là một viên nổi riêng trên nền trang —
         không nằm trong khung/panel nào cả. Dùng TransitionGroup để từng nút
         rơi xuống lệch nhau một nhịp (transitionDelay theo chỉ số) thay vì cả
         cụm hiện cùng lúc.
         Nhóm luôn có mặt trong DOM, chỉ danh sách con thay đổi — đó là cách
         TransitionGroup nhận biết để chạy hiệu ứng vào/ra. -->
    <TransitionGroup name="pill" tag="div" :style="menuPosition"
      class="lg:hidden pointer-events-none fixed right-0 z-[9999] flex w-[13.5rem] max-w-full flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-2">
      <template v-if="isMenuOpen">
        <NuxtLink v-for="(item, index) in menuItems" :key="item.path"
          :to="getLocalizedPath(item.path)" @click="closeMenu"
          :style="{ transitionDelay: `${index * 35}ms` }"
          class="rounded-xl bg-white/55 px-3 py-2.5 text-center text-sm font-bold uppercase text-gray-900 shadow-[0_14px_30px_-6px_rgba(0,0,0,0.65),0_4px_10px_-2px_rgba(0,0,0,0.35)] ring-1 ring-white/50 backdrop-blur-xl backdrop-brightness-150 transition-colors duration-200 hover:bg-red-600/90 hover:text-white pointer-events-auto"
          active-class="!bg-red-600 !text-white">
          {{ $t(item.label) }}
        </NuxtLink>

        <!-- Hàng mạng xã hội cũng là một viên nổi riêng, rơi sau cùng -->
        <div key="social" :style="{ transitionDelay: `${menuItems.length * 35}ms` }"
          class="pointer-events-auto flex items-center justify-center gap-6 rounded-xl bg-white/55 px-3 py-2.5 shadow-[0_14px_30px_-6px_rgba(0,0,0,0.65),0_4px_10px_-2px_rgba(0,0,0,0.35)] ring-1 ring-white/50 backdrop-blur-xl backdrop-brightness-150">
          <a href="https://www.facebook.com/bayduluonsapa" target="_blank" rel="noopener noreferrer"
            class="text-gray-700 transition-colors hover:text-red-600" aria-label="Facebook">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/SAPA_PARAGLIDING" target="_blank" rel="noopener noreferrer"
            class="text-gray-700 transition-colors hover:text-red-600" aria-label="Instagram">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@sapa_paragliding" target="_blank" rel="noopener noreferrer"
            class="text-gray-700 transition-colors hover:text-red-600" aria-label="TikTok">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, t } = useI18n()

/**
 * Tên thương hiệu tách thành 2 dòng cân đối nhất (dòng dài nhất ngắn nhất
 * có thể), để khối chữ hẹp — thanh menu gần như hết chỗ ngang.
 *   vi 'DÙ LƯỢN SAPA'         -> 'DÙ LƯỢN' / 'SAPA'
 *   fr 'PARAPENTE À SAPA'     -> 'PARAPENTE' / 'À SAPA'
 *   ru 'ПАРАПЛАНЕРИЗМ В САПЕ' -> 'ПАРАПЛАНЕРИЗМ' / 'В САПЕ'
 */
const brandLines = computed<[string, string]>(() => {
  const words = t('hero.title').trim().split(/\s+/).filter(Boolean)

  if (words.length < 2) {
    return [words[0] ?? '', '']
  }

  let bestIndex = 1
  let bestWidth = Infinity

  for (let i = 1; i < words.length; i++) {
    const width = Math.max(
      words.slice(0, i).join(' ').length,
      words.slice(i).join(' ').length
    )
    if (width < bestWidth) {
      bestWidth = width
      bestIndex = i
    }
  }

  return [words.slice(0, bestIndex).join(' '), words.slice(bestIndex).join(' ')]
})

/**
 * Chữ Hán và Devanagari nhìn nhỏ hơn hẳn chữ Latin ở cùng cỡ font, nên phải
 * tăng cỡ riêng. Làm được vì menu hai thứ tiếng này ngắn hơn nhiều:
 * tiếng Trung 23 ký tự, tiếng Ấn 60, so với tiếng Pháp 78 -> còn thừa chỗ.
 */
const navTextSize = computed(() =>
  ['zh', 'hi'].includes(locale.value)
    ? 'text-base xl:text-lg 2xl:text-xl'
    : 'text-[13px] xl:text-[15px] 2xl:text-lg'
)

/**
 * Cỡ chữ thương hiệu trên MOBILE, theo độ dài từ dài nhất của từng ngôn ngữ.
 * Tiếng Nga 'ПАРАПЛАНЕРИЗМ' và tiếng Ấn 'पैराग्लाइडिंग' đều 13 ký tự, ở 15px
 * chen với logo + hamburger + 6 nút ngôn ngữ thì bị đè. Hạ xuống 12px cho
 * riêng hai ngôn ngữ này; các ngôn ngữ còn lại (dài nhất 11 ký tự) giữ 15px.
 */
const brandTextSize = computed(() =>
  ['ru', 'hi'].includes(locale.value) ? 'text-[12px]' : 'text-[15px]'
)

const isMenuOpen = ref(false)
const isAtTop = ref(true)

const menuItems = [
  { path: '/', label: 'menu.home' },
  { path: '/booking', label: 'menu.booking' },
  { path: '/prices', label: 'menu.prices' },
  { path: '/flying-site', label: 'menu.flyingSite' },
  { path: '/pilots', label: 'menu.pilots' },
  { path: '/posts', label: 'menu.posts' },
  { path: '/pre-notice', label: 'menu.preNotice' },
  { path: '/about', label: 'menu.about' }
]

// Get localized path for menu items - use @nuxtjs/i18n composable
const getLocalizedPath = (path: string) => {
  return localePath(path)
}

/**
 * Vị trí panel menu nổi, đo ngay lúc mở thay vì chốt cứng 80px: chiều cao
 * header đổi theo ngôn ngữ (hàng 6 nút ngôn ngữ có thể xuống dòng).
 * getBoundingClientRect().bottom tính theo khung nhìn nên khớp luôn với
 * position: fixed.
 */
const menuTopPx = ref(88)

const menuPosition = computed(() => ({
  top: `${menuTopPx.value}px`,
  maxHeight: `calc(100vh - ${menuTopPx.value + 16}px)`
}))

const headerControlsRef = ref<HTMLElement | null>(null)
const floatingControlsRef = ref<HTMLElement | null>(null)

/**
 * Bám menu xuống dưới CỤM nút đang hiện, không phải dưới riêng nút menu.
 *
 * Có hai cụm và mỗi lúc chỉ một cụm hiện:
 *   - Đầu trang: hàng nút bên phải trong header [nút menu | nút ngôn ngữ].
 *   - Đã cuộn:   cột nút nổi góc phải [nút menu / nút ngôn ngữ] — bong bóng
 *                ngôn ngữ nằm NGAY DƯỚI nút menu, đáy cụm ~112px.
 *
 * Đo đáy cả cụm nên menu không bao giờ đè lên bong bóng ngôn ngữ.
 */
const updateMenuTop = () => {
  const cluster = isAtTop.value ? headerControlsRef.value : floatingControlsRef.value
  const bottom = cluster?.getBoundingClientRect().bottom ?? 80
  menuTopPx.value = Math.max(8, bottom + 14)
}

/**
 * Tính lại vị trí khi menu ĐANG MỞ mà người dùng cuộn trang. Thiếu bước này
 * thì menu giữ nguyên chỗ tính lúc mở: mở ở đầu trang (menu ~88px) rồi cuộn
 * xuống, cụm nổi hiện ra cao tới ~112px và bị menu đè lên đúng chỗ bong bóng
 * ngôn ngữ. Chờ nextTick vì cụm nổi chỉ được gắn vào DOM sau khi isAtTop đổi.
 */
const syncMenuTop = async () => {
  if (!isMenuOpen.value) return
  await nextTick()
  updateMenuTop()
}

const toggleMenu = () => {
  if (!isMenuOpen.value) {
    updateMenuTop()
  }
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Handle logo error (fallback to text-only)
const handleLogoError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => {
  closeMenu()
})

// Detect scroll position
const handleScroll = () => {
  isAtTop.value = window.scrollY < 50
  syncMenuTop()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Từng viên nút rơi xuống lệch nhịp nhau khi mở. */
.pill-enter-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Khi đóng thì bỏ độ trễ so le, tất cả biến mất cùng lúc cho dứt khoát. */
.pill-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transition-delay: 0ms !important;
}

.pill-enter-from,
.pill-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
