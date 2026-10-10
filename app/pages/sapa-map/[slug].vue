<template>
  <div class="smp smd min-h-screen font-sans">
    <!-- Ảnh đầu trang -->
    <header class="smd-hero">
      <NuxtImg
        v-if="hero"
        :src="heroImage(hero.src)"
        :alt="hero[lang]"
        class="smd-hero-img"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        format="webp"
      />
      <div class="smd-hero-shade"></div>
      <div class="smd-hero-text container-custom mx-auto max-w-5xl">
        <NuxtLink :to="localePath('/sapa-map')" class="smd-back">← {{ ui.back }}</NuxtLink>
        <p class="smd-kicker">{{ ui.stop }} {{ stop.n }}/{{ SAPA_STOPS.length }} · {{ text.kicker }}</p>
        <h1 class="smd-title">{{ text.title }}</h1>
        <p class="smd-tagline">{{ text.tagline }}</p>
      </div>
    </header>
    <p v-if="hero?.credit" class="smd-credit container-custom mx-auto max-w-5xl">
      {{ ui.photo }}: <a :href="hero.credit.source" target="_blank" rel="noopener nofollow">{{ hero.credit.author }}</a> / {{ hero.credit.site || 'Wikimedia Commons' }}<template v-if="hero.credit.license"> · {{ hero.credit.license }}</template>
    </p>

    <main class="px-4 pb-16 pt-8 sm:px-6">
      <article class="container-custom mx-auto max-w-5xl">
        <p class="smd-intro">{{ text.intro }}</p>

        <div class="smd-chips">
          <div v-for="(f, i) in text.facts" :key="i" class="smd-chip">
            <strong>{{ f.value }}</strong>
            <span>{{ f.label }}</span>
          </div>
          <a :href="gmaps" target="_blank" rel="noopener" class="smd-chip smd-chip-link">
            <strong>Google Maps ↗</strong>
            <span>{{ stop.approx ? ui.approx : ui.openMap }}</span>
          </a>
        </div>

        <div class="smd-body">
          <template v-for="(sec, i) in text.sections" :key="i">
            <section>
              <h2 class="smp-h2">{{ sec.h }}</h2>
              <p v-for="(para, j) in sec.p || []" :key="`p${j}`" v-html="renderInlineMarkup(para)" />
              <ul v-if="sec.list?.length">
                <li v-for="(item, j) in sec.list" :key="`l${j}`" v-html="renderInlineMarkup(item)" />
              </ul>
            </section>

            <!-- ảnh chen giữa bài: sau mỗi hai mục một ảnh -->
            <figure v-if="inlineImage(i)" class="smd-figure">
              <span class="smd-figure-wrap">
                <NuxtImg :src="bodyImage(inlineImage(i)!.src)" :alt="inlineImage(i)![lang]" loading="lazy" decoding="async" format="webp" />
              </span>
              <figcaption>
                {{ inlineImage(i)![lang] }}
                <template v-if="inlineImage(i)!.credit">
                  · {{ ui.photo }}: <a :href="inlineImage(i)!.credit!.source" target="_blank" rel="noopener nofollow">{{ inlineImage(i)!.credit!.author }}</a> / {{ inlineImage(i)!.credit!.site || 'Wikimedia Commons' }}<template v-if="inlineImage(i)!.credit!.license"> · {{ inlineImage(i)!.credit!.license }}</template>
                </template>
              </figcaption>
            </figure>
          </template>
        </div>

        <!-- Hỏi đáp -->
        <section v-if="text.faq?.length" class="smd-body smd-faq">
          <h2 class="smp-h2">{{ ui.faq }}</h2>
          <details v-for="(item, i) in text.faq" :key="i" :open="i === 0">
            <summary>{{ item.q }}</summary>
            <p v-html="renderInlineMarkup(item.a)" />
          </details>
        </section>

        <!-- Ảnh còn lại -->
        <section v-if="galleryImages.length" class="mt-10">
          <h2 class="smp-h2">{{ ui.gallery }}</h2>
          <div class="smd-gallery">
            <figure v-for="(img, i) in galleryImages" :key="i">
              <NuxtImg :src="gridImage(img.src)" :alt="img[lang]" loading="lazy" decoding="async" format="webp" />
              <figcaption>
                {{ img[lang] }}
                <template v-if="img.credit">
                  · {{ ui.photo }}: <a :href="img.credit.source" target="_blank" rel="noopener nofollow">{{ img.credit.author }}</a> / {{ img.credit.site || 'Wikimedia Commons' }}<template v-if="img.credit.license"> · {{ img.credit.license }}</template>
                </template>
              </figcaption>
            </figure>
          </div>
        </section>

        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink :to="localePath('/booking')" class="smp-cta">{{ ui.cta }} →</NuxtLink>
        </div>

        <!-- Vị trí trên sơ đồ -->
        <section class="mt-14">
          <h2 class="smp-h2">{{ ui.onMap }}</h2>
          <SapaMap :active="stop.slug" />
        </section>

        <!-- Điểm trước / sau -->
        <nav class="smd-nav">
          <NuxtLink v-if="prev" :to="localePath(`/sapa-map/${prev.slug}`)" class="smd-nav-item">
            <small>← {{ ui.prev }}</small>
            <span>{{ prev.n }}. {{ CONTENT[prev.slug]![lang].name }}</span>
          </NuxtLink>
          <span v-else></span>
          <NuxtLink v-if="next" :to="localePath(`/sapa-map/${next.slug}`)" class="smd-nav-item smd-nav-next">
            <small>{{ ui.next }} →</small>
            <span>{{ next.n }}. {{ CONTENT[next.slug]![lang].name }}</span>
          </NuxtLink>
        </nav>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import stopsContent from '~/data/sapa-stops.json'
import { SAPA_STOPS, sapaStopBySlug } from '~~/shared/sapa-map'
import { renderInlineMarkup } from '~/utils/inlineMarkup'
import { buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getDefaultOgImage, getOgLocale, type SupportedLocale } from '~/utils/seo'

type StopText = {
  name: string
  title: string
  kicker: string
  tagline: string
  intro: string
  facts: Array<{ value: string; label: string }>
  sections: Array<{ h: string; p?: string[]; list?: string[] }>
  faq?: Array<{ q: string; a: string }>
  metaTitle: string
  metaDesc: string
}
const CONTENT = stopsContent as unknown as Record<string, { vi: StopText; en: StopText }>

const { locale, t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const found = sapaStopBySlug(String(route.params.slug ?? ''))
// Slug lạ → 404 thật (không render trang rỗng cho Google lập chỉ mục)
if (!found || !CONTENT[found.slug]) {
  throw createError({ statusCode: 404, statusMessage: 'Stop not found', fatal: true })
}
const stop = found

const MAP_LOCALES: SupportedLocale[] = ['vi', 'en']
const lang = computed<'vi' | 'en'>(() => (locale.value === 'vi' ? 'vi' : 'en'))
const text = computed(() => CONTENT[stop.slug]![lang.value])

const hero = computed(() => stop.images[0])
/**
 * Ảnh chen trong bài: sau mục 1, 3, 5 (chỉ số 0, 2, 4) lần lượt là ảnh thứ
 * 2, 3, 4. Ảnh còn lại (từ ảnh thứ 5) xếp thành lưới cuối bài.
 */
const INLINE_AFTER = [0, 2, 4]
const inlineImage = (sectionIndex: number) => {
  const k = INLINE_AFTER.indexOf(sectionIndex)
  return k === -1 ? undefined : stop.images[k + 1]
}
const galleryImages = computed(() => {
  const used = 1 + INLINE_AFTER.filter((i) => i < text.value.sections.length).length
  return stop.images.slice(used)
})
const gridImage = (src: string) => src.replace('/upload/', '/upload/c_fill,w_800,h_560,q_auto,f_auto/')
const heroImage = (src: string) => src.replace('/upload/', '/upload/c_fill,w_1600,h_900,q_auto,f_auto/')
const bodyImage = (src: string) => src.replace('/upload/', '/upload/c_limit,w_1200,q_auto,f_auto/')

const index = SAPA_STOPS.findIndex((s) => s.slug === stop.slug)
const prev = index > 0 ? SAPA_STOPS[index - 1] : undefined
const next = index < SAPA_STOPS.length - 1 ? SAPA_STOPS[index + 1] : undefined
const gmaps = `https://www.google.com/maps/search/?api=1&query=${stop.q ? encodeURIComponent(stop.q) : `${stop.lat},${stop.lon}`}`

const UI = {
  vi: { back: 'Bản đồ Sa Pa', stop: 'Điểm dừng', photo: 'Ảnh', openMap: 'mở chỉ đường', approx: 'vị trí gần đúng', cta: 'Đặt bay dù lượn Sa Pa', onMap: 'Vị trí trên sơ đồ', faq: 'Hỏi nhanh – đáp gọn', gallery: 'Thêm ảnh', prev: 'Điểm trước', next: 'Điểm tiếp theo', crumb: 'Bản đồ Sa Pa' },
  en: { back: 'Sapa map', stop: 'Stop', photo: 'Photo', openMap: 'open directions', approx: 'approximate position', cta: 'Book a paragliding flight in Sapa', onMap: 'Where it is on the map', faq: 'Quick questions', gallery: 'More photos', prev: 'Previous stop', next: 'Next stop', crumb: 'Sapa map' }
}
const ui = computed(() => UI[lang.value])

useHead(() => {
  const hasOwn = MAP_LOCALES.includes(locale.value as SupportedLocale)
  const path = `/sapa-map/${stop.slug}`
  const pageUrl = buildLocalizedUrl(path, locale.value)
  const canonical = hasOwn ? pageUrl : buildLocalizedUrl(path, 'en')
  const heroSrc = hero.value?.src ?? ''
  const image = heroSrc.startsWith('http') ? heroImage(heroSrc) : heroSrc ? `https://www.paraglidingsapa.com${heroSrc}` : getDefaultOgImage()
  const place = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: text.value.title,
    description: text.value.metaDesc,
    image,
    url: pageUrl,
    geo: { '@type': 'GeoCoordinates', latitude: stop.lat, longitude: stop.lon }
  }
  return {
    title: text.value.metaTitle,
    meta: [
      { name: 'description', content: text.value.metaDesc },
      { property: 'og:title', content: text.value.metaTitle },
      { property: 'og:description', content: text.value.metaDesc },
      { property: 'og:image', content: image },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: pageUrl },
      { property: 'og:locale', content: getOgLocale(locale.value) },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: text.value.metaTitle },
      { name: 'twitter:description', content: text.value.metaDesc },
      { name: 'twitter:image', content: image }
    ],
    link: [{ rel: 'canonical', href: canonical }, ...buildHreflangLinks(path, locale.value, MAP_LOCALES)],
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(place) },
      ...(text.value.faq?.length
        ? [{
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: text.value.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\*\*/g, '') } }))
            })
          }]
        : []),
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildBreadcrumbJsonLD([
          { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
          { name: ui.value.crumb, item: buildLocalizedUrl('/sapa-map', locale.value) },
          { name: text.value.name, item: pageUrl }
        ]))
      }
    ]
  }
})
</script>

<style>
/* Bảng màu, .smp-h2, .smp-cta dùng chung từ pages/sapa-map/index.vue (.smp).
   Lặp lại biến ở đây vì trang này có thể được mở trực tiếp. */
.smd { --smp-ink: #13241c; --smp-green: #1e5b45; --smp-red: #d1343f; --smp-muted: #5d6d65; --smp-line: #dfe6e3; background: #f2f5f5; color: #2a3a33; font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
.smd .smp-h2 { margin: 2.5rem 0 0.9rem; color: var(--smp-green); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: clamp(1.55rem, 3vw, 2.2rem); font-weight: 700; line-height: 1.05; text-transform: uppercase; }
.smd .smp-cta { display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.375rem; background: var(--smp-red); color: #fff; font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.smd .smp-cta:hover { background: #b82a35; }

.smd-hero { position: relative; display: flex; align-items: flex-end; min-height: min(68vh, 560px); background: #16332a; overflow: hidden; }
.smd-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.smd-hero-shade { position: absolute; inset: 0; background: linear-gradient(rgba(11, 29, 23, 0.25) 0%, rgba(11, 29, 23, 0.1) 35%, rgba(11, 29, 23, 0.82) 100%); }
.smd-hero-text { position: relative; width: 100%; padding: 6rem 1rem 2rem; color: #fff; }
.smd-back { display: inline-block; margin-bottom: 1rem; padding: 0.3rem 0.8rem; border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 99px; background: rgba(0, 0, 0, 0.3); color: #fff; font-size: 0.85rem; }
.smd-back:hover { background: rgba(0, 0, 0, 0.5); }
.smd-kicker { margin-bottom: 0.6rem; color: #ffd08f; text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
.smd-title { max-width: 22ch; font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: clamp(2.2rem, 5.4vw, 4rem); font-weight: 800; line-height: 1.08; text-transform: uppercase; text-wrap: balance; text-shadow: 0 3px 18px rgba(0, 0, 0, 0.55); }
.smd-tagline { margin-top: 0.75rem; max-width: 42rem; font-size: 1.1rem; font-weight: 300; line-height: 1.6; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6); }
.smd-credit { padding: 0.4rem 1rem 0; color: var(--smp-muted); font-size: 0.72rem; font-weight: 300; }
.smd-credit a, .smd-figure figcaption a { text-decoration: underline; }

.smd-intro { max-width: 46rem; font-size: 1.15rem; font-weight: 300; line-height: 1.75; }
.smd-chips { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
.smd-chip { display: flex; flex-direction: column; padding: 0.6rem 1rem 0.7rem; border: 1px solid var(--smp-line); border-radius: 0.5rem; background: #fff; }
.smd-chip strong { color: var(--smp-green); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 1.15; }
.smd-chip span { color: var(--smp-muted); font-size: 0.8rem; font-weight: 300; }
.smd-chip-link strong { color: var(--smp-red); }
.smd-chip-link:hover { border-color: var(--smp-red); }

.smd-body { max-width: 50rem; }
.smd-body p { margin-bottom: 0.9rem; font-size: 1.05rem; font-weight: 300; line-height: 1.8; }
.smd-body strong { color: var(--smp-ink); font-weight: 600; }
.smd-body ul { margin-bottom: 0.9rem; }
.smd-body li { position: relative; margin-bottom: 0.45rem; padding-left: 1.4rem; font-size: 1.02rem; font-weight: 300; line-height: 1.75; }
.smd-body li::before { content: ''; position: absolute; left: 0.15rem; top: 0.7em; width: 0.45rem; height: 0.45rem; background: var(--smp-green); }
.smd-figure { margin: 2rem 0 0.5rem; text-align: center; }
.smd-figure-wrap { display: inline-block; max-width: 100%; filter: drop-shadow(0 6px 7px rgba(19, 36, 28, 0.3)); }
.smd-figure img { display: block; max-width: 100%; max-height: min(66vh, 520px); width: auto; border-radius: 0.5rem; }
.smd-figure figcaption { margin-top: 0.6rem; color: var(--smp-muted); font-size: 0.8rem; font-weight: 300; line-height: 1.5; }

.smd-faq details { margin-bottom: 0.6rem; padding: 0.8rem 1rem; border: 1px solid var(--smp-line); border-radius: 0.5rem; background: #fff; }
.smd-faq summary { color: var(--smp-ink); font-weight: 500; cursor: pointer; }
.smd-faq details p { margin: 0.6rem 0 0; font-size: 1rem; }
.smd-gallery { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); }
.smd-gallery figure { margin: 0; }
.smd-gallery img { width: 100%; aspect-ratio: 10 / 7; object-fit: cover; border-radius: 0.5rem; }
.smd-gallery figcaption { margin-top: 0.4rem; color: var(--smp-muted); font-size: 0.78rem; font-weight: 300; line-height: 1.45; }
.smd-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2.5rem; }
.smd-nav-item { display: flex; flex-direction: column; padding: 0.9rem 1.1rem; border: 1px solid var(--smp-line); border-radius: 0.6rem; background: #fff; }
.smd-nav-item:hover { border-color: var(--smp-green); }
.smd-nav-item small { color: var(--smp-muted); font-size: 0.78rem; font-weight: 300; }
.smd-nav-item span { color: var(--smp-ink); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.3rem; font-weight: 700; line-height: 1.15; }
.smd-nav-next { align-items: flex-end; text-align: right; }
</style>
