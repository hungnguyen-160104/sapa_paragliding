<template>
  <main class="min-h-screen bg-gray-50">
    <div class="container-custom mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
      <article v-if="policy">
        <header class="mb-8">
          <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">{{ $t('legal.policiesHeading') }}</p>
          <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{{ policy.title }}</h1>
          <p class="text-sm text-gray-500">{{ $t('legal.effectiveDate') }}: {{ POLICY_EFFECTIVE_DATE }}</p>
          <!-- Bản tiếng Việt là bản có hiệu lực; ngôn ngữ chưa có bản riêng
               (fr, ru, zh, hi, ko, de) đang xem bản tiếng Anh. -->
          <p v-if="locale !== 'vi'" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {{ hasOwnContent ? $t('legal.authoritative') : $t('legal.englishFallback') }}
          </p>
        </header>

        <p class="mb-8 leading-relaxed text-gray-700">{{ fill(policy.intro) }}</p>

        <section v-for="(section, si) in policy.sections" :key="si" class="mb-8">
          <h2 class="mb-3 text-xl font-bold text-gray-900">{{ section.heading }}</h2>
          <p v-if="section.intro" class="mb-2 text-gray-700">{{ fill(section.intro) }}</p>
          <p v-if="section.lead" class="mb-2 font-semibold text-gray-800">{{ fill(section.lead) }}</p>
          <PolicyBlocks :blocks="section.blocks" :fill="fill" />
        </section>

        <!-- Trang Điều khoản: gắn kèm toàn văn "Điều khoản & Cam kết khi tham
             gia bay" — dùng lại đúng dữ liệu app/data/terms mà khách tích đồng
             ý ở bước đặt chỗ, không chép thành bản thứ hai. -->
        <section v-if="policyKey === 'terms' && flightTerms" class="mt-12 border-t border-gray-200 pt-10">
          <h2 class="mb-6 text-2xl font-bold text-gray-900">{{ flightTerms.title }}</h2>
          <div v-for="(section, si) in flightTerms.sections" :key="si" class="mb-8">
            <h3 class="mb-3 text-lg font-bold text-gray-900">{{ section.heading }}</h3>
            <p v-if="section.intro" class="mb-2 text-gray-700">{{ section.intro }}</p>
            <p v-if="section.lead" class="mb-2 font-semibold text-gray-800">{{ section.lead }}</p>
            <PolicyBlocks :blocks="section.blocks" :fill="fill" />
          </div>
        </section>

        <!-- Thông tin pháp nhân (từ shared/legal.ts) -->
        <section class="mt-12 rounded-2xl border border-gray-200 bg-white p-6 text-sm">
          <h2 class="mb-3 text-base font-bold text-gray-900">{{ $t('legal.company.heading') }}</h2>
          <CompanyLegalInfo variant="light" />
          <p class="mt-3 text-gray-700">
            {{ $t('legal.customerSupport') }}:
            <a :href="`tel:${CUSTOMER_SUPPORT.hotline.replace(/\s+/g, '')}`" class="text-red-600 hover:underline">{{ CUSTOMER_SUPPORT.hotline }}</a>
            –
            <a :href="`mailto:${CUSTOMER_SUPPORT.email}`" class="text-red-600 hover:underline">{{ CUSTOMER_SUPPORT.email }}</a>
          </p>
        </section>

        <!-- Các chính sách khác -->
        <nav class="mt-10">
          <h2 class="mb-3 text-base font-bold text-gray-900">{{ $t('legal.otherPolicies') }}</h2>
          <ul class="flex flex-wrap gap-2">
            <li v-for="p in POLICY_PAGES" :key="p.key">
              <NuxtLink :to="localePath(`/policies/${p.slug}`)"
                :class="[
                  'inline-block rounded-full border px-3 py-1.5 text-sm transition-colors',
                  p.key === policyKey
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:text-red-600'
                ]">
                {{ $t(`legal.policies.${p.key}`) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import { LANDING_OFFICE, TAKEOFF_OFFICE } from '~~/shared/flying-site'
import {
  COMPANY,
  COMPANY_BANK_ACCOUNT,
  CUSTOMER_SUPPORT,
  POLICY_CONTENT_LOCALES,
  POLICY_PAGES,
  type PolicyKey
} from '~~/shared/legal'
import {
  buildBreadcrumbJsonLD,
  buildHreflangLinks,
  buildLocalizedUrl,
  getOgLocale,
  type SupportedLocale
} from '~/utils/seo'

/**
 * Các trang chính sách bắt buộc khi thông báo website TMĐT với Bộ Công
 * Thương: /policies/terms, /payment, /cancellation-refund, /service,
 * /privacy, /complaints (danh sách ở POLICY_PAGES, shared/legal.ts).
 *
 * Nội dung ở app/data/policies/<vi|en>.json, cùng khuôn với app/data/terms.
 * Mọi con số (giá, mốc hủy, % hoàn...) phải khớp với nội dung đang có trên
 * web (bảng giá, bước đặt chỗ, trang Lưu ý trước bay, điều khoản bay) — sửa
 * chính sách ở đó thì sửa cả ở đây.
 *
 * Tên công ty, hotline, email, địa chỉ văn phòng viết trong JSON dạng
 * {companyName}, {hotline}... và được thay khi hiển thị, nên không bao giờ
 * lệch với shared/legal.ts và shared/flying-site.ts.
 */

/** Ngày áp dụng của bộ chính sách — đổi khi nội dung chính sách thay đổi. */
const POLICY_EFFECTIVE_DATE = '30/09/2026'

interface Block {
  type: 'bullet' | 'para' | 'subheading'
  text: string
  sub?: string[]
}
interface Section {
  heading: string
  intro?: string
  lead?: string
  blocks: Block[]
}
interface PolicyDoc {
  title: string
  intro: string
  sections: Section[]
}
interface FlightTermsDoc {
  title: string
  sections: Section[]
}

definePageMeta({
  validate: (route) => POLICY_PAGES.some((p) => p.slug === route.params.slug)
})

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const policyEntry = computed(() => POLICY_PAGES.find((p) => p.slug === route.params.slug)!)
const policyKey = computed<PolicyKey>(() => policyEntry.value.key)

const hasOwnContent = computed(() => (POLICY_CONTENT_LOCALES as readonly string[]).includes(locale.value))
const contentLocale = computed(() => (hasOwnContent.value ? locale.value : 'en'))

const policyModules = import.meta.glob<{ default: Record<PolicyKey, PolicyDoc> }>('~/data/policies/*.json')
const termsModules = import.meta.glob<{ default: FlightTermsDoc }>('~/data/terms/*.json')

const loadJson = async <T,>(modules: Record<string, () => Promise<{ default: T }>>, code: string) => {
  const key = Object.keys(modules).find((p) => p.endsWith(`/${code}.json`))
    ?? Object.keys(modules).find((p) => p.endsWith('/en.json'))
  return key ? (await modules[key]!()).default : null
}

const { data: policies } = await useAsyncData(
  () => `policies-${contentLocale.value}`,
  () => loadJson<Record<PolicyKey, PolicyDoc>>(policyModules, contentLocale.value),
  { watch: [contentLocale] }
)

// Điều khoản bay đã có đủ 8 thứ tiếng nên nạp đúng ngôn ngữ đang xem.
const { data: flightTerms } = await useAsyncData(
  () => `flight-terms-${locale.value}`,
  () => (policyKey.value === 'terms' ? loadJson<FlightTermsDoc>(termsModules, locale.value) : Promise.resolve(null)),
  { watch: [locale, policyKey] }
)

const policy = computed(() => policies.value?.[policyKey.value] ?? null)

/**
 * Thông tin chuyển khoản: chỉ hiện khi đã cấu hình tài khoản đứng tên công ty
 * (COMPANY_BANK_ACCOUNT trong shared/legal.ts); null thì báo nhân viên sẽ gửi.
 */
const bankTransferInfo = computed(() =>
  COMPANY_BANK_ACCOUNT
    ? `${t('legal.bank.bank')}: ${COMPANY_BANK_ACCOUNT.bank} – ${t('legal.bank.accountNumber')}: ${COMPANY_BANK_ACCOUNT.accountNumber} – ${t('legal.bank.accountHolder')}: ${COMPANY_BANK_ACCOUNT.accountHolder}.`
    : t('legal.bank.pending')
)

const TOKENS: Record<string, string> = {
  companyName: COMPANY.name,
  hotline: CUSTOMER_SUPPORT.hotline,
  supportEmail: CUSTOMER_SUPPORT.email,
  takeoffAddress: TAKEOFF_OFFICE.address,
  landingAddress: LANDING_OFFICE.address
}

/** Thay {companyName}, {hotline}... bằng giá trị cấu hình. */
const fill = (text?: string) =>
  (text ?? '').replace(/\{(\w+)\}/g, (m, k: string) => (k === 'bankTransferInfo' ? bankTransferInfo.value : TOKENS[k] ?? m))

/** Danh sách gạch đầu dòng dùng chung cho chính sách và điều khoản bay. */
const PolicyBlocks = defineComponent({
  props: {
    blocks: { type: Array as PropType<Block[]>, required: true },
    fill: { type: Function as PropType<(s?: string) => string>, required: true }
  },
  setup(props) {
    return () =>
      h('div', { class: 'space-y-2 text-gray-700 leading-relaxed' },
        props.blocks.map((block) => {
          if (block.type === 'subheading') return h('h4', { class: 'mt-4 font-bold text-gray-900' }, props.fill(block.text))
          if (block.type === 'para') return h('p', props.fill(block.text))
          return h('div', { class: 'flex gap-2' }, [
            h('span', { class: 'mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-600' }),
            h('div', { class: 'min-w-0' }, [
              h('span', props.fill(block.text)),
              block.sub?.length
                ? h('ul', { class: 'mt-1 list-disc space-y-1 pl-5 marker:text-gray-400' },
                  block.sub.map((s) => h('li', props.fill(s))))
                : null
            ])
          ])
        })
      )
  }
})

// SEO: nội dung chỉ có bản riêng ở vi/en; ngôn ngữ khác trỏ canonical về /en
// như cách làm với bài viết, để Google không coi là trang trùng lặp.
const pagePath = computed(() => `/policies/${policyEntry.value.slug}`)
const canonicalUrl = computed(() => buildLocalizedUrl(pagePath.value, contentLocale.value))
const hreflangLinks = computed(() =>
  buildHreflangLinks(pagePath.value, locale.value, POLICY_CONTENT_LOCALES as unknown as SupportedLocale[])
)
const pageTitle = computed(() => `${policy.value?.title ?? t(`legal.policies.${policyKey.value}`)} | Sapa Paragliding`)
const pageDescription = computed(() => fill(policy.value?.intro).slice(0, 160))

const breadcrumbJsonLd = computed(() =>
  buildBreadcrumbJsonLD([
    { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
    { name: t(`legal.policies.${policyKey.value}`), item: canonicalUrl.value }
  ])
)

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: getOgLocale(locale.value) }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    ...hreflangLinks.value
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbJsonLd.value) }
  ]
}))
</script>
