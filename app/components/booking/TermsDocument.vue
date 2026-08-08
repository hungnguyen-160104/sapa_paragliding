<template>
  <div class="rounded-lg border border-gray-200 bg-white">
    <!-- Thanh tiêu đề dính, để khách cuộn sâu vẫn biết đang đọc gì -->
    <div class="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2">
      <p class="text-[13px] font-bold text-[#194d9b]">{{ doc?.title }}</p>
      <span v-if="!atEnd" class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {{ $t('booking.terms.scrollHint') }}
      </span>
      <span v-else class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
        ✓
      </span>
    </div>

    <div
      ref="scrollerRef"
      class="max-h-64 overflow-y-auto px-3 py-3 text-[12px] leading-relaxed text-gray-700"
      @scroll="onScroll"
    >
      <div v-if="!doc" class="py-6 text-center text-gray-400">…</div>

      <template v-else>
        <section v-for="(section, si) in doc.sections" :key="si" :class="si > 0 ? 'mt-4' : ''">
          <h4 class="mb-1.5 text-[12px] font-black uppercase tracking-wide text-[#194d9b]">
            {{ section.heading }}
          </h4>

          <p v-if="section.intro" class="mb-1.5">{{ section.intro }}</p>
          <p v-if="section.lead" class="mb-1.5 font-semibold">{{ section.lead }}</p>

          <template v-for="(block, bi) in section.blocks" :key="bi">
            <h5 v-if="block.type === 'subheading'" class="mb-1 mt-2.5 font-bold text-gray-900">
              {{ block.text }}
            </h5>

            <p v-else-if="block.type === 'para'" class="mb-1.5">{{ block.text }}</p>

            <div v-else class="mb-1.5 flex gap-1.5">
              <span class="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#f02424]" />
              <div class="min-w-0">
                <span>{{ block.text }}</span>
                <ul v-if="block.sub?.length" class="mt-1 space-y-1 pl-3">
                  <li v-for="(item, ii) in block.sub" :key="ii" class="flex gap-1.5">
                    <span class="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Toàn văn điều khoản, đọc ngay trong bước xác nhận.
 *
 * Trước đây đây chỉ là một link tới /dieukhoan1.pdf nặng 1.4 MB: trên 4G khách
 * phải tải cả file rồi mở trình xem PDF, chữ bé tí trên điện thoại, và bản PDF
 * chỉ có tiếng Việt trong khi phần lớn khách là người nước ngoài. Giờ nội dung
 * nằm thẳng trong trang, đúng ngôn ngữ đang xem.
 *
 * Bản tiếng Việt là bản gốc có hiệu lực; 5 ngôn ngữ còn lại là bản dịch tham
 * khảo — điều này được ghi rõ ở dòng chú thích dưới ô đọc.
 *
 * Mỗi ngôn ngữ nạp riêng bằng dynamic import (import.meta.glob) nên chỉ tệp
 * JSON đang cần mới vào bundle của khách, không phải cả 6.
 */
interface TermsBlock {
  type: 'bullet' | 'para' | 'subheading'
  text: string
  sub?: string[]
}
interface TermsSection {
  heading: string
  intro?: string
  lead?: string
  blocks: TermsBlock[]
}
interface TermsDoc {
  title: string
  sections: TermsSection[]
}

const { locale } = useI18n()

const modules = import.meta.glob<{ default: TermsDoc }>('~/data/terms/*.json')

const doc = ref<TermsDoc | null>(null)

const loadDoc = async (code: string) => {
  const key = Object.keys(modules).find((path) => path.endsWith(`/${code}.json`))
    ?? Object.keys(modules).find((path) => path.endsWith('/en.json'))
  if (!key) return
  const mod = await modules[key]!()
  doc.value = mod.default
}

watch(locale, (code) => loadDoc(code as string), { immediate: true })

/** Đọc hết = đã cuộn tới đáy. Chỉ dùng để đổi nhãn nhắc cuộn, không chặn nút. */
const scrollerRef = ref<HTMLElement | null>(null)
const atEnd = ref(false)

const onScroll = () => {
  const el = scrollerRef.value
  if (!el) return
  atEnd.value = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
}
</script>
