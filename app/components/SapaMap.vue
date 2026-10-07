<template>
  <!--
    Sơ đồ checkpoint Sa Pa (kiểu sơ đồ Hà Giang Loop) trên nền địa hình thật
    hiện mờ. Mỗi điểm là một link sang /sapa-map/<slug>. Dùng chung cho trang
    bản đồ, trang từng điểm và trang chủ. Vị trí điểm: shared/sapa-map.ts;
    đường đi: app/data/sapa-map-geo.json; ảnh nền: /images/sapa-map/topo.jpg.
  -->
  <nav class="smap" :aria-label="lang === 'vi' ? 'Sơ đồ checkpoint Sa Pa' : 'Sapa checkpoint map'">
    <!-- Nền địa hình thật của vùng Sa Pa (OpenTopoMap), hiện mờ. Các điểm và
         đường đi đặt đúng toạ độ trên nền này. -->
    <img src="/images/sapa-map/topo.jpg" alt="" class="smap-topo" loading="lazy" decoding="async" aria-hidden="true" />

    <svg viewBox="0 0 1000 780" class="smap-svg" aria-hidden="true" focusable="false">
      <!-- đường ô tô / xe máy -->
      <g v-for="(d, i) in GEO.roads" :key="`r${i}`">
        <path :d="d" fill="none" stroke="#050a07" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" transform="translate(0 3)" />
        <path :d="d" fill="none" stroke="#e9dcc4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="d" fill="none" stroke="#d9772b" stroke-width="1" stroke-linecap="round" stroke-dasharray="7 9" opacity="0.9" />
      </g>

      <!-- cung trek (đi bộ) -->
      <g v-for="(d, i) in GEO.treks" :key="`t${i}`">
        <path :d="d" fill="none" stroke="#0b1d17" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" />
        <path :d="d" fill="none" stroke="#a8ec93" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5 8" />
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

      <!-- tàu leo núi + cáp treo Fansipan -->
      <path :d="GEO.funicular" fill="none" stroke="#cdb6f2" stroke-width="4" stroke-linecap="round" />
      <path :d="GEO.cable" fill="none" stroke="#cdb6f2" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="10 7" />
      <circle :cx="GEO.station[0]" :cy="GEO.station[1]" r="5.5" fill="#16332a" stroke="#cdb6f2" stroke-width="2.5" />

      <!-- đường bay dù lượn -->
      <path :d="GEO.flight" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 8" />
      <g :transform="`translate(${GEO.glider[0]} ${GEO.glider[1]}) rotate(12)`">
        <path d="M-15 0 Q0 -17 15 0 Q0 -7 -15 0 Z" fill="#ff6b6b" stroke="#fff" stroke-width="1.2" />
        <path d="M-10 -2 L0 12 L10 -2" fill="none" stroke="#fff" stroke-width="0.9" />
        <circle cx="0" cy="13" r="2.4" fill="#fff" />
      </g>

      <!-- chữ phụ trên sơ đồ -->
      <g class="smap-minor">
        <text :x="GEO.labels.station[0] - 8" :y="GEO.labels.station[1] + 34" text-anchor="end">{{ lang === 'vi' ? 'Ga cáp treo' : 'Cable car station' }}</text>
        <text :x="GEO.labels.ylinhho[0] - 4" :y="GEO.labels.ylinhho[1] + 22" text-anchor="end">Ý Linh Hồ</text>
        <text :x="GEO.labels.giangtachai[0] - 2" :y="GEO.labels.giangtachai[1] + 24" text-anchor="middle">Giàng Tà Chải</text>
        <text :x="GEO.labels.muonghoa[0]" :y="GEO.labels.muonghoa[1]" text-anchor="middle" class="smap-river-name" :transform="`rotate(27 ${GEO.labels.muonghoa[0]} ${GEO.labels.muonghoa[1]})`">{{ lang === 'vi' ? 'thung lũng Mường Hoa' : 'Muong Hoa Valley' }}</text>
      </g>

      <!-- tên sơ đồ -->
      <text x="70" y="690" class="smap-title" transform="rotate(-6 70 690)">Sapa Map</text>

      <!-- la bàn -->
      <g transform="translate(940 62)" opacity="0.85">
        <circle r="22" fill="rgba(8,22,17,0.6)" stroke="#e9dcc4" stroke-width="1.2" />
        <path d="M0 -17 L5 0 L0 17 L-5 0 Z" fill="#e9dcc4" opacity="0.35" />
        <path d="M0 -17 L5 0 L-5 0 Z" fill="#ff6b6b" />
        <text y="-27" text-anchor="middle" class="smap-compass">N</text>
      </g>
    </svg>

    <NuxtLink
      v-for="s in SAPA_STOPS"
      :key="s.slug"
      :to="localePath(`/sapa-map/${s.slug}`)"
      class="smap-stop"
      :class="[`smap-side-${s.side}`, `smap-kind-${s.kind}`, { 'smap-active': s.slug === active }]"
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
  fansipan: { vi: 'Đỉnh Fansipan', en: 'Fansipan summit' },
  'cat-cat': { vi: 'Bản Cát Cát', en: 'Cat Cat village' },
  takeoff: { vi: 'Điểm cất cánh', en: 'Take-off' },
  'lao-chai': { vi: 'Lao Chải · Hạ cánh', en: 'Lao Chai · Landing' },
  'ta-van': { vi: 'Bản Tả Van', en: 'Ta Van village' },
  'ban-ho': { vi: 'Bản Hồ · Suối nóng', en: 'Ban Ho · Hot spring' },
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
  fansipan: { vi: '3.143 m', en: '3,143 m' },
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
 * Đường đi đã chiếu sẵn lên khung 1000x780: đường xe và cung trek thung lũng
 * là hình học thật từ OpenStreetMap; cung leo Fansipan chỉ là sơ đồ nối các mốc.
 */
const GEO = mapGeo as unknown as {
  roads: string[]
  treks: string[]
  funicular: string
  cable: string
  flight: string
  glider: [number, number]
  station: [number, number]
  hikers: Array<[number, number]>
  labels: Record<'station' | 'ylinhho' | 'giangtachai' | 'love' | 'tramton' | 'muonghoa', [number, number]>
}
</script>

<style>
.smap {
  position: relative;
  aspect-ratio: 1000 / 780;
  width: 100%;
  border-radius: 1rem;
  background:
    radial-gradient(120% 90% at 20% 10%, rgba(63, 180, 191, 0.1), transparent 60%),
    radial-gradient(90% 80% at 85% 90%, rgba(159, 224, 143, 0.1), transparent 60%),
    #16332a;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  overflow: hidden;
}
.smap-topo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; opacity: 0.42; pointer-events: none; }
.smap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.smap-hiker circle { fill: #0b1d17; stroke: #a8ec93; stroke-width: 1.6; }
.smap-hiker g { color: #a8ec93; stroke: #a8ec93; }
.smap-attr { position: absolute; right: 10px; bottom: 8px; margin: 0; color: rgba(201, 216, 207, 0.75); font-size: 9.5px; font-weight: 300; }
.smap-attr a { text-decoration: underline; }
.smap-minor text { fill: #dbe7df; font-size: 12.5px; font-weight: 400; paint-order: stroke; stroke: #0b1d17; stroke-width: 3px; stroke-linejoin: round; }
.smap-minor .smap-river-name { fill: #9fdfe3; font-size: 12px; font-style: italic; letter-spacing: 0.08em; }
.smap-title { fill: #f0b775; font-family: 'Yellowtail', 'Brush Script MT', cursive; font-size: 66px; opacity: 0.95; paint-order: stroke; stroke: #0b1d17; stroke-width: 5px; stroke-linejoin: round; }
.smap-compass { fill: #e9dcc4; font-size: 13px; font-weight: 600; }

/* điểm dừng */
.smap-stop { position: absolute; z-index: 2; width: 0; height: 0; text-decoration: none; }
.smap-dot {
  position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 2.5px solid #fff; border-radius: 50%;
  background: #2f6f57; color: #fff;
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 16px; font-weight: 700; line-height: 1;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45); transition: transform 0.15s;
}
.smap-kind-town .smap-dot { background: #2563a8; }
.smap-kind-peak .smap-dot { background: #7b4bb3; }
.smap-kind-fly .smap-dot { background: #d1343f; box-shadow: 0 0 0 5px rgba(255, 107, 107, 0.28), 0 3px 8px rgba(0, 0, 0, 0.45); }
.smap-kind-waterfall .smap-dot, .smap-kind-spring .smap-dot, .smap-kind-lake .smap-dot { background: #1f8a96; }
.smap-kind-pass .smap-dot, .smap-kind-bridge .smap-dot { background: #c77712; }
.smap-label {
  position: absolute; display: flex; flex-direction: column; align-items: flex-start;
  padding: 5px 10px 6px; border: 1px solid rgba(233, 220, 196, 0.22); border-radius: 9px;
  background: rgba(8, 22, 17, 0.82); color: #fdfbf5; white-space: nowrap;
  font-size: 14.5px; font-weight: 500; line-height: 1.2; transition: border-color 0.15s, background 0.15s;
}
.smap-label small { color: #f0b775; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.smap-label em { margin-top: 3px; padding: 1px 7px; border-radius: 99px; background: #d1343f; color: #fff; font-size: 10px; font-style: normal; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.smap-side-right .smap-label { left: 22px; top: 0; transform: translateY(-50%); }
.smap-side-left .smap-label { right: 22px; top: 0; transform: translateY(-50%); align-items: flex-end; }
.smap-side-top .smap-label { left: 0; bottom: 22px; transform: translateX(-50%); align-items: center; }
.smap-side-bottom .smap-label { left: 0; top: 22px; transform: translateX(-50%); align-items: center; }
/* nhãn chéo: dùng ở mép sơ đồ và cụm thị trấn cho nhãn khỏi đè nhau */
.smap-side-tr .smap-label { left: -6px; bottom: 20px; }
.smap-side-tl .smap-label { right: -6px; bottom: 20px; align-items: flex-end; }
.smap-side-br .smap-label { left: -6px; top: 20px; }
.smap-side-bl .smap-label { right: -6px; top: 20px; align-items: flex-end; }
.smap-stop:hover .smap-dot, .smap-stop:focus-visible .smap-dot, .smap-active .smap-dot { transform: translate(-50%, -50%) scale(1.18); }
.smap-stop:hover .smap-label, .smap-stop:focus-visible .smap-label, .smap-active .smap-label { border-color: #f0b775; background: rgba(8, 22, 17, 0.96); }
.smap-stop:hover, .smap-active { z-index: 5; }

.smap-legend { position: absolute; left: 14px; bottom: 12px; display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 0; list-style: none; color: #c9d8cf; font-size: 11.5px; font-weight: 300; }
.smap-legend li { display: inline-flex; align-items: center; gap: 6px; }
.smap-legend i { display: inline-block; width: 26px; height: 0; border-top: 3px solid; }
.smap-legend .lg-road { border-color: #e9dcc4; }
.smap-legend .lg-trek { border-top: 3px dotted #9fe08f; }
.smap-legend .lg-cable { border-top: 3px dashed #cdb6f2; }
.smap-legend .lg-fly { border-top: 3px dotted #ff6b6b; }

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
  /* chú giải đè lên chữ "Sapa Map" khi sơ đồ co nhỏ → ẩn trên điện thoại */
  .smap-legend { display: none; }
}
</style>
