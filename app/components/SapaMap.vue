<template>
  <!--
    Sơ đồ checkpoint Sa Pa (kiểu sơ đồ Hà Giang Loop): vùng trung tâm phóng to
    trên nền địa hình thật; các điểm xa (s.far) đặt sát mép, đường tới đó rút
    gọn và chỉ ghi số km. Mỗi điểm là một link sang /sapa-map/<slug>. Dùng chung cho trang
    bản đồ, trang từng điểm và trang chủ. Vị trí điểm: shared/sapa-map.ts;
    đường đi: app/data/sapa-map-geo.json; ảnh nền: /images/sapa-map/topo.jpg.
  -->
  <nav class="smap" :class="[`smap-${view}`, { 'smap-flying': zoom }]" :style="{ aspectRatio: `1000 / ${H}` }" @pointerenter.once="preloadHi" @keydown.esc="closeZoom" :aria-label="lang === 'vi' ? 'Sơ đồ checkpoint Sa Pa' : 'Sapa checkpoint map'">
    <!-- Nền địa hình của vùng trung tâm: tô màu theo độ cao + bóng đổ, dựng từ
         dữ liệu độ cao AWS Terrain Tiles (không có đường nhỏ, chữ — cho rõ cung
         đường). Các điểm gần và đường đi đặt đúng toạ độ trên nền này. -->
    <!-- lớp "bay vào": bấm một điểm thì máy quay nghiêng 3D và sà xuống điểm đó; nền đổi sang bản nét ×2,
         hiện thêm chi tiết phụ (đỉnh núi, độ cao, thôn bản) và thẻ xem nhanh. Bấm ra ngoài / Esc để thu về. -->
    <div class="smap-zoom" :class="{ 'smap-zooming': zoom }" :style="zoomStyle" @click.self="closeZoom">
    <div class="smap-sway" :style="zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined">
    <img :src="view === '3d' ? '/images/sapa-map/topo-3d.jpg' : '/images/sapa-map/topo.jpg'" alt="" class="smap-topo" loading="lazy" decoding="async" aria-hidden="true" />
    <img v-if="hiWanted" :src="view === '3d' ? '/images/sapa-map/topo-3d-2x.jpg' : '/images/sapa-map/topo-2x.jpg'" alt="" class="smap-topo smap-topo-hi" :class="{ on: zoom && hiReady[view] }" decoding="async" aria-hidden="true" @load="hiReady[view] = true" />
    <!-- ảnh soi gần (6 px / đơn vị sơ đồ, có đường mòn, nhà cửa, đồng mức 20 m) của riêng điểm đang soi -->
    <img v-if="zoomTile" :key="zoomTile.src" :src="zoomTile.src" alt="" class="smap-tile" :class="{ on: tileReady === zoomTile.src }" :style="zoomTile.style" decoding="async" aria-hidden="true" @load="tileReady = zoomTile.src" />

    <svg :viewBox="`0 0 1000 ${H}`" class="smap-svg" aria-hidden="true" focusable="false" @click="closeZoom">
      <!-- chi tiết phụ: chỉ hiện khi bay vào -->
      <g class="smap-detail">
        <g v-for="(d, i) in g.details" :key="`d${i}`" :transform="`translate(${d[0]} ${d[1]})`">
          <template v-if="d[2] === 'p'">
            <path d="M-1.6 0.9 0 -1.8 1.6 0.9Z" />
            <text y="4.4" text-anchor="middle">{{ d[4].toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US') }} m</text>
          </template>
          <template v-else>
            <circle r="1" />
            <text x="2" y="1.3">{{ d[3] }}</text>
          </template>
        </g>
      </g>
      <!-- vùng thị trấn Sa Pa: khoanh viền, phần bên trong được phóng to so với phần còn lại của sơ đồ -->
      <g v-if="g.town" class="smap-town">
        <path :d="g.town.d" />
        <text :x="g.town.label[0]" :y="g.town.label[1]" text-anchor="middle">{{ lang === 'vi' ? 'THỊ TRẤN SA PA · phóng to ×1,6' : 'SA PA TOWN · enlarged ×1.6' }}</text>
      </g>

      <!-- đường ô tô / xe máy: hình học thật, chạy tới mép khung; nét to nhỏ theo cấp đường (1 quốc lộ, 2 đường tỉnh, 3 đường bản/phố) -->
      <g v-for="(r, i) in g.roads" :key="`r${i}`">
        <path :d="r[0]" fill="none" stroke="#5c1e0e" :style="{ strokeWidth: `calc(${ROAD_W[r[1]][0]}px * var(--zk))` }" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="r[0]" fill="none" stroke="#e24a28" :style="{ strokeWidth: `calc(${ROAD_W[r[1]][1]}px * var(--zk))` }" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <!-- tên đường lớn, đặt dọc theo đường -->
      <g class="smap-road-name">
        <text v-for="(n, i) in g.names" :key="`n${i}`" :x="n[0]" :y="n[1]" text-anchor="middle" :transform="`rotate(${Math.abs(n[2]) > 90 ? n[2] + 180 : n[2]} ${n[0]} ${n[1]}) translate(0 -9)`">{{ n[3] }}</text>
      </g>
      <!-- đoạn đường rút gọn tới các điểm xa: không theo tỉ lệ, chỉ ghi số km -->
      <path v-for="(d, i) in g.stubs" :key="`s${i}`" :d="d" fill="none" stroke="#5c1e0e" style="stroke-width: calc(3.6px * var(--zk))" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 8" />

      <!-- mũi tên cuối đoạn rút gọn: đường đổ xuống bên kia núi (Tả Phìn) -->
      <path v-for="(a, i) in g.arrows" :key="`a${i}`" d="M-7 -5 L5 0 L-7 5 Z" fill="#5c1e0e" :transform="`translate(${a[0]} ${a[1]}) rotate(${a[2]})`" />

      <!-- cung trek (đi bộ) -->
      <g v-for="(d, i) in g.treks" :key="`t${i}`">
        <path :d="d" fill="none" stroke="#fffdf6" style="stroke-width: calc(7px * var(--zk))" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="d" fill="none" stroke="#14703a" style="stroke-width: calc(3.8px * var(--zk))" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5 8" />
      </g>
      <!-- người đi bộ trên cung trek -->
      <g v-for="(h, i) in g.hikers" :key="`h${i}`" :transform="`translate(${h[0]} ${h[1]})`" class="smap-hiker smap-ico">
        <circle r="13" />
        <g transform="translate(-8.5 -9.5) scale(0.72)" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13" cy="4" r="2.6" fill="currentColor" stroke="none" />
          <path d="M13 9 L10 16 L13 20 L12 25" />
          <path d="M10 16 L6 25" />
          <path d="M12 11 L17 14 L20 13" />
          <path d="M11 11 L8 13 L8 16" />
          <path d="M20 9 L20 25" />
        </g>
      </g>

      <!-- tàu leo núi Mường Hoa (đường ray thật) + cáp treo Fansipan -->
      <path :d="g.cable" fill="none" stroke="#fffdf6" style="stroke-width: calc(6px * var(--zk))" stroke-linecap="round" />
      <path :d="g.cable" fill="none" stroke="#164e6e" style="stroke-width: calc(3px * var(--zk))" stroke-linecap="round" stroke-dasharray="10 7" />
      <path :d="g.funicular" fill="none" stroke="#fffdf6" style="stroke-width: calc(10px * var(--zk))" stroke-linecap="round" stroke-linejoin="round" />
      <path :d="g.funicular" fill="none" stroke="#164e6e" style="stroke-width: calc(6.5px * var(--zk))" stroke-linecap="butt" stroke-linejoin="round" />
      <path :d="g.funicular" fill="none" stroke="#fffdf6" style="stroke-width: calc(2.8px * var(--zk))" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="7 7" />
      <circle class="smap-ico" :cx="g.station[0]" :cy="g.station[1]" r="7.5" fill="#fffdf6" stroke="#164e6e" stroke-width="3.2" />

      <!-- cabin cáp treo trên tuyến cáp Fansipan -->
      <g :transform="`translate(${g.gondola[0]} ${g.gondola[1]})`" class="smap-gondola smap-ico">
        <circle r="13" />
        <g transform="translate(-9 -9) scale(0.75)"><path d="M3 5 21 3" /><path d="M12 4v4" /><rect x="6" y="8" width="12" height="10" rx="3" /><path d="M6 13h12" /></g>
      </g>

      <!-- dấu ngắt: từ đây ra điểm xa không còn đúng tỉ lệ -->
      <g v-for="(b, i) in g.breaks" :key="`b${i}`" :transform="`translate(${b[0]} ${b[1]}) rotate(${b[2]})`" class="smap-break smap-ico">
        <rect x="-6" y="-8" width="12" height="16" rx="2" />
        <path d="M-5 8 L-1 -8 M1 8 L5 -8" />
      </g>

      <!-- đường bay dù lượn -->
      <path :d="g.flight" fill="none" stroke="#fffdf6" style="stroke-width: calc(7px * var(--zk))" stroke-linecap="round" />
      <path :d="g.flight" fill="none" stroke="#78146e" style="stroke-width: calc(3.6px * var(--zk))" stroke-linecap="round" stroke-dasharray="10 7" />
      <!-- mũi tên cuối đường bay, chỉ xuống điểm hạ cánh -->
      <path class="smap-ico" d="M-9 -7 L7 0 L-9 7 Z" fill="#78146e" stroke="#fffdf6" stroke-width="1.6" stroke-linejoin="round" :transform="`translate(${g.flightArrow[0]} ${g.flightArrow[1]}) rotate(${g.flightArrow[2]})`" />
      <!-- dù nhỏ đang bay trên đường bay -->
      <g v-for="(p, i) in g.gliders" :key="`gl${i}`" :transform="`translate(${p[0]} ${p[1] - 4}) scale(0.62)`" class="smap-ico">
        <path d="M-17 0 Q0 -19 17 0 Q0 -8 -17 0 Z" fill="#f2963e" stroke="#1c1a16" stroke-width="2" stroke-linejoin="round" />
        <path d="M-11 -2 L0 14 L11 -2" fill="none" stroke="#1c1a16" stroke-width="1.5" />
        <circle cx="0" cy="15" r="3.2" fill="#1c1a16" />
      </g>

      <!-- chữ phụ trên sơ đồ -->
      <g class="smap-minor">
        <circle class="smap-ico" :cx="g.labels.tramton[0]" :cy="g.labels.tramton[1]" r="5" fill="#fffdf6" stroke="#14703a" stroke-width="2.5" />
        <text :x="g.labels.trek[0]" :y="g.labels.trek[1]" class="smap-trek-name">Trạm Tôn → Fansipan</text>
        <text :x="g.labels.trek[0]" :y="g.labels.trek[1] + 16">{{ lang === 'vi' ? 'leo bộ 1–2 ngày · trek' : '1–2 day trek · leo bộ' }}</text>
        <text :x="g.labels.station[0] - 12" :y="g.labels.station[1] - 12" text-anchor="end" class="smap-rail-name">{{ lang === 'vi' ? 'Ga cáp treo' : 'Cable car station' }}</text>
        <text :x="g.labels.ylinhho[0] - 4" :y="g.labels.ylinhho[1] + 22" text-anchor="end">Ý Linh Hồ</text>
        <text :x="g.labels.muonghoa[0]" :y="g.labels.muonghoa[1]" text-anchor="middle" class="smap-river-name" :transform="`rotate(24 ${g.labels.muonghoa[0]} ${g.labels.muonghoa[1]})`">{{ lang === 'vi' ? 'thung lũng Mường Hoa · valley' : 'Muong Hoa Valley · thung lũng' }}</text>
      </g>

      <!-- tên sơ đồ -->
      <text x="60" :y="H - 140" class="smap-title" :transform="`rotate(-6 60 ${H - 140})`">Sapa Map</text>

      <!-- la bàn -->
      <g transform="translate(944 58)" class="smap-compass-g">
        <circle r="22" fill="#fffdf6" stroke="#1c1a16" stroke-width="1.8" />
        <path d="M0 -17 L5 0 L0 17 L-5 0 Z" fill="#1c1a16" opacity="0.3" />
        <path d="M0 -17 L5 0 L-5 0 Z" fill="#d4261c" />
        <text y="-27" text-anchor="middle" class="smap-compass">N</text>
      </g>
    </svg>

    <a
      v-for="s in SAPA_STOPS"
      :key="s.slug"
      :href="localePath(`/sapa-map/${s.slug}`)"
      class="smap-stop"
      :class="[`smap-side-${g.side?.[s.slug] ?? s.side}`, `smap-kind-${s.kind}`, { 'smap-active': s.slug === active, 'smap-target': zoom?.slug === s.slug, 'smap-far': s.far && !g.nofar?.includes(s.slug) }]"
      :style="{ left: `${(g.pos?.[s.slug]?.[0] ?? s.x) / 10}%`, top: `${((g.pos?.[s.slug]?.[1] ?? s.y) / H) * 100}%` }"
      :aria-current="s.slug === active ? 'page' : undefined"
      @click="onStopClick($event, s.slug)"
    >
      <span class="smap-dot">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <img v-if="s.slug === 'takeoff'" src="/images/sapa-map/logo-fly.png" alt="" class="smap-logo" />
        <svg v-else viewBox="0 0 24 24" aria-hidden="true" v-html="ICONS[s.slug]"></svg>
        <b>{{ s.n }}</b>
      </span>
      <span class="smap-label">
        <small>{{ TAGS[s.slug]?.[lang] }}</small>
        <span class="smap-name">{{ NAMES[s.slug]?.[lang] }}<i v-if="SUBS[s.slug]">{{ SUBS[s.slug]?.[lang] }}</i></span>
        <em v-if="s.kind === 'fly'">{{ lang === 'vi' ? 'Dù lượn' : 'Paragliding' }}</em>
      </span>
    </a>
    </div>
    </div>

    <!-- bản đồ 3D thật (MapLibre): mở khi bấm một điểm; chữ và chi tiết được vẽ lại ở mọi mức zoom nên luôn thẳng, nét -->
    <ClientOnly>
      <SapaMap3D v-if="zoom && !failed3d" ref="map3d" :slug="zoom.slug" :lang="lang" :names="NAMES" @select="selectStop" @fail="failed3d = true" @closed="zoom = null" />
    </ClientOnly>

    <!-- thẻ xem nhanh của điểm đang soi -->
    <Transition name="smap-card">
      <div v-if="zoom && card" class="smap-card" role="dialog" :aria-label="NAMES[zoom.slug]?.[lang]">
        <button type="button" class="smap-card-x" :aria-label="lang === 'vi' ? 'Thu nhỏ bản đồ' : 'Zoom out'" @click="closeZoom">×</button>
        <img :src="card.img" alt="" loading="lazy" />
        <div class="smap-card-b">
          <small>{{ TAGS[zoom.slug]?.[lang] }}</small>
          <strong>{{ NAMES[zoom.slug]?.[lang] }}</strong>
          <p>{{ card[lang] }}</p>
          <a :href="localePath(`/sapa-map/${zoom.slug}`)" class="smap-card-go" @click.prevent="openStop(zoom.slug)">{{ lang === 'vi' ? 'Xem chi tiết →' : 'Read more →' }}</a>
        </div>
      </div>
    </Transition>

    <!-- chuyển giữa bản dựng nổi 3D và bản nhìn thẳng 2D -->
    <div class="smap-toggle" role="group" :aria-label="lang === 'vi' ? 'Kiểu bản đồ' : 'Map style'">
      <button type="button" :class="{ on: view === '3d' }" :aria-pressed="view === '3d'" @click="view = '3d'">3D</button>
      <button type="button" :class="{ on: view === '2d' }" :aria-pressed="view === '2d'" @click="view = '2d'">2D</button>
    </div>

    <!-- chú giải -->
    <ul class="smap-legend">
      <li><i class="lg-road"></i>{{ lang === 'vi' ? 'Quốc lộ · Highway' : 'Highway' }}</li>
      <li><i class="lg-road lg-road-s"></i>{{ lang === 'vi' ? 'Đường nhỏ · Local' : 'Local road' }}</li>
      <li><b class="lg-break">//</b>{{ lang === 'vi' ? 'xa, xem km · far' : 'far, see km' }}</li>
      <li><i class="lg-trek"></i>{{ lang === 'vi' ? 'Đi bộ · Trek' : 'Trek' }}</li>
      <li><i class="lg-cable"></i>{{ lang === 'vi' ? 'Tàu, cáp treo · Rail' : 'Rail & cable car' }}</li>
      <li><i class="lg-fly"></i>{{ lang === 'vi' ? 'Bay · Flight' : 'Flight' }}</li>
    </ul>
    <p class="smap-attr">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · AWS Terrain Tiles (SRTM)</p>
  </nav>
</template>

<script setup lang="ts">
import mapGeo from '~/data/sapa-map-geo.json'
import mapGeo3d from '~/data/sapa-map-geo-3d.json'
import CARDS from '~/data/sapa-map-cards.json'
import ZOOM_TILES from '~/data/sapa-map-zoom.json'
import { SAPA_STOPS } from '~~/shared/sapa-map'

defineProps<{ active?: string }>()

const { locale } = useI18n()
const localePath = useLocalePath()
const lang = computed<'vi' | 'en'>(() => (locale.value === 'vi' ? 'vi' : 'en'))

// Font của sơ đồ — khai ngay trong component để trang nào nhúng sơ đồ (trang
// chủ, trang bản đồ) cũng có đủ, không phải nhớ khai ở từng trang.
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=Saira+Condensed:wght@600;700;800&family=Yellowtail&display=swap' }
  ]
})

/** Tên ngắn trên sơ đồ. */
const NAMES: Record<string, { vi: string; en: string }> = {
  'sun-plaza': { vi: 'Sun Plaza', en: 'Sun Plaza' },
  'ham-rong': { vi: 'Núi Hàm Rồng', en: 'Ham Rong Mountain' },
  moana: { vi: 'Moana', en: 'Moana' },
  fansipan: { vi: 'Fansipan', en: 'Fansipan' },
  'cat-cat': { vi: 'Bản Cát Cát', en: 'Cat Cat village' },
  takeoff: { vi: 'Điểm cất cánh dù lượn', en: 'Paragliding take-off' },
  'lao-chai': { vi: 'Lao Chải · Hạ cánh', en: 'Lao Chai · Landing' },
  'ta-van': { vi: 'Bản Tả Van', en: 'Ta Van village' },
  'ban-ho': { vi: 'Suối nóng Bản Hồ', en: 'Ban Ho hot spring' },
  'seo-my-ty': { vi: 'Hồ Séo Mý Tỷ', en: 'Seo My Ty Lake' },
  'ta-phin': { vi: 'Bản Tả Phìn', en: 'Ta Phin village' },
  'thac-bac': { vi: 'Thác Bạc', en: 'Silver Waterfall' },
  'o-quy-ho': { vi: 'Đèo Ô Quy Hồ', en: 'O Quy Ho Pass' },
  'rong-may': { vi: 'Cầu kính Rồng Mây', en: 'Rong May Glass Bridge' },
  bestview: { vi: 'Best View', en: 'Best View' },
  'tau-leo-nui': { vi: 'Tàu leo núi Mường Hoa', en: 'Muong Hoa funicular' }
}

/**
 * Dòng nhỏ dưới tên (tuỳ chọn), bằng ngôn ngữ còn lại. Hiện để trống cho nhãn
 * gọn, khỏi che đường; thêm một dòng `slug: { vi, en }` nếu cần chú thích song ngữ.
 */
const SUBS: Record<string, { vi: string; en: string }> = {
}

/** Dòng nhỏ trên tên: quãng đường bộ từ Sun Plaza (OpenStreetMap) hoặc độ cao. */
const TAGS: Record<string, { vi: string; en: string }> = {
  'sun-plaza': { vi: 'Km 0 · Sân quần', en: 'Km 0 · Town square' },
  'ham-rong': { vi: 'Sau nhà thờ đá', en: 'Behind the church' },
  moana: { vi: '1,7 km', en: '1.7 km' },
  fansipan: { vi: 'cáp treo 6,3 km', en: 'cable car 6.3 km' },
  'cat-cat': { vi: '2–3 km', en: '2–3 km' },
  takeoff: { vi: '6 km · 1.500 m', en: '6 km · 1,500 m' },
  'lao-chai': { vi: '9 km', en: '9 km' },
  'ta-van': { vi: '10,5 km', en: '10.5 km' },
  'ban-ho': { vi: '24 km', en: '24 km' },
  'seo-my-ty': { vi: '22 km', en: '22 km' },
  'ta-phin': { vi: '13 km', en: '13 km' },
  'thac-bac': { vi: '14 km', en: '14 km' },
  'o-quy-ho': { vi: '17 km', en: '17 km' },
  'rong-may': { vi: '20 km', en: '20 km' },
  bestview: { vi: 'Cách bãi bay 1 km', en: '1 km from take-off' },
  'tau-leo-nui': { vi: '2 km · ~6 phút', en: '2 km · ~6 min' }
}

/**
 * Đường đi đã chiếu sẵn lên khung 1000x780 (hình học thật từ OpenStreetMap,
 * cắt ở mép). stubs: đoạn nối rút gọn tới các điểm xa; breaks: [x, y, góc]
 * của dấu ngắt "không theo tỉ lệ".
 */
interface MapGeo {
  /** Chỉ bản 3D: chiều cao khung, vị trí điểm và phía đặt nhãn sau khi chiếu nổi. */
  H?: number
  pos?: Record<string, [number, number]>
  side?: Record<string, string>
  /** Chỉ bản 3D: điểm "xa" ở bản 2D nhưng nằm trọn trong khung 3D (đường thật vẽ tới nơi). */
  nofar?: string[]
  town?: { d: string; label: [number, number] }
  /** Chi tiết phụ hiện khi bay vào: [x, y, 'p' đỉnh núi | 'v' thôn bản, tên, độ cao m]. */
  details?: Array<[number, number, 'p' | 'v', string, number]>
  roads: Array<[string, 1 | 2 | 3]>
  names: Array<[number, number, number, string]>
  treks: string[]
  funicular: string
  cable: string
  stubs: string[]
  arrows: Array<[number, number, number]>
  breaks: Array<[number, number, number]>
  flight: string
  gliders: Array<[number, number]>
  flightArrow: [number, number, number]
  station: [number, number]
  gondola: [number, number]
  hikers: Array<[number, number]>
  labels: Record<'tramton' | 'trek' | 'station' | 'rail' | 'ylinhho' | 'giangtachai' | 'muonghoa', [number, number]>
}

/**
 * Biểu tượng của từng điểm (nét vẽ trong ô 24×24, hiện trong chấm tròn): chóp
 * tam giác trên đỉnh Fansipan, cổng chẻ kiểu Bali của Moana, mây + mặt trời ở
 * Best View (săn mây), thác nước, suối khoáng nóng…
 */
const ICONS: Record<string, string> = {
  'sun-plaza': '<path d="M12 2v5M10 4h4"/><path d="M8 21V11l4-4 4 4v10Z"/><path d="M4 21v-6l4-2M20 21v-6l-4-2M3 21h18"/>',
  'ham-rong': '<path d="M2 20 9 7l4 7 2.5-4L22 20Z"/><path d="M9 7 7.6 10 9 11l1.4-1Z"/>',
  moana: '<path d="M10 21V5l-2 2v3l-2 1.5V15l-2 1.5V21Z"/><path d="M14 21V5l2 2v3l2 1.5V15l2 1.5V21Z"/>',
  fansipan: '<path d="M12 3 21 20H3Z"/><path d="M12 3 14.5 20"/>',
  'cat-cat': '<circle cx="12" cy="11" r="7"/><path d="M12 4v14M5 11h14M7 6l10 10M17 6 7 16"/><path d="M3 21h18"/>',
  takeoff: '<path d="M3 9c3-6 15-6 18 0-3-2-15-2-18 0Z"/><path d="M4.5 9 12 18l7.5-9"/><circle cx="12" cy="20" r="1.6"/>',
  'lao-chai': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  'ta-van': '<path d="M3 11 12 4l9 7"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/>',
  'ban-ho': '<path d="M4 16a8 4 0 0 0 16 0Z"/><path d="M8 4c-1.5 2 1.5 3 0 5s1 2.5 0 4M12 3c-1.5 2 1.5 3 0 5s1 3 0 5M16 4c-1.5 2 1.5 3 0 5s1 2.5 0 4"/>',
  'seo-my-ty': '<path d="M3 8c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 13c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 18c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/>',
  'ta-phin': '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z"/><path d="M5 19 14 10"/>',
  'thac-bac': '<path d="M5 4h14"/><path d="M8 4v9M12 4v11M16 4v9"/><path d="M4 19c2-2 3 2 5 0s3 2 5 0 3 2 6 0"/>',
  'o-quy-ho': '<path d="M5 21c0-4 12-3 12-7s-10-2-10-6 9-2 9-5"/>',
  'rong-may': '<path d="M2 15h20"/><path d="M4 19V8M20 19V8"/><path d="M4 8c4 6 12 6 16 0"/><path d="M8 15v-3.6M12 15v-2.6M16 15v-3.6"/>',
  'tau-leo-nui': '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="13.5" r="0.8"/><circle cx="15" cy="13.5" r="0.8"/>',
  bestview: '<circle cx="8" cy="8" r="3"/><path d="M8 2v1.5M2.5 8H4M4 4l1 1M12 4l-1 1"/><path d="M7 19h10a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.3 1.3A3 3 0 0 0 7 19Z"/>'
}

/** Bề rộng nét [viền, lõi] theo cấp đường. */
const ROAD_W: Record<number, [number, number]> = { 1: [9.5, 6.4], 2: [6.6, 4], 3: [4.2, 2.2] }

// Hai bản của cùng một sơ đồ: 3D (địa hình dựng nổi, nhìn chếch từ phía nam —
// mặc định vì dễ hình dung thung lũng) và 2D (nhìn thẳng từ trên xuống).
const view = ref<'3d' | '2d'>('3d')
const g = computed<MapGeo>(() => (view.value === '3d' ? (mapGeo3d as unknown as MapGeo) : (mapGeo as unknown as MapGeo)))
const H = computed(() => g.value.H ?? 780)

/**
 * Bấm một điểm: máy quay nghiêng 3D và sà xuống điểm đó (đưa điểm vào giữa khung), nền đổi sang
 * bản nét ×2, hiện chi tiết phụ và thẻ xem nhanh; nút trên thẻ mới mở bài. Bấm điểm khác thì bay
 * sang điểm đó; bấm nền / Esc / nút × thì thu về. Ctrl/⌘-click, chuột giữa mở bài như link thường;
 * người dùng tắt hiệu ứng chuyển động thì vẫn hiện thẻ nhưng không có chuyển động.
 */
const ZOOM_SCALE = 4.2
const ZOOM_TILT = 32
const ZOOM_TURN = -7
const zoom = ref<{ slug: string; x: number; y: number } | null>(null)
const router = useRouter()
const card = computed(() => (zoom.value ? (CARDS as Record<string, { img: string; vi: string; en: string }>)[zoom.value.slug] : undefined))
const hiWanted = ref(false)
const hiReady = reactive<Record<string, boolean>>({ '3d': false, '2d': false })
function preloadHi() { hiWanted.value = true }
/** Màn hẹp: thẻ nằm dưới đáy nên đưa điểm lên giữa-trên thay vì sang trái. */
const narrow = ref(false)
onMounted(() => { const m = window.matchMedia('(max-width: 767px)'); narrow.value = m.matches; m.addEventListener?.('change', (e) => { narrow.value = e.matches }) })
const zoomStyle = computed(() => {
  if (!zoom.value || !failed3d.value) return undefined   // bản 3D thật đang dùng → không kéo giãn sơ đồ
  const { x, y } = zoom.value
  // điểm giữ nguyên chỗ khi nghiêng + phóng (origin tại điểm), rồi dời về ~42% ngang, 58% dọc để chừa chỗ cho thẻ
  return { transformOrigin: `${x}% ${y}%`, transform: `translate(${(narrow.value ? 50 : 36) - x}%, ${(narrow.value ? 40 : 58) - y}%) perspective(1000px) rotateX(${ZOOM_TILT}deg) rotateZ(${ZOOM_TURN}deg) scale(${ZOOM_SCALE})` }
})
/** Ảnh soi gần của điểm đang soi: [x, y, rộng, cao] theo đơn vị sơ đồ → % khung. */
const tileReady = ref('')
const zoomTile = computed(() => {
  if (!zoom.value) return null
  const r = (ZOOM_TILES as Record<string, Record<string, number[]>>)[view.value]?.[zoom.value.slug]
  if (!r) return null
  return { src: `/images/sapa-map/z/${zoom.value.slug}-${view.value}.jpg`, style: { left: `${r[0] / 10}%`, top: `${(r[1] / H.value) * 100}%`, width: `${r[2] / 10}%`, height: `${(r[3] / H.value) * 100}%` } }
})
function onStopClick(e: MouseEvent, slug: string) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  e.stopPropagation()
  const s = SAPA_STOPS.find((x) => x.slug === slug)
  if (!s) return
  if (zoom.value?.slug === slug) { openStop(slug); return }
  if (failed3d.value) preloadHi()
  selectStop(slug)
}
function openStop(slug: string) { router.push(localePath(`/sapa-map/${slug}`)) }
/** Có WebGL thì dùng bản đồ 3D thật; lỗi thì quay về hiệu ứng phóng sơ đồ cũ. */
const failed3d = ref(false)
const map3d = ref<{ zoomOut: () => void } | null>(null)
function selectStop(slug: string) {
  const s = SAPA_STOPS.find((x) => x.slug === slug)
  if (!s) return
  const [x, y] = g.value.pos?.[slug] ?? [s.x, s.y]
  zoom.value = { slug, x: x / 10, y: (y / H.value) * 100 }
}
function closeZoom() {
  if (zoom.value && !failed3d.value && map3d.value) map3d.value.zoomOut()
  else zoom.value = null
}
watch(view, closeZoom)
</script>

<style>
/* Bảng màu theo bản đồ "Đường đến điểm bay Khau Phạ" của mebayluon.com: nền
   địa hình tô theo độ cao, đường đỏ viền nâu, nhãn giấy viền mực, ô km đỏ sẫm,
   cất cánh xanh rêu, hạ cánh xanh dương, đường bay tím. */
.smap {
  --ink: #1c1a16; --paper: #fffdf6; --road: #e24a28; --km: #781e14; --green: #0f2e21; --blue: #164e6e; --orange: #f2963e; --flight: #78146e;
  position: relative;
  width: 100%;
  border: 2px solid var(--green);
  border-radius: 1rem;
  background: #c4d292;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow: hidden;
}
.smap-topo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; pointer-events: none; }
.smap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.smap-zoom { position: absolute; inset: 0; transition: transform 1.25s cubic-bezier(0.2, 0.7, 0.2, 1), --zk 1.25s, --zi 1.25s; --zk: 1; --zi: 1; }
.smap-zoom.smap-zooming { --zk: 0.34; --zi: 0.36; }
@property --zk { syntax: '<number>'; inherits: true; initial-value: 1; }
@property --zi { syntax: '<number>'; inherits: true; initial-value: 1; }
.smap-sway { position: absolute; inset: 0; }
.smap-zooming .smap-sway { animation: smap-sway 9s 1.3s ease-in-out infinite; }
@keyframes smap-sway { 0%, 100% { transform: rotate(0deg) scale(1); } 30% { transform: rotate(1.4deg) scale(1.015); } 70% { transform: rotate(-1.2deg) scale(1.01); } }
.smap-tile { position: absolute; z-index: 1; max-width: none; object-fit: fill; opacity: 0; transition: opacity 0.7s 0.4s; pointer-events: none; }
.smap-tile.on { opacity: 1; }
.smap-svg { z-index: 2; }
.smap-stop { transition: scale 1.25s cubic-bezier(0.2, 0.7, 0.2, 1); }
.smap-zooming .smap-stop { scale: 0.36; }
.smap-ico { transform-box: fill-box; transform-origin: center; scale: var(--zi); }
.smap-town path { stroke-width: calc(2.2px * var(--zk)); }
.smap-zooming .smap-title, .smap-zooming .smap-compass-g { opacity: 0; transition: opacity 0.3s; }
.smap-flying { background: linear-gradient(#cfe3ee, #eef1e4 60%); }
.smap-topo-hi { opacity: 0; transition: opacity 0.6s 0.35s; }
.smap-topo-hi.on { opacity: 1; }
.smap-detail { opacity: 0; transition: opacity 0.5s 0.45s; pointer-events: none; }
.smap-zooming .smap-detail { opacity: 1; }
.smap-detail path { fill: #5c3a1e; stroke: var(--paper); stroke-width: 0.35; }
.smap-detail circle { fill: var(--ink); stroke: var(--paper); stroke-width: 0.35; }
.smap-detail text { fill: var(--ink); font-size: 2.9px; font-weight: 600; paint-order: stroke; stroke: var(--paper); stroke-width: 0.8px; stroke-linejoin: round; }
.smap-card { position: absolute; right: 14px; top: 50%; z-index: 9; width: min(300px, 46%); overflow: hidden; border: 1.8px solid var(--ink); border-radius: 12px; background: var(--paper); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); transform: translateY(-50%); }
.smap-card img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.smap-card-b { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px 12px; }
.smap-card-b small { color: var(--km); font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.smap-card-b strong { color: var(--ink); font-size: 16px; line-height: 1.2; }
.smap-card-b p { margin: 0; color: #47443b; font-size: 12.5px; line-height: 1.45; }
.smap-card-go { align-self: flex-start; margin-top: 4px; padding: 6px 12px; border-radius: 99px; background: var(--green); color: var(--paper); font-size: 13px; font-weight: 700; text-decoration: none; }
.smap-card-go:hover, .smap-card-go:focus-visible { background: #1b4a36; }
.smap-card-x { position: absolute; right: 6px; top: 6px; width: 28px; height: 28px; border: 0; border-radius: 50%; background: rgba(28, 26, 22, 0.7); color: #fff; font-size: 18px; line-height: 28px; cursor: pointer; }
.smap-card-enter-active { transition: opacity 0.35s 0.5s, transform 0.35s 0.5s; }
.smap-card-leave-active { transition: opacity 0.2s; }
.smap-card-enter-from { opacity: 0; transform: translateY(-46%); }
.smap-card-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .smap-zoom, .smap-topo-hi, .smap-tile, .smap-detail, .smap-stop, .smap-card-enter-active { transition: none; } .smap-zooming .smap-sway { animation: none; } }
.smap-zooming .smap-stop:not(.smap-target) { opacity: 0.55; transition: opacity 0.3s; }
.smap-target { z-index: 8; }
.smap-zooming .smap-target .smap-label { opacity: 0; transition: opacity 0.2s; }
.smap-target .smap-dot { transform: translate(-50%, -50%) scale(1.25); box-shadow: 0 0 0 5px rgba(242, 150, 62, 0.55), 0 2px 6px rgba(0, 0, 0, 0.4); }
.smap-hiker circle { fill: var(--paper); stroke: #14703a; stroke-width: 2.2; }
.smap-hiker g { color: #14703a; stroke: #14703a; }
.smap-break rect { fill: var(--paper); }
.smap-break path { fill: none; stroke: var(--ink); stroke-width: 2.2; stroke-linecap: round; }
.smap-attr { position: absolute; right: 8px; bottom: 6px; margin: 0; padding: 1px 6px; border-radius: 5px; background: rgba(255, 253, 246, 0.8); color: var(--ink); font-size: 9.5px; font-weight: 400; }
.smap-attr a { text-decoration: underline; }
.smap-minor text { fill: var(--ink); font-size: calc(12.5px * var(--zi)); font-weight: 500; paint-order: stroke; stroke: var(--paper); stroke-width: calc(3.5px * var(--zi)); stroke-linejoin: round; }
.smap-minor .smap-river-name { fill: var(--blue); font-size: calc(13.5px * var(--zi)); font-style: italic; font-weight: 600; letter-spacing: 0.08em; }
.smap-minor .smap-trek-name { fill: #0f5a2e; font-weight: 700; }
.smap-minor .smap-sub { font-size: 11px; font-style: italic; }
.smap-minor .smap-rail-name { fill: var(--blue); font-weight: 700; }
.smap-title { fill: var(--green); font-family: 'Yellowtail', 'Brush Script MT', cursive; font-size: 66px; paint-order: stroke; stroke: var(--paper); stroke-width: 6px; stroke-linejoin: round; }
.smap-compass { fill: var(--ink); font-size: 13px; font-weight: 700; paint-order: stroke; stroke: var(--paper); stroke-width: 3px; }

/* điểm dừng */
.smap-stop { position: absolute; z-index: 2; width: 0; height: 0; text-decoration: none; }
.smap-dot {
  position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
  width: 27px; height: 27px; border: 2px solid var(--paper); border-radius: 50%;
  background: var(--ink); color: var(--paper);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 13px; font-weight: 700; line-height: 1;
  box-shadow: 0 0 0 1.2px var(--ink), 0 2px 5px rgba(0, 0, 0, 0.4); transition: transform 0.15s;
}
.smap-dot svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
/* số thứ tự: huy hiệu nhỏ ở góc chấm (khớp với dãy thẻ bên dưới) */
.smap-dot b { position: absolute; left: -7px; top: -7px; min-width: 14px; height: 14px; padding: 0 2px; border-radius: 99px; background: var(--paper); color: var(--ink); font-size: 10px; line-height: 14px; text-align: center; box-shadow: 0 0 0 1px var(--ink); }
.smap-gondola circle { fill: var(--paper); stroke: var(--blue); stroke-width: 2; }
.smap-gondola g { fill: none; stroke: var(--blue); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.smap-far .smap-dot { background: var(--km); }
/* điểm cất cánh: logo Sapa Paragliding (chú khỉ bay) thay cho chấm tròn */
.smap-stop[href*='takeoff'] .smap-dot { width: 54px; height: 44px; border: 0; border-radius: 0; background: none; box-shadow: none; }
.smap-logo { width: 54px; height: 44px; max-width: none; object-fit: contain; filter: drop-shadow(0 0 1.5px #fffdf6) drop-shadow(0 0 1.5px #fffdf6) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45)); }
.smap-stop[href*='takeoff'] .smap-dot b { left: -2px; top: -2px; }
.smap-stop[href*='takeoff'].smap-side-right .smap-label { left: 30px; }
.smap-stop[href*='takeoff'].smap-side-left .smap-label { right: 30px; }
.smap-stop[href*='takeoff'].smap-side-top .smap-label, .smap-stop[href*='takeoff'].smap-side-tr .smap-label, .smap-stop[href*='takeoff'].smap-side-tl .smap-label { bottom: 29px; }
.smap-stop[href*='takeoff'].smap-side-bottom .smap-label, .smap-stop[href*='takeoff'].smap-side-br .smap-label, .smap-stop[href*='takeoff'].smap-side-bl .smap-label { top: 29px; }
.smap-stop[href*='lao-chai'] .smap-dot { background: var(--blue); width: 31px; height: 31px; }
.smap-label {
  position: absolute; display: flex; flex-direction: column; align-items: flex-start;
  padding: 2px 7px 3px; border: 1.5px solid var(--ink); border-radius: 6px;
  background: var(--paper); color: var(--ink); white-space: nowrap;
  font-size: 13px; font-weight: 700; line-height: 1.15;
  transition: box-shadow 0.15s;
}
.smap-label small { color: var(--km); font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.smap-label em { display: none; }
.smap-name { display: flex; flex-direction: column; align-items: inherit; }
.smap-name i { margin-top: 1px; font-size: 10.5px; font-style: italic; font-weight: 500; opacity: 0.78; }
.smap-kind-fly .smap-name i { opacity: 0.9; }
/* cất cánh / hạ cánh: bảng màu đậm như hai bảng điểm bay của bản đồ Khau Phạ */
.smap-kind-rail .smap-dot { background: var(--blue); }
.smap-kind-fly .smap-label { padding: 4px 9px 5px; border-color: var(--orange); background: var(--green); color: var(--paper); font-size: 14px; }
.smap-kind-fly .smap-label small { color: var(--orange); font-size: 10px; }
.smap-stop[href*='lao-chai'] .smap-label { border-color: var(--paper); background: var(--blue); }
.smap-stop[href*='lao-chai'] .smap-label small { color: #ffd9a8; }
/* điểm xa: tên + ô km đỏ sẫm */
.smap-far .smap-label { flex-direction: row-reverse; align-items: center; gap: 6px; padding: 2px 3px 2px 7px; line-height: 1.12; font-size: 12px; font-weight: 600; }
.smap-far .smap-label small { padding: 1px 7px; border-radius: 99px; background: var(--km); color: #fbf6ea; font-size: 10.5px; letter-spacing: 0; text-transform: none; }
.smap-side-right .smap-label { left: 18px; top: 0; transform: translateY(-50%); }
.smap-side-left .smap-label { right: 18px; top: 0; transform: translateY(-50%); align-items: flex-end; }
.smap-side-top .smap-label { left: 0; bottom: 18px; transform: translateX(-50%); align-items: center; }
.smap-side-bottom .smap-label { left: 0; top: 18px; transform: translateX(-50%); align-items: center; }
/* nhãn chéo: dùng ở mép sơ đồ và cụm thị trấn cho nhãn khỏi đè nhau */
.smap-side-tr .smap-label { left: -4px; bottom: 17px; }
.smap-side-tl .smap-label { right: -4px; bottom: 17px; align-items: flex-end; }
.smap-side-br .smap-label { left: -4px; top: 17px; }
.smap-side-bl .smap-label { right: -4px; top: 17px; align-items: flex-end; }
.smap-far.smap-side-left .smap-label, .smap-far.smap-side-tl .smap-label, .smap-far.smap-side-bl .smap-label { align-items: center; }
.smap-stop:hover .smap-dot, .smap-stop:focus-visible .smap-dot, .smap-active .smap-dot { transform: translate(-50%, -50%) scale(1.18); }
.smap-stop:hover .smap-label, .smap-stop:focus-visible .smap-label, .smap-active .smap-label { box-shadow: 0 0 0 3px var(--orange); }
.smap-stop:hover, .smap-active { z-index: 5; }

.smap-toggle { position: absolute; right: 10px; top: 92px; z-index: 8; display: flex; overflow: hidden; border: 1.8px solid var(--ink); border-radius: 8px; background: var(--paper); }
.smap-toggle button { padding: 4px 11px; border: 0; background: transparent; color: var(--ink); font: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
.smap-toggle button.on { background: var(--green); color: var(--paper); }
.smap-3d .smap-title { fill: var(--paper); stroke: var(--green); }
.smap-legend { position: absolute; left: 10px; bottom: 8px; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 5px 11px; border: 1.5px solid var(--ink); border-radius: 7px; background: var(--paper); list-style: none; color: var(--ink); font-size: 11.5px; font-weight: 500; }
.smap-legend li { display: inline-flex; align-items: center; gap: 6px; }
.smap-legend i { display: inline-block; width: 26px; height: 0; border-top: 4px solid; }
.smap-legend .lg-road { border-top-width: 6px; border-color: var(--road); }
.smap-legend .lg-road-s { border-top-width: 2.5px; }
.smap-legend .lg-break { font-weight: 700; letter-spacing: -1px; }
.smap-town path { fill: rgba(255, 253, 246, 0.2); stroke: var(--paper); stroke-width: 2.2; stroke-dasharray: 7 6; }
.smap-town text { fill: var(--ink); font-size: calc(10.5px * var(--zi)); font-weight: 700; letter-spacing: 0.08em; paint-order: stroke; stroke: var(--paper); stroke-width: calc(3.2px * var(--zi)); stroke-linejoin: round; }
.smap-road-name text { fill: #5c1e0e; font-size: calc(11.5px * var(--zi)); font-weight: 700; letter-spacing: 0.04em; paint-order: stroke; stroke: var(--paper); stroke-width: calc(3.2px * var(--zi)); stroke-linejoin: round; }
.smap-legend .lg-far { border-top: 4px dotted #5c1e0e; }
.smap-legend .lg-trek { border-top: 4px dotted #14703a; }
.smap-legend .lg-cable { border-top: 4px dashed var(--blue); }
.smap-legend .lg-fly { border-top: 4px dashed var(--flight); }

/* Điện thoại: sơ đồ co nhỏ → chỉ hiện chấm số, tên nằm ở dãy thẻ bên dưới;
   điểm đang xem vẫn hiện nhãn. */
@media (max-width: 767px) {
  .smap { border-radius: 0.75rem; }
  .smap-dot { width: 20px; height: 20px; border-width: 1.5px; }
  .smap-dot svg { width: 12px; height: 12px; }
  .smap-card { left: 8px; right: 8px; top: auto; bottom: 8px; width: auto; display: flex; transform: none; }
  .smap-card img { width: 38%; aspect-ratio: auto; }
  .smap-card-b { padding: 7px 9px 8px; gap: 2px; }
  .smap-card-b strong { font-size: 13px; }
  .smap-card-b p { display: none; }
  .smap-card-go { padding: 4px 10px; font-size: 11.5px; }
  .smap-card-enter-from { transform: translateY(8px); }
  .smap-stop[href*='takeoff'] .smap-dot, .smap-logo { width: 34px; height: 28px; }
  .smap-dot b { left: -5px; top: -6px; min-width: 11px; height: 11px; font-size: 8px; line-height: 11px; }
  .smap-label { display: none; font-size: 12px; }
  .smap-attr { font-size: 7px; right: 6px; bottom: 4px; }
  .smap-active .smap-label { display: flex; }
  .smap-side-right .smap-label { left: 17px; }
  .smap-side-left .smap-label { right: 17px; }
  /* sơ đồ co nhỏ không đủ chỗ cho chú giải → ẩn trên điện thoại */
  .smap-legend { display: none; }
  .smap-toggle { top: 6px; right: 44px; }
  .smap-toggle button { padding: 2px 8px; font-size: 11px; }
}
</style>
