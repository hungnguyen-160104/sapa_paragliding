<template>
  <div class="sapa-map-page min-h-screen font-sans">
    <main class="px-4 py-12 sm:px-6 md:py-16">
      <div class="container-custom mx-auto max-w-6xl">
        <header class="mb-8">
          <p class="sm-eyebrow">Sapa Paragliding · {{ ui.eyebrow }}</p>
          <h1 class="sm-title">{{ ui.title }}</h1>
          <p class="sm-lead">{{ ui.lead }}</p>
        </header>

        <!-- Bộ lọc nhóm điểm: bấm để ẩn/hiện trên bản đồ -->
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.key"
            type="button"
            class="sm-filter"
            :class="{ 'sm-filter-off': !activeCats.has(cat.key) }"
            :aria-pressed="activeCats.has(cat.key)"
            @click="toggleCat(cat.key)"
          >
            <span class="sm-dot" :style="{ background: cat.color }"></span>
            {{ cat[lang] }}
          </button>
        </div>

        <!-- Bản đồ. Leaflet chỉ nạp ở trình duyệt (onMounted) nên khung này
             có nền chờ; danh sách điểm bên dưới vẫn nằm đủ trong HTML cho
             Google và cho khách tắt JavaScript. -->
        <div class="sm-map-frame">
          <div ref="mapEl" class="sm-map" role="application" :aria-label="ui.title"></div>
          <p v-if="!mapReady" class="sm-map-wait">{{ ui.loading }}</p>
        </div>

        <!-- Chú giải tuyến -->
        <ul class="sm-legend">
          <li v-for="kind in ROUTE_KINDS" :key="kind.key">
            <svg width="38" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="38" y2="4" :stroke="kind.color" stroke-width="3" :stroke-dasharray="kind.dash || undefined" />
            </svg>
            {{ kind[lang] }}
          </li>
        </ul>

        <!-- Danh sách điểm theo nhóm -->
        <section v-for="cat in CATEGORIES" :key="cat.key" class="mt-10">
          <h2 class="sm-h2">{{ cat[lang] }}</h2>
          <ol class="sm-list">
            <li v-for="p in pointsByCat(cat.key)" :key="p.id">
              <button type="button" class="sm-num" :style="{ background: cat.color }" :aria-label="`${ui.showOnMap}: ${p[lang]}`" @click="focusPoint(p)">
                {{ p.n }}
              </button>
              <div>
                <h3 class="sm-h3">{{ p[lang] }}</h3>
                <p class="sm-desc">{{ lang === 'vi' ? p.dvi : p.den }}</p>
                <p class="sm-links">
                  <button type="button" @click="focusPoint(p)">{{ ui.showOnMap }}</button>
                  <a :href="gmaps(p)" target="_blank" rel="noopener">Google Maps ↗</a>
                </p>
              </div>
            </li>
          </ol>
        </section>

        <!-- Các tuyến -->
        <section class="mt-10">
          <h2 class="sm-h2">{{ ui.routesTitle }}</h2>
          <ul class="sm-routes">
            <li v-for="r in data.routes" :key="r.id">
              <svg width="38" height="8" aria-hidden="true">
                <line x1="0" y1="4" x2="38" y2="4" :stroke="kindOf(r.kind).color" stroke-width="3" :stroke-dasharray="kindOf(r.kind).dash || undefined" />
              </svg>
              <span>{{ r[lang] }} <em>· ~{{ formatKm(r.km) }} km</em></span>
            </li>
          </ul>
          <p class="sm-note">{{ ui.note }}</p>
        </section>

        <div class="mt-10">
          <NuxtLink :to="localePath('/booking')" class="sm-cta">{{ ui.cta }} →</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import mapData from '~/data/sapa-map.json'
import { buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getDefaultOgImage, getOgLocale, type SupportedLocale } from '~/utils/seo'

type CatKey = 'town' | 'fansipan' | 'fly' | 'trek' | 'nature'
type MapPoint = { id: string; n: number; cat: CatKey; lat: number; lon: number; vi: string; en: string; dvi: string; den: string; approx?: boolean }
type MapRoute = { id: string; kind: string; vi: string; en: string; km: number; pts: [number, number][] }

const data = mapData as unknown as { points: MapPoint[]; routes: MapRoute[] }

const { locale, t } = useI18n()
const localePath = useLocalePath()

/**
 * Nội dung trang có hai bản: tiếng Việt và tiếng Anh. Sáu ngôn ngữ còn lại
 * hiện bản tiếng Anh — nên với Google chúng là bản sao: canonical trỏ về /en
 * và sitemap chỉ khai vi/en (cùng cách với bài viết chưa dịch).
 */
const MAP_LOCALES: SupportedLocale[] = ['vi', 'en']
const lang = computed<'vi' | 'en'>(() => (locale.value === 'vi' ? 'vi' : 'en'))

const CATEGORIES: Array<{ key: CatKey; color: string; vi: string; en: string }> = [
  { key: 'fly', color: '#d1343f', vi: 'Bay dù lượn', en: 'Paragliding' },
  { key: 'town', color: '#2563a8', vi: 'Thị trấn Sa Pa', en: 'Sapa town' },
  { key: 'fansipan', color: '#7b4bb3', vi: 'Fansipan', en: 'Fansipan' },
  { key: 'trek', color: '#1e7a4f', vi: 'Bản làng & cung trek', en: 'Villages & treks' },
  { key: 'nature', color: '#c77712', vi: 'Thác & đèo', en: 'Waterfalls & passes' }
]

const ROUTE_KINDS: Array<{ key: string; color: string; dash?: string; weight: number; vi: string; en: string }> = [
  { key: 'flight', color: '#d1343f', dash: '2 7', weight: 4, vi: 'Đường bay dù lượn', en: 'Paragliding flight' },
  { key: 'trek', color: '#1e7a4f', dash: '8 6', weight: 3.5, vi: 'Cung trek (đi bộ)', en: 'Trek (on foot)' },
  { key: 'rail', color: '#7b4bb3', weight: 4, vi: 'Tàu leo núi', en: 'Funicular' },
  { key: 'cable', color: '#7b4bb3', dash: '10 6', weight: 3, vi: 'Cáp treo Fansipan', en: 'Fansipan cable car' },
  { key: 'road', color: '#5d6d65', weight: 2.5, vi: 'Đường ô tô / xe máy', en: 'Road' }
]
const kindOf = (key: string) => ROUTE_KINDS.find((k) => k.key === key) ?? ROUTE_KINDS[ROUTE_KINDS.length - 1]!
const catOf = (key: CatKey) => CATEGORIES.find((c) => c.key === key)!

const UI = {
  vi: {
    eyebrow: 'Bản đồ check-in',
    title: 'Bản đồ Sa Pa: điểm check-in, cung trek và điểm bay dù lượn',
    lead: '23 địa điểm nổi tiếng nhất Sa Pa trên một bản đồ: thị trấn, Fansipan, các bản làng trong thung lũng Mường Hoa, thác và đèo — kèm cung trek, tuyến cáp treo và đường bay dù lượn từ bản Hang Đá xuống Lao Chải.',
    loading: 'Đang tải bản đồ…',
    showOnMap: 'Xem trên bản đồ',
    routesTitle: 'Các tuyến trên bản đồ',
    note: 'Đường đi vẽ theo dữ liệu OpenStreetMap, khoảng cách là ước lượng. Cung leo Fansipan chỉ là sơ đồ; vị trí Moana và suối nước nóng Bản Hồ là gần đúng. Đường mòn trek thay đổi theo mùa — nên đi cùng người dẫn đường địa phương.',
    cta: 'Đặt bay dù lượn Sa Pa',
    metaTitle: 'Bản đồ Sa Pa: 23 điểm check-in, cung trek & điểm bay dù lượn',
    metaDesc: 'Bản đồ Sa Pa tương tác: Sun Plaza, Fansipan, Cát Cát, Lao Chải, Tả Van, Thác Bạc, Ô Quy Hồ, hồ Séo Mý Tỷ… kèm cung trek Mường Hoa và điểm cất, hạ cánh dù lượn.',
    crumb: 'Bản đồ Sa Pa'
  },
  en: {
    eyebrow: 'Checkpoint map',
    title: 'Sapa map: checkpoints, trekking routes and the paragliding site',
    lead: "Sapa's 23 best-known places on one map: the town, Fansipan, the villages of Muong Hoa Valley, waterfalls and passes — with trekking routes, the cable car line and the paragliding flight from Hang Da down to Lao Chai.",
    loading: 'Loading map…',
    showOnMap: 'Show on map',
    routesTitle: 'Routes on the map',
    note: 'Routes are drawn from OpenStreetMap data and distances are estimates. The Fansipan trek is only a schematic line; the positions of Moana and the Ban Ho hot spring are approximate. Trekking trails change with the season — go with a local guide.',
    cta: 'Book a paragliding flight in Sapa',
    metaTitle: 'Sapa Map: 23 Checkpoints, Trekking Routes & Paragliding Site',
    metaDesc: 'Interactive Sapa map: Sun Plaza, Fansipan, Cat Cat, Lao Chai, Ta Van, Silver Waterfall, O Quy Ho, Seo My Ty Lake… with the Muong Hoa trek and the paragliding take-off and landing.',
    crumb: 'Sapa map'
  }
}
const ui = computed(() => UI[lang.value])

const pointsByCat = (cat: CatKey) => data.points.filter((p) => p.cat === cat)
const gmaps = (p: MapPoint) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
const formatKm = (km: number) => (lang.value === 'vi' ? String(km).replace('.', ',') : String(km))

/* ---------- Leaflet (chỉ chạy ở trình duyệt) ---------- */
const mapEl = ref<HTMLElement | null>(null)
const mapReady = ref(false)
const activeCats = ref(new Set<CatKey>(CATEGORIES.map((c) => c.key)))
let map: any = null
let L: any = null
const markers = new Map<string, any>()
const catLayers = new Map<CatKey, any>()

const LEAFLET_VERSION = '1.9.4'
function loadLeaflet(): Promise<any> {
  const w = window as any
  if (w.L) return Promise.resolve(w.L)
  return new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css`
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js`
    js.async = true
    js.onload = () => resolve(w.L)
    js.onerror = reject
    document.head.appendChild(js)
  })
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]!))

function popupHtml(p: MapPoint) {
  const desc = lang.value === 'vi' ? p.dvi : p.den
  return `<strong class="sm-pop-title">${p.n}. ${esc(p[lang.value])}</strong><span class="sm-pop-desc">${esc(desc)}</span><a class="sm-pop-link" href="${gmaps(p)}" target="_blank" rel="noopener">Google Maps ↗</a>`
}

function buildLayers() {
  // tuyến trước, điểm sau (điểm nằm trên)
  for (const r of data.routes) {
    const k = kindOf(r.kind)
    // viền trắng bên dưới để tuyến nổi trên cả nền đường phố lẫn nền địa hình
    L.polyline(r.pts, { color: '#fff', weight: k.weight + 3.5, opacity: 0.85, lineCap: 'round', interactive: false }).addTo(map)
    L.polyline(r.pts, { color: k.color, weight: k.weight, dashArray: k.dash, opacity: 1, lineCap: 'round' })
      .bindTooltip(`${r[lang.value]} · ~${formatKm(r.km)} km`, { sticky: true })
      .addTo(map)
  }
  for (const cat of CATEGORIES) {
    const group = L.layerGroup()
    for (const p of pointsByCat(cat.key)) {
      const icon = L.divIcon({
        className: 'sm-pin-wrap',
        html: `<span class="sm-pin${cat.key === 'fly' ? ' sm-pin-fly' : ''}" style="background:${cat.color}">${p.n}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14]
      })
      const m = L.marker([p.lat, p.lon], { icon, title: p[lang.value], zIndexOffset: cat.key === 'fly' ? 500 : 0 }).bindPopup(popupHtml(p), { maxWidth: 260 })
      markers.set(p.id, m)
      group.addLayer(m)
    }
    catLayers.set(cat.key, group)
    group.addTo(map)
  }
}

function toggleCat(key: CatKey) {
  const next = new Set(activeCats.value)
  next.has(key) ? next.delete(key) : next.add(key)
  activeCats.value = next
  const layer = catLayers.get(key)
  if (!map || !layer) return
  next.has(key) ? layer.addTo(map) : map.removeLayer(layer)
}

function focusPoint(p: MapPoint) {
  if (!map) return
  if (!activeCats.value.has(p.cat)) toggleCat(p.cat)
  mapEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  map.flyTo([p.lat, p.lon], Math.max(map.getZoom(), 14), { duration: 0.8 })
  markers.get(p.id)?.openPopup()
}

onMounted(async () => {
  try {
    L = await loadLeaflet()
    if (!mapEl.value) return
    map = L.map(mapEl.value, { scrollWheelZoom: false, zoomControl: true })
    const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    const base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: osmAttribution }).addTo(map)
    // Nền dự phòng: mạng nào chặn máy chủ ảnh của OpenStreetMap thì ô nền
    // lỗi → đổi một lần sang OpenTopoMap (bản đồ địa hình, cũng dựng từ dữ
    // liệu OpenStreetMap, không cần khoá API).
    base.once('tileerror', () => {
      map.removeLayer(base)
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: `${osmAttribution}, SRTM | &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)`
      }).addTo(map)
    })
    buildLayers()
    map.fitBounds(L.latLngBounds(data.points.map((p) => [p.lat, p.lon])).pad(0.06))
    // Lăn chuột chỉ zoom sau khi khách bấm vào bản đồ — khỏi "kẹt" khi đang cuộn trang
    map.on('click', () => map.scrollWheelZoom.enable())
    map.on('mouseout', () => map.scrollWheelZoom.disable())
    mapReady.value = true
  } catch (err) {
    console.error('Không nạp được bản đồ:', err)
  }
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})

/* ---------- SEO ---------- */
useHead(() => {
  const hasOwn = MAP_LOCALES.includes(locale.value as SupportedLocale)
  const pageUrl = buildLocalizedUrl('/sapa-map', locale.value)
  const canonical = hasOwn ? pageUrl : buildLocalizedUrl('/sapa-map', 'en')
  const image = getDefaultOgImage()
  const placeList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: ui.value.title,
    itemListElement: data.points.map((p) => ({
      '@type': 'ListItem',
      position: p.n,
      item: {
        '@type': 'TouristAttraction',
        name: p[lang.value],
        description: lang.value === 'vi' ? p.dvi : p.den,
        geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lon }
      }
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
    link: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=Saira+Condensed:wght@600;700;800&display=swap' },
      { rel: 'canonical', href: canonical },
      ...buildHreflangLinks('/sapa-map', locale.value, MAP_LOCALES)
    ],
    script: [
      { type: 'application/ld+json', innerHTML: JSON.stringify(placeList) },
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
/* Cùng bảng màu và kiểu chữ với trang bài viết (.post-v2) */
.sapa-map-page {
  --sm-ink: #13241c;
  --sm-green: #1e5b45;
  --sm-red: #d1343f;
  --sm-muted: #5d6d65;
  --sm-line: #dfe6e3;
  background: #f2f5f5;
  color: #2a3a33;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.sapa-map-page .sm-eyebrow { margin-bottom: 1rem; color: var(--sm-red); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; }
.sapa-map-page .sm-title {
  margin-bottom: 1.25rem;
  color: var(--sm-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: clamp(2.1rem, 4.8vw, 3.6rem);
  font-weight: 800;
  line-height: 1.1;
  text-transform: uppercase;
  text-wrap: balance;
}
.sapa-map-page .sm-lead { max-width: 48rem; font-size: 1.1rem; font-weight: 300; line-height: 1.75; }

.sapa-map-page .sm-filter {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.4rem 0.85rem; border: 1px solid var(--sm-line); border-radius: 999px;
  background: #fff; color: var(--sm-ink); font-size: 0.9rem; font-weight: 400; cursor: pointer;
}
.sapa-map-page .sm-filter-off { opacity: 0.45; text-decoration: line-through; }
.sapa-map-page .sm-dot { width: 0.7rem; height: 0.7rem; border-radius: 50%; }

.sapa-map-page .sm-map-frame { position: relative; overflow: hidden; border: 1px solid var(--sm-line); border-radius: 0.75rem; background: #e3ebe8; }
.sapa-map-page .sm-map { width: 100%; height: min(72vh, 640px); min-height: 380px; z-index: 0; }
.sapa-map-page .sm-map-wait { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--sm-muted); font-weight: 300; pointer-events: none; }

.sapa-map-page .sm-pin-wrap { background: none; border: 0; }
.sapa-map-page .sm-pin {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 2px solid #fff; border-radius: 50%;
  color: #fff; font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1rem; font-weight: 700; line-height: 1;
  box-shadow: 0 2px 6px rgba(19, 36, 28, 0.45);
}
.sapa-map-page .sm-pin-fly { width: 34px; height: 34px; margin: -2px; border-width: 3px; box-shadow: 0 0 0 4px rgba(209, 52, 63, 0.25), 0 2px 6px rgba(19, 36, 28, 0.45); }
.sapa-map-page .leaflet-popup-content { margin: 0.8rem 0.9rem; font-family: 'Lexend', system-ui, sans-serif; line-height: 1.5; }
.sapa-map-page .sm-pop-title { display: block; margin-bottom: 0.25rem; color: var(--sm-ink); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.15rem; line-height: 1.15; }
.sapa-map-page .sm-pop-desc { display: block; color: #2a3a33; font-size: 0.85rem; font-weight: 300; }
.sapa-map-page .sm-pop-link { display: inline-block; margin-top: 0.4rem; color: var(--sm-red); font-size: 0.85rem; font-weight: 500; }

.sapa-map-page .sm-legend { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin-top: 0.9rem; color: var(--sm-muted); font-size: 0.85rem; font-weight: 300; }
.sapa-map-page .sm-legend li { display: inline-flex; align-items: center; gap: 0.5rem; }

.sapa-map-page .sm-h2 {
  margin-bottom: 1rem; color: var(--sm-green);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: clamp(1.55rem, 3vw, 2.2rem); font-weight: 700; line-height: 1.05; text-transform: uppercase;
}
.sapa-map-page .sm-list { display: grid; gap: 1rem 2rem; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); }
.sapa-map-page .sm-list > li { display: flex; gap: 0.85rem; align-items: flex-start; padding: 0.9rem 1rem; border: 1px solid var(--sm-line); border-radius: 0.5rem; background: #fff; }
.sapa-map-page .sm-num {
  flex: none; width: 2.1rem; height: 2.1rem; border: 0; border-radius: 50%; cursor: pointer;
  color: #fff; font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.15rem; font-weight: 700;
}
.sapa-map-page .sm-h3 { color: var(--sm-ink); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.3rem; font-weight: 700; line-height: 1.15; }
.sapa-map-page .sm-desc { margin-top: 0.25rem; font-size: 0.95rem; font-weight: 300; line-height: 1.6; }
.sapa-map-page .sm-links { display: flex; gap: 1rem; margin-top: 0.4rem; font-size: 0.85rem; }
.sapa-map-page .sm-links button, .sapa-map-page .sm-links a { padding: 0; border: 0; background: none; color: var(--sm-red); font-weight: 500; cursor: pointer; }
.sapa-map-page .sm-links button:hover, .sapa-map-page .sm-links a:hover { text-decoration: underline; }

.sapa-map-page .sm-routes { display: grid; gap: 0.55rem; }
.sapa-map-page .sm-routes li { display: flex; gap: 0.7rem; align-items: center; font-weight: 300; }
.sapa-map-page .sm-routes svg { flex: none; }
.sapa-map-page .sm-routes em { color: var(--sm-muted); font-style: normal; white-space: nowrap; }
.sapa-map-page .sm-note { margin-top: 1rem; max-width: 48rem; color: var(--sm-muted); font-size: 0.85rem; font-weight: 300; line-height: 1.6; }
.sapa-map-page .sm-cta {
  display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; border-radius: 0.375rem;
  background: var(--sm-red); color: #fff;
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.sapa-map-page .sm-cta:hover { background: #b82a35; }
</style>
