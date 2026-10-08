<template>
  <!--
    Sơ đồ checkpoint Sa Pa (kiểu sơ đồ Hà Giang Loop): vùng trung tâm phóng to
    trên nền địa hình thật; các điểm xa (s.far) đặt sát mép, đường tới đó rút
    gọn và chỉ ghi số km. Mỗi điểm là một link sang /sapa-map/<slug>. Dùng chung cho trang
    bản đồ, trang từng điểm và trang chủ. Vị trí điểm: shared/sapa-map.ts;
    đường đi: app/data/sapa-map-geo.json; ảnh nền: /images/sapa-map/topo.jpg.
  -->
  <nav class="smap" :aria-label="lang === 'vi' ? 'Sơ đồ checkpoint Sa Pa' : 'Sapa checkpoint map'">
    <!-- Nền địa hình của vùng trung tâm: tô màu theo độ cao + bóng đổ, dựng từ
         dữ liệu độ cao AWS Terrain Tiles (không có đường nhỏ, chữ — cho rõ cung
         đường). Các điểm gần và đường đi đặt đúng toạ độ trên nền này. -->
    <img src="/images/sapa-map/topo.jpg" alt="" class="smap-topo" loading="lazy" decoding="async" aria-hidden="true" />

    <svg viewBox="0 0 1000 780" class="smap-svg" aria-hidden="true" focusable="false">
      <!-- đường ô tô / xe máy (hình học thật, cắt ở mép với các điểm xa) -->
      <g v-for="(d, i) in GEO.roads" :key="`r${i}`">
        <path :d="d" fill="none" stroke="#5c1e0e" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="d" fill="none" stroke="#e24a28" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <!-- đoạn đường rút gọn tới các điểm xa: không theo tỉ lệ, chỉ ghi số km -->
      <path v-for="(d, i) in GEO.stubs" :key="`s${i}`" :d="d" fill="none" stroke="#5c1e0e" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 8" />

      <!-- cung trek (đi bộ) -->
      <g v-for="(d, i) in GEO.treks" :key="`t${i}`">
        <path :d="d" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="d" fill="none" stroke="#14703a" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5 8" />
      </g>
      <!-- người đi bộ trên cung trek -->
      <g v-for="(h, i) in GEO.hikers" :key="`h${i}`" :transform="`translate(${h[0]} ${h[1]})`" class="smap-hiker">
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
      <path :d="GEO.cable" fill="none" stroke="#fffdf6" stroke-width="6" stroke-linecap="round" />
      <path :d="GEO.cable" fill="none" stroke="#164e6e" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 7" />
      <path :d="GEO.funicular" fill="none" stroke="#fffdf6" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
      <path :d="GEO.funicular" fill="none" stroke="#164e6e" stroke-width="6.5" stroke-linecap="butt" stroke-linejoin="round" />
      <path :d="GEO.funicular" fill="none" stroke="#fffdf6" stroke-width="2.8" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="7 7" />
      <circle :cx="GEO.station[0]" :cy="GEO.station[1]" r="7.5" fill="#fffdf6" stroke="#164e6e" stroke-width="3.2" />

      <!-- dấu ngắt: từ đây ra điểm xa không còn đúng tỉ lệ -->
      <g v-for="(b, i) in GEO.breaks" :key="`b${i}`" :transform="`translate(${b[0]} ${b[1]}) rotate(${b[2]})`" class="smap-break">
        <rect x="-6" y="-8" width="12" height="16" rx="2" />
        <path d="M-5 8 L-1 -8 M1 8 L5 -8" />
      </g>

      <!-- đường bay dù lượn -->
      <path :d="GEO.flight" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round" />
      <path :d="GEO.flight" fill="none" stroke="#78146e" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="10 7" />
      <g :transform="`translate(${GEO.glider[0]} ${GEO.glider[1]}) rotate(12)`">
        <path d="M-17 0 Q0 -19 17 0 Q0 -8 -17 0 Z" fill="#f2963e" stroke="#1c1a16" stroke-width="1.6" />
        <path d="M-11 -2 L0 14 L11 -2" fill="none" stroke="#1c1a16" stroke-width="1.1" />
        <circle cx="0" cy="15" r="3" fill="#1c1a16" />
      </g>

      <!-- chữ phụ trên sơ đồ -->
      <g class="smap-minor">
        <text :x="GEO.labels.station[0] - 14" :y="GEO.labels.station[1] - 16" text-anchor="middle" class="smap-rail-name">{{ lang === 'vi' ? 'Ga cáp treo Fansipan' : 'Fansipan cable car station' }}</text>
        <text :x="GEO.labels.rail[0] - 14" :y="GEO.labels.rail[1] - 15" text-anchor="middle" class="smap-rail-name">{{ lang === 'vi' ? 'Tàu leo núi' : 'Funicular' }}</text>
        <text :x="GEO.labels.ylinhho[0] - 4" :y="GEO.labels.ylinhho[1] + 22" text-anchor="end">Ý Linh Hồ</text>
        <text :x="GEO.labels.muonghoa[0]" :y="GEO.labels.muonghoa[1]" text-anchor="middle" class="smap-river-name" :transform="`rotate(24 ${GEO.labels.muonghoa[0]} ${GEO.labels.muonghoa[1]})`">{{ lang === 'vi' ? 'thung lũng Mường Hoa' : 'Muong Hoa Valley' }}</text>
      </g>

      <!-- tên sơ đồ -->
      <text x="60" y="640" class="smap-title" transform="rotate(-6 60 640)">Sapa Map</text>

      <!-- la bàn -->
      <g transform="translate(944 58)">
        <circle r="22" fill="#fffdf6" stroke="#1c1a16" stroke-width="1.8" />
        <path d="M0 -17 L5 0 L0 17 L-5 0 Z" fill="#1c1a16" opacity="0.3" />
        <path d="M0 -17 L5 0 L-5 0 Z" fill="#d4261c" />
        <text y="-27" text-anchor="middle" class="smap-compass">N</text>
      </g>
    </svg>

    <NuxtLink
      v-for="s in SAPA_STOPS"
      :key="s.slug"
      :to="localePath(`/sapa-map/${s.slug}`)"
      class="smap-stop"
      :class="[`smap-side-${s.side}`, `smap-kind-${s.kind}`, { 'smap-active': s.slug === active, 'smap-far': s.far }]"
      :style="{ left: `${s.x / 10}%`, top: `${(s.y / 780) * 100}%` }"
      :aria-current="s.slug === active ? 'page' : undefined"
    >
      <span class="smap-dot">{{ s.n }}</span>
      <span class="smap-label">
        <small>{{ TAGS[s.slug]?.[lang] }}</small>
        <span>{{ NAMES[s.slug]?.[lang] }}</span>
        <em v-if="s.kind === 'fly'">{{ lang === 'vi' ? 'Dù lượn' : 'Paragliding' }}</em>
      </span>
    </NuxtLink>

    <!-- chú giải -->
    <ul class="smap-legend">
      <li><i class="lg-road"></i>{{ lang === 'vi' ? 'Đường xe' : 'Road' }}</li>
      <li><i class="lg-far"></i>{{ lang === 'vi' ? 'Điểm xa: rút gọn, xem số km' : 'Far stops: not to scale, see km' }}</li>
      <li><i class="lg-trek"></i>{{ lang === 'vi' ? 'Cung trek' : 'Trek' }}</li>
      <li><i class="lg-cable"></i>{{ lang === 'vi' ? 'Tàu & cáp treo' : 'Funicular & cable car' }}</li>
      <li><i class="lg-fly"></i>{{ lang === 'vi' ? 'Đường bay' : 'Flight' }}</li>
    </ul>
    <p class="smap-attr">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · {{ lang === 'vi' ? 'Độ cao' : 'Elevation' }}: AWS Terrain Tiles (SRTM)</p>
  </nav>
</template>

<script setup lang="ts">
import mapGeo from '~/data/sapa-map-geo.json'
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
  'sun-plaza': { vi: 'Sun Plaza · Sân quần', en: 'Sun Plaza · Square' },
  'ham-rong': { vi: 'Núi Hàm Rồng', en: 'Ham Rong Mountain' },
  moana: { vi: 'Moana', en: 'Moana' },
  fansipan: { vi: 'Fansipan', en: 'Fansipan' },
  'cat-cat': { vi: 'Bản Cát Cát', en: 'Cat Cat village' },
  takeoff: { vi: 'Điểm cất cánh', en: 'Take-off' },
  'lao-chai': { vi: 'Lao Chải · Hạ cánh', en: 'Lao Chai · Landing' },
  'ta-van': { vi: 'Bản Tả Van', en: 'Ta Van village' },
  'ban-ho': { vi: 'Suối nóng Bản Hồ', en: 'Ban Ho hot spring' },
  'seo-my-ty': { vi: 'Hồ Séo Mý Tỷ', en: 'Seo My Ty Lake' },
  'ta-phin': { vi: 'Bản Tả Phìn', en: 'Ta Phin village' },
  'thac-bac': { vi: 'Thác Bạc', en: 'Silver Waterfall' },
  'o-quy-ho': { vi: 'Đèo Ô Quy Hồ', en: 'O Quy Ho Pass' },
  'rong-may': { vi: 'Cầu kính Rồng Mây', en: 'Rong May Glass Bridge' }
}

/** Dòng nhỏ trên tên: quãng đường bộ từ Sun Plaza (OpenStreetMap) hoặc độ cao. */
const TAGS: Record<string, { vi: string; en: string }> = {
  'sun-plaza': { vi: 'Km 0', en: 'Km 0' },
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
  'rong-may': { vi: '20 km', en: '20 km' }
}

/**
 * Đường đi đã chiếu sẵn lên khung 1000x780 (hình học thật từ OpenStreetMap,
 * cắt ở mép). stubs: đoạn nối rút gọn tới các điểm xa; breaks: [x, y, góc]
 * của dấu ngắt "không theo tỉ lệ".
 */
const GEO = mapGeo as unknown as {
  roads: string[]
  treks: string[]
  funicular: string
  cable: string
  stubs: string[]
  breaks: Array<[number, number, number]>
  flight: string
  glider: [number, number]
  station: [number, number]
  hikers: Array<[number, number]>
  labels: Record<'station' | 'rail' | 'ylinhho' | 'giangtachai' | 'muonghoa', [number, number]>
}
</script>

<style>
/* Bảng màu theo bản đồ "Đường đến điểm bay Khau Phạ" của mebayluon.com: nền
   địa hình tô theo độ cao, đường đỏ viền nâu, nhãn giấy viền mực, ô km đỏ sẫm,
   cất cánh xanh rêu, hạ cánh xanh dương, đường bay tím. */
.smap {
  --ink: #1c1a16; --paper: #fffdf6; --road: #e24a28; --km: #781e14; --green: #0f2e21; --blue: #164e6e; --orange: #f2963e; --flight: #78146e;
  position: relative;
  aspect-ratio: 1000 / 780;
  width: 100%;
  border: 2px solid var(--green);
  border-radius: 1rem;
  background: #c4d292;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow: hidden;
}
.smap-topo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; pointer-events: none; }
.smap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.smap-hiker circle { fill: var(--paper); stroke: #14703a; stroke-width: 2.2; }
.smap-hiker g { color: #14703a; stroke: #14703a; }
.smap-break rect { fill: var(--paper); }
.smap-break path { fill: none; stroke: var(--ink); stroke-width: 2.2; stroke-linecap: round; }
.smap-attr { position: absolute; right: 8px; bottom: 6px; margin: 0; padding: 1px 6px; border-radius: 5px; background: rgba(255, 253, 246, 0.8); color: var(--ink); font-size: 9.5px; font-weight: 400; }
.smap-attr a { text-decoration: underline; }
.smap-minor text { fill: var(--ink); font-size: 12.5px; font-weight: 500; paint-order: stroke; stroke: var(--paper); stroke-width: 3.5px; stroke-linejoin: round; }
.smap-minor .smap-river-name { fill: var(--blue); font-size: 13.5px; font-style: italic; font-weight: 600; letter-spacing: 0.08em; }
.smap-minor .smap-rail-name { fill: var(--blue); font-weight: 700; }
.smap-title { fill: var(--green); font-family: 'Yellowtail', 'Brush Script MT', cursive; font-size: 66px; paint-order: stroke; stroke: var(--paper); stroke-width: 6px; stroke-linejoin: round; }
.smap-compass { fill: var(--ink); font-size: 13px; font-weight: 700; paint-order: stroke; stroke: var(--paper); stroke-width: 3px; }

/* điểm dừng */
.smap-stop { position: absolute; z-index: 2; width: 0; height: 0; text-decoration: none; }
.smap-dot {
  position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 2.5px solid var(--paper); border-radius: 50%;
  background: var(--ink); color: var(--paper);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 16px; font-weight: 700; line-height: 1;
  box-shadow: 0 0 0 1.5px var(--ink), 0 2px 5px rgba(0, 0, 0, 0.4); transition: transform 0.15s;
}
.smap-far .smap-dot { background: var(--km); }
.smap-stop[href*='takeoff'] .smap-dot { background: var(--green); width: 36px; height: 36px; font-size: 18px; }
.smap-stop[href*='lao-chai'] .smap-dot { background: var(--blue); width: 36px; height: 36px; font-size: 18px; }
.smap-label {
  position: absolute; display: flex; flex-direction: column; align-items: flex-start;
  padding: 4px 10px 5px; border: 1.8px solid var(--ink); border-radius: 7px;
  background: var(--paper); color: var(--ink); white-space: nowrap;
  font-size: 15px; font-weight: 700; line-height: 1.2;
  transition: box-shadow 0.15s;
}
.smap-label small { color: var(--km); font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.smap-label em { display: none; }
/* cất cánh / hạ cánh: bảng màu đậm như hai bảng điểm bay của bản đồ Khau Phạ */
.smap-kind-fly .smap-label { padding: 6px 12px 7px; border-color: var(--orange); background: var(--green); color: var(--paper); font-size: 16px; }
.smap-kind-fly .smap-label small { color: var(--orange); font-size: 11.5px; }
.smap-stop[href*='lao-chai'] .smap-label { border-color: var(--paper); background: var(--blue); }
.smap-stop[href*='lao-chai'] .smap-label small { color: #ffd9a8; }
/* điểm xa: tên + ô km đỏ sẫm */
.smap-far .smap-label { flex-direction: row-reverse; align-items: center; gap: 7px; padding: 3px 4px 3px 9px; font-size: 13.5px; font-weight: 600; }
.smap-far .smap-label small { padding: 2px 8px; border-radius: 99px; background: var(--km); color: #fbf6ea; font-size: 11.5px; letter-spacing: 0; text-transform: none; }
.smap-side-right .smap-label { left: 22px; top: 0; transform: translateY(-50%); }
.smap-side-left .smap-label { right: 22px; top: 0; transform: translateY(-50%); align-items: flex-end; }
.smap-side-top .smap-label { left: 0; bottom: 22px; transform: translateX(-50%); align-items: center; }
.smap-side-bottom .smap-label { left: 0; top: 22px; transform: translateX(-50%); align-items: center; }
/* nhãn chéo: dùng ở mép sơ đồ và cụm thị trấn cho nhãn khỏi đè nhau */
.smap-side-tr .smap-label { left: -6px; bottom: 22px; }
.smap-side-tl .smap-label { right: -6px; bottom: 22px; align-items: flex-end; }
.smap-side-br .smap-label { left: -6px; top: 22px; }
.smap-side-bl .smap-label { right: -6px; top: 22px; align-items: flex-end; }
.smap-far.smap-side-left .smap-label, .smap-far.smap-side-tl .smap-label, .smap-far.smap-side-bl .smap-label { align-items: center; }
.smap-stop:hover .smap-dot, .smap-stop:focus-visible .smap-dot, .smap-active .smap-dot { transform: translate(-50%, -50%) scale(1.18); }
.smap-stop:hover .smap-label, .smap-stop:focus-visible .smap-label, .smap-active .smap-label { box-shadow: 0 0 0 3px var(--orange); }
.smap-stop:hover, .smap-active { z-index: 5; }

.smap-legend { position: absolute; left: 10px; bottom: 8px; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 5px 11px; border: 1.5px solid var(--ink); border-radius: 7px; background: var(--paper); list-style: none; color: var(--ink); font-size: 11.5px; font-weight: 500; }
.smap-legend li { display: inline-flex; align-items: center; gap: 6px; }
.smap-legend i { display: inline-block; width: 26px; height: 0; border-top: 4px solid; }
.smap-legend .lg-road { border-color: var(--road); }
.smap-legend .lg-far { border-top: 4px dotted #5c1e0e; }
.smap-legend .lg-trek { border-top: 4px dotted #14703a; }
.smap-legend .lg-cable { border-top: 4px dashed var(--blue); }
.smap-legend .lg-fly { border-top: 4px dashed var(--flight); }

/* Điện thoại: sơ đồ co nhỏ → chỉ hiện chấm số, tên nằm ở dãy thẻ bên dưới;
   điểm đang xem vẫn hiện nhãn. */
@media (max-width: 767px) {
  .smap { border-radius: 0.75rem; }
  .smap-dot { width: 24px; height: 24px; border-width: 2px; font-size: 13px; }
  .smap-label { display: none; font-size: 12px; }
  .smap-attr { font-size: 7px; right: 6px; bottom: 4px; }
  .smap-active .smap-label { display: flex; }
  .smap-side-right .smap-label { left: 17px; }
  .smap-side-left .smap-label { right: 17px; }
  /* sơ đồ co nhỏ không đủ chỗ cho chú giải → ẩn trên điện thoại */
  .smap-legend { display: none; }
}
</style>
