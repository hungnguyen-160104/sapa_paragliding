<template>
  <div class="smp min-h-screen font-sans">
    <main class="px-4 py-12 sm:px-6 md:py-16">
      <div class="container-custom mx-auto max-w-6xl">
        <header class="mb-8">
          <p class="smp-eyebrow">Sapa Paragliding · {{ ui.eyebrow }}</p>
          <h1 class="smp-title">{{ ui.title }}</h1>
          <p class="smp-lead">{{ ui.lead }}</p>
          <p class="smp-hint">{{ ui.hint }}</p>
        </header>

        <SapaMap />

        <section class="mt-12">
          <h2 class="smp-h2">{{ ui.cardsTitle }}</h2>
          <div class="smp-cards">
            <NuxtLink v-for="s in SAPA_STOPS" :key="s.slug" :to="localePath(`/sapa-map/${s.slug}`)" class="smp-card">
              <div class="smp-card-img">
                <NuxtImg
                  v-if="s.images[0]"
                  :src="cardImage(s.images[0].src)"
                  :alt="s.images[0][lang]"
                  loading="lazy"
                  decoding="async"
                  format="webp"
                />
                <span class="smp-card-n" :class="`smp-n-${s.kind}`">{{ s.n }}</span>
                <span v-if="s.kind === 'fly'" class="smp-card-badge">{{ lang === 'vi' ? 'Có bay dù lượn' : 'Paragliding' }}</span>
              </div>
              <div class="smp-card-body">
                <p class="smp-card-kicker">{{ content(s.slug).kicker }}</p>
                <h3 class="smp-card-title">{{ content(s.slug).name }}</h3>
                <p class="smp-card-text">{{ content(s.slug).tagline }}</p>
                <span class="smp-card-link">{{ ui.cardLink }} →</span>
              </div>
            </NuxtLink>
          </div>
        </section>

        <p class="smp-note">{{ ui.note }}</p>

        <div class="mt-8">
          <NuxtLink :to="localePath('/booking')" class="smp-cta">{{ ui.cta }} →</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import stopsContent from '~/data/sapa-stops.json'
import { SAPA_STOPS } from '~~/shared/sapa-map'
import { buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getDefaultOgImage, getOgLocale, type SupportedLocale } from '~/utils/seo'

type StopText = { name: string; title: string; kicker: string; tagline: string }
const CONTENT = stopsContent as unknown as Record<string, { vi: StopText; en: StopText }>

const { locale, t } = useI18n()
const localePath = useLocalePath()

/** Nội dung có hai bản vi/en; ngôn ngữ khác hiện bản tiếng Anh, canonical về /en. */
const MAP_LOCALES: SupportedLocale[] = ['vi', 'en']
const lang = computed<'vi' | 'en'>(() => (locale.value === 'vi' ? 'vi' : 'en'))
const content = (slug: string) => CONTENT[slug]![lang.value]

/** Ảnh Cloudinary: xin bản 640px cho thẻ. Ảnh trong /images giữ nguyên. */
const cardImage = (src: string) => src.replace('/upload/', '/upload/c_fill,w_640,h_420,q_auto,f_auto/')

const UI = {
  vi: {
    eyebrow: 'Bản đồ checkpoint',
    title: 'Bản đồ Sa Pa: 15 điểm check‑in, cung trek và điểm bay dù lượn',
    lead: 'Sơ đồ tổng quan các điểm nổi tiếng nhất Sa Pa — từ Sun Plaza, Fansipan, Cát Cát tới thung lũng Mường Hoa, Thác Bạc, đèo Ô Quy Hồ — cùng điểm cất cánh và hạ cánh dù lượn.',
    hint: 'Bấm vào một điểm trên sơ đồ để xem đường đi, chỗ check-in và mẹo nhỏ.',
    cardsTitle: 'Các điểm dừng',
    cardLink: 'Đường đi & check-in',
    note: 'Sơ đồ mang tính minh hoạ, không theo tỉ lệ. Quãng đường tính theo đường bộ từ Sun Plaza (dữ liệu OpenStreetMap).',
    cta: 'Đặt bay dù lượn Sa Pa',
    metaTitle: 'Bản đồ Sa Pa: 15 điểm check-in, cung trek & điểm bay dù lượn',
    metaDesc: 'Sơ đồ checkpoint Sa Pa: Sun Plaza, Fansipan, Cát Cát, Moana, Lao Chải, Tả Van, Thác Bạc, Ô Quy Hồ, Rồng Mây, hồ Séo Mý Tỷ… Bấm từng điểm để xem đường đi và chỗ check-in.',
    crumb: 'Bản đồ Sa Pa'
  },
  en: {
    eyebrow: 'Checkpoint map',
    title: 'Sapa map: 15 checkpoints, trekking routes and the paragliding site',
    lead: "An overview of Sapa's best-known places — from Sun Plaza, Fansipan and Cat Cat to Muong Hoa Valley, Silver Waterfall and O Quy Ho Pass — with the paragliding take-off and landing.",
    hint: 'Tap a stop on the map for directions, photo spots and tips.',
    cardsTitle: 'The stops',
    cardLink: 'Directions & photo spots',
    note: 'The map is an illustration and not to scale. Distances are by road from Sun Plaza (OpenStreetMap data).',
    cta: 'Book a paragliding flight in Sapa',
    metaTitle: 'Sapa Map: 15 Checkpoints, Trekking Routes & Paragliding Site',
    metaDesc: 'Sapa checkpoint map: Sun Plaza, Fansipan, Cat Cat, Moana, Lao Chai, Ta Van, Silver Waterfall, O Quy Ho, Rong May, Seo My Ty Lake… Tap a stop for directions and photo spots.',
    crumb: 'Sapa map'
  }
}
const ui = computed(() => UI[lang.value])

useHead(() => {
  const hasOwn = MAP_LOCALES.includes(locale.value as SupportedLocale)
  const pageUrl = buildLocalizedUrl('/sapa-map', locale.value)
  const canonical = hasOwn ? pageUrl : buildLocalizedUrl('/sapa-map', 'en')
  const image = getDefaultOgImage()
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: ui.value.title,
    itemListElement: SAPA_STOPS.map((s) => ({
      '@type': 'ListItem',
      position: s.n,
      name: content(s.slug).title,
      url: buildLocalizedUrl(`/sapa-map/${s.slug}`, hasOwn ? locale.value : 'en')
    }))
  }
  return {
    title: ui.value.metaTitle,
    meta: [
      { name: 'description', content: ui.value.metaDesc },
      { property: 'og:title', content: ui.value.metaTitle },
      { property: 'og:description', content: ui.value.metaDesc },
      { property: 'og:image', content: image },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: pageUrl },
      { property: 'og:locale', content: getOgLocale(locale.value) },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ui.value.metaTitle },
      { name: 'twitter:description', content: ui.value.metaDesc },
      { name: 'twitter:image', content: image }
    ],
    link: [{ rel: 'canonical', href: canonical }, ...buildHreflangLinks('/sapa-map', locale.value, MAP_LOCALES)],
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(list) },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(buildBreadcrumbJsonLD([
          { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
          { name: ui.value.crumb, item: pageUrl }
        ]))
      }
    ]
  }
})
</script>

<style>
/* Dùng chung cho trang tổng quan và trang từng điểm (/sapa-map/<slug>) */
.smp {
  --smp-ink: #13241c;
  --smp-green: #1e5b45;
  --smp-red: #d1343f;
  --smp-muted: #5d6d65;
  --smp-line: #dfe6e3;
  background: #f2f5f5;
  color: #2a3a33;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.smp .smp-eyebrow { margin-bottom: 1rem; color: var(--smp-red); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
.smp .smp-title {
  margin-bottom: 1.25rem; color: var(--smp-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: clamp(2.1rem, 4.8vw, 3.6rem); font-weight: 800; line-height: 1.1;
  text-transform: uppercase; text-wrap: balance;
}
.smp .smp-lead { max-width: 48rem; font-size: 1.1rem; font-weight: 300; line-height: 1.75; }
.smp .smp-hint { margin-top: 0.75rem; color: var(--smp-green); font-size: 0.95rem; font-weight: 500; }
.smp .smp-h2 {
  margin-bottom: 1.1rem; color: var(--smp-green);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: clamp(1.55rem, 3vw, 2.2rem); font-weight: 700; line-height: 1.05; text-transform: uppercase;
}
.smp .smp-cards { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15.5rem), 1fr)); }
.smp .smp-card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--smp-line); border-radius: 0.75rem; background: #fff; transition: transform 0.15s, box-shadow 0.15s; }
.smp .smp-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -18px rgba(19, 36, 28, 0.5); }
.smp .smp-card-img { position: relative; aspect-ratio: 16 / 10.5; background: #dfe6e3; }
.smp .smp-card-img img { width: 100%; height: 100%; object-fit: cover; }
.smp .smp-card-n {
  position: absolute; left: 0.6rem; top: 0.6rem; display: flex; align-items: center; justify-content: center;
  width: 1.9rem; height: 1.9rem; border: 2px solid #fff; border-radius: 50%; background: #2f6f57; color: #fff;
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.05rem; font-weight: 700;
}
.smp .smp-n-town { background: #2563a8; }
.smp .smp-n-peak { background: #7b4bb3; }
.smp .smp-n-fly { background: #d1343f; }
.smp .smp-n-waterfall, .smp .smp-n-spring, .smp .smp-n-lake { background: #1f8a96; }
.smp .smp-n-pass, .smp .smp-n-bridge { background: #c77712; }
.smp .smp-card-badge { position: absolute; right: 0.6rem; top: 0.65rem; padding: 0.15rem 0.6rem; border-radius: 99px; background: #d1343f; color: #fff; font-size: 0.7rem; font-weight: 600; }
.smp .smp-card-body { display: flex; flex: 1; flex-direction: column; padding: 0.9rem 1rem 1rem; }
.smp .smp-card-kicker { color: var(--smp-red); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.smp .smp-card-title { margin-top: 0.2rem; color: var(--smp-ink); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.45rem; font-weight: 700; line-height: 1.12; }
.smp .smp-card-text { flex: 1; margin-top: 0.4rem; font-size: 0.9rem; font-weight: 300; line-height: 1.55; }
.smp .smp-card-link { margin-top: 0.7rem; color: var(--smp-ink); font-size: 0.85rem; font-weight: 500; }
.smp .smp-note { margin-top: 2rem; max-width: 48rem; color: var(--smp-muted); font-size: 0.85rem; font-weight: 300; line-height: 1.6; }
.smp .smp-cta {
  display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.375rem; background: var(--smp-red); color: #fff;
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.smp .smp-cta:hover { background: #b82a35; }
</style>
