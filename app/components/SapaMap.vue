<template>
  <!--
    Sơ đồ checkpoint Sa Pa (kiểu sơ đồ Hà Giang Loop): vùng trung tâm phóng to
    trên nền địa hình thật; các điểm xa (s.far) đặt sát mép, đường tới đó rút
    gọn và chỉ ghi số km. Mỗi điểm là một link sang /sapa-map/<slug>. Dùng chung cho trang
    bản đồ, trang từng điểm và trang chủ. Vị trí điểm: shared/sapa-map.ts;
    đường đi: app/data/sapa-map-geo.json; ảnh nền: /images/sapa-map/topo.jpg.
  -->
  <nav class="smap" :aria-label="lang === 'vi' ? 'Sơ đồ checkpoint Sa Pa' : 'Sapa checkpoint map'">
    <!-- Nền địa hình thật của vùng trung tâm (OpenTopoMap), làm nhạt. Các điểm
         gần và đường đi đặt đúng toạ độ trên nền này. -->
    <img src="/images/sapa-map/topo.jpg" alt="" class="smap-topo" loading="lazy" decoding="async" aria-hidden="true" />

    <svg viewBox="0 0 1000 780" class="smap-svg" aria-hidden="true" focusable="false">
      <!-- đường ô tô / xe máy (hình học thật, cắt ở mép với các điểm xa) -->
      <g v-for="(d, i) in GEO.roads" :key="`r${i}`">
        <path :d="d" fill="none" stroke="#7a4e22" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
        <path :d="d" fill="none" stroke="#fff8e8" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <!-- đoạn đường rút gọn tới các điểm xa: không theo tỉ lệ, chỉ ghi số km -->
      <path v-for="(d, i) in GEO.stubs" :key="`s${i}`" :d="d" fill="none" stroke="#7a4e22" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 8" />

      <!-- cung trek (đi bộ) -->
      <g v-for="(d, i) in GEO.treks" :key="`t${i}`">
        <path :d="d" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />
        <path :d="d" fill="none" stroke="#0f8a43" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5 8" />
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
      <path :d="GEO.cable" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <path :d="GEO.cable" fill="none" stroke="#6d3fc0" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="10 7" />
      <path :d="GEO.funicular" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
      <path :d="GEO.funicular" fill="none" stroke="#4b2a8f" stroke-width="6" stroke-linecap="butt" stroke-linejoin="round" />
      <path :d="GEO.funicular" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="7 7" />
      <circle :cx="GEO.station[0]" :cy="GEO.station[1]" r="7" fill="#fff" stroke="#4b2a8f" stroke-width="3" />

      <!-- dấu ngắt: từ đây ra điểm xa không còn đúng tỉ lệ -->
      <g v-for="(b, i) in GEO.breaks" :key="`b${i}`" :transform="`translate(${b[0]} ${b[1]}) rotate(${b[2]})`" class="smap-break">
        <rect x="-6" y="-8" width="12" height="16" rx="2" />
        <path d="M-5 8 L-1 -8 M1 8 L5 -8" />
      </g>

      <!-- đường bay dù lượn -->
      <path :d="GEO.flight" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      <path :d="GEO.flight" fill="none" stroke="#e11d2e" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="3 8" />
      <g :transform="`translate(${GEO.glider[0]} ${GEO.glider[1]}) rotate(12)`">
        <path d="M-17 0 Q0 -19 17 0 Q0 -8 -17 0 Z" fill="#e11d2e" stroke="#fff" stroke-width="1.4" />
        <path d="M-11 -2 L0 14 L11 -2" fill="none" stroke="#7a1019" stroke-width="1" />
        <circle cx="0" cy="15" r="2.8" fill="#7a1019" />
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
        <circle r="22" fill="rgba(255,255,255,0.88)" stroke="#16332a" stroke-width="1.2" />
        <path d="M0 -17 L5 0 L0 17 L-5 0 Z" fill="#16332a" opacity="0.3" />
        <path d="M0 -17 L5 0 L-5 0 Z" fill="#e11d2e" />
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
    <p class="smap-attr">© <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA) · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></p>
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
.smap {
  position: relative;
  aspect-ratio: 1000 / 780;
  width: 100%;
  border: 1px solid rgba(22, 51, 42, 0.14);
  border-radius: 1rem;
  background: #eef1e4;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow: hidden;
}
.smap-topo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; pointer-events: none; }
.smap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.smap-hiker circle { fill: #fff; stroke: #0f8a43; stroke-width: 2; }
.smap-hiker g { color: #0b6b33; stroke: #0b6b33; }
.smap-break rect { fill: #fff; }
.smap-break path { fill: none; stroke: #5b3a17; stroke-width: 2; stroke-linecap: round; }
.smap-attr { position: absolute; right: 10px; bottom: 8px; margin: 0; padding: 1px 6px; border-radius: 6px; background: rgba(255, 255, 255, 0.7); color: #47594f; font-size: 9.5px; font-weight: 400; }
.smap-attr a { text-decoration: underline; }
.smap-minor text { fill: #24443a; font-size: 12.5px; font-weight: 500; paint-order: stroke; stroke: #fff; stroke-width: 3.5px; stroke-linejoin: round; }
.smap-minor .smap-river-name { fill: #1b6f86; font-size: 13px; font-style: italic; letter-spacing: 0.08em; }
.smap-minor .smap-rail-name { fill: #4b2a8f; font-weight: 600; }
.smap-title { fill: #d1541a; font-family: 'Yellowtail', 'Brush Script MT', cursive; font-size: 66px; paint-order: stroke; stroke: #fff; stroke-width: 6px; stroke-linejoin: round; }
.smap-compass { fill: #16332a; font-size: 13px; font-weight: 600; paint-order: stroke; stroke: #fff; stroke-width: 3px; }

/* điểm dừng */
.smap-stop { position: absolute; z-index: 2; width: 0; height: 0; text-decoration: none; }
.smap-dot {
  position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 2.5px solid #fff; border-radius: 50%;
  background: #2f8f63; color: #fff;
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 16px; font-weight: 700; line-height: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35); transition: transform 0.15s;
}
.smap-kind-town .smap-dot { background: #2b74c9; }
.smap-kind-peak .smap-dot { background: #7b4bb3; }
.smap-kind-fly .smap-dot { background: #e11d2e; box-shadow: 0 0 0 5px rgba(225, 29, 46, 0.22), 0 2px 6px rgba(0, 0, 0, 0.35); }
.smap-kind-waterfall .smap-dot, .smap-kind-spring .smap-dot, .smap-kind-lake .smap-dot { background: #1a9aa8; }
.smap-kind-pass .smap-dot, .smap-kind-bridge .smap-dot { background: #e08a12; }
.smap-label {
  position: absolute; display: flex; flex-direction: column; align-items: flex-start;
  padding: 5px 10px 6px; border: 1px solid rgba(22, 51, 42, 0.16); border-radius: 9px;
  background: rgba(255, 255, 255, 0.95); color: #16332a; white-space: nowrap;
  font-size: 14.5px; font-weight: 600; line-height: 1.2; box-shadow: 0 2px 8px rgba(22, 51, 42, 0.16);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.smap-label small { color: #c2571a; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.smap-label em { margin-top: 3px; padding: 1px 7px; border-radius: 99px; background: #e11d2e; color: #fff; font-size: 10px; font-style: normal; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
/* điểm xa: thẻ gọn một dòng "tên · km" */
.smap-far .smap-label { flex-direction: row-reverse; align-items: baseline; gap: 7px; padding: 4px 9px; border-style: dashed; border-color: rgba(122, 78, 34, 0.55); font-size: 13.5px; }
.smap-far .smap-label small { font-size: 11px; letter-spacing: 0.02em; text-transform: none; }
.smap-side-right .smap-label { left: 22px; top: 0; transform: translateY(-50%); }
.smap-side-left .smap-label { right: 22px; top: 0; transform: translateY(-50%); align-items: flex-end; }
.smap-side-top .smap-label { left: 0; bottom: 22px; transform: translateX(-50%); align-items: center; }
.smap-side-bottom .smap-label { left: 0; top: 22px; transform: translateX(-50%); align-items: center; }
/* nhãn chéo: dùng ở mép sơ đồ và cụm thị trấn cho nhãn khỏi đè nhau */
.smap-side-tr .smap-label { left: -6px; bottom: 20px; }
.smap-side-tl .smap-label { right: -6px; bottom: 20px; align-items: flex-end; }
.smap-side-br .smap-label { left: -6px; top: 20px; }
.smap-side-bl .smap-label { right: -6px; top: 20px; align-items: flex-end; }
.smap-far.smap-side-left .smap-label, .smap-far.smap-side-tl .smap-label, .smap-far.smap-side-bl .smap-label { align-items: baseline; }
.smap-stop:hover .smap-dot, .smap-stop:focus-visible .smap-dot, .smap-active .smap-dot { transform: translate(-50%, -50%) scale(1.18); }
.smap-stop:hover .smap-label, .smap-stop:focus-visible .smap-label, .smap-active .smap-label { border-color: #d1541a; border-style: solid; box-shadow: 0 0 0 2px rgba(209, 84, 26, 0.25), 0 2px 8px rgba(22, 51, 42, 0.2); }
.smap-stop:hover, .smap-active { z-index: 5; }

.smap-legend { position: absolute; left: 12px; bottom: 10px; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 5px 11px; border-radius: 9px; background: rgba(255, 255, 255, 0.86); list-style: none; color: #24443a; font-size: 11.5px; font-weight: 400; }
.smap-legend li { display: inline-flex; align-items: center; gap: 6px; }
.smap-legend i { display: inline-block; width: 26px; height: 0; border-top: 3px solid; }
.smap-legend .lg-road { border-color: #7a4e22; }
.smap-legend .lg-far { border-top: 3px dotted #7a4e22; }
.smap-legend .lg-trek { border-top: 3px dotted #0f8a43; }
.smap-legend .lg-cable { border-top: 3px dashed #6d3fc0; }
.smap-legend .lg-fly { border-top: 3px dotted #e11d2e; }

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
