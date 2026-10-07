<template>
  <!--
    Sơ đồ checkpoint Sa Pa (kiểu sơ đồ Hà Giang Loop): KHÔNG phải bản đồ địa
    lý — các điểm xếp theo hướng thật nhưng nới ra cho dễ nhìn. Mỗi điểm là
    một link sang /sapa-map/<slug>. Dùng chung cho trang bản đồ và trang chủ.
    Vị trí điểm lấy từ shared/sapa-map.ts; đường vẽ bằng các mốc bên dưới.
  -->
  <nav class="smap" :aria-label="lang === 'vi' ? 'Sơ đồ checkpoint Sa Pa' : 'Sapa checkpoint map'">
    <svg viewBox="0 0 1000 780" class="smap-svg" aria-hidden="true" focusable="false">
      <!-- núi trang trí -->
      <g opacity="0.5">
        <path d="M110 560 L205 430 L300 560 Z" fill="#244a3c" />
        <path d="M170 478 L205 430 L240 478 L222 470 L205 486 L190 468 Z" fill="#e9efe9" opacity="0.85" />
        <path d="M30 600 L120 500 L210 600 Z" fill="#1f4234" />
        <path d="M250 610 L330 520 L410 610 Z" fill="#1f4234" />
      </g>

      <!-- suối Mường Hoa -->
      <path :d="P.river" fill="none" stroke="#1d6f7d" stroke-width="13" stroke-linecap="round" opacity="0.35" />
      <path :d="P.river" fill="none" stroke="#3fb4bf" stroke-width="6" stroke-linecap="round" />
      <path :d="P.river" fill="none" stroke="#bff0ea" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="14 22" opacity="0.8" class="smap-flow" />

      <!-- đường ô tô / xe máy -->
      <g v-for="(d, i) in roads" :key="`r${i}`">
        <path :d="d" fill="none" stroke="#050a07" stroke-width="11" stroke-linecap="round" opacity="0.28" transform="translate(0 4)" />
        <path :d="d" fill="none" stroke="#e9dcc4" stroke-width="5.5" stroke-linecap="round" />
        <path :d="d" fill="none" stroke="#d9772b" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="7 9" opacity="0.9" />
      </g>

      <!-- cung trek (đi bộ) -->
      <path v-for="(d, i) in treks" :key="`t${i}`" :d="d" fill="none" stroke="#9fe08f" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9" />

      <!-- tàu leo núi + cáp treo Fansipan -->
      <path :d="P.funicular" fill="none" stroke="#cdb6f2" stroke-width="4" stroke-linecap="round" />
      <path :d="P.cable" fill="none" stroke="#cdb6f2" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="10 7" />
      <circle cx="385" cy="335" r="6" fill="#16332a" stroke="#cdb6f2" stroke-width="2.5" />

      <!-- đường bay dù lượn -->
      <path :d="P.flight" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 8" />
      <g transform="translate(742 478) rotate(18)">
        <path d="M-17 0 Q0 -19 17 0 Q0 -8 -17 0 Z" fill="#ff6b6b" stroke="#fff" stroke-width="1.2" />
        <path d="M-12 -2 L0 13 L12 -2" fill="none" stroke="#fff" stroke-width="0.9" />
        <circle cx="0" cy="14" r="2.6" fill="#fff" />
      </g>

      <!-- chữ phụ trên sơ đồ -->
      <g class="smap-minor">
        <text x="385" y="358" text-anchor="middle">{{ lang === 'vi' ? 'Ga cáp treo' : 'Cable car station' }}</text>
        <text x="536" y="492" text-anchor="middle">Ý Linh Hồ</text>
        <text x="872" y="622" text-anchor="start">Giàng Tà Chải</text>
        <text x="232" y="262" text-anchor="start">{{ lang === 'vi' ? 'Thác Tình Yêu' : 'Love Waterfall' }}</text>
        <text x="120" y="330" text-anchor="start">Trạm Tôn</text>
        <text x="470" y="548" text-anchor="middle" class="smap-river-name" transform="rotate(27 470 548)">{{ lang === 'vi' ? 'suối Mường Hoa' : 'Muong Hoa stream' }}</text>
      </g>

      <!-- tên sơ đồ -->
      <text x="255" y="690" class="smap-title" transform="rotate(-6 255 690)">Sapa Map</text>

      <!-- la bàn -->
      <g transform="translate(930 70)" opacity="0.8">
        <circle r="22" fill="none" stroke="#e9dcc4" stroke-width="1.2" />
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
  </nav>
</template>

<script setup lang="ts">
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
  moana: { vi: 'Moana Sapa', en: 'Moana Sapa' },
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

/** Nối các mốc thành đường cong mềm (Catmull-Rom → Bézier). */
function smooth(pts: Array<[number, number]>): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)}, ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)}, ${p2[0]} ${p2[1]}`
  }
  return d
}

const P = {
  river: smooth([[330, 398], [415, 462], [500, 512], [585, 565], [660, 600], [760, 632], [850, 672], [965, 742]]),
  funicular: smooth([[500, 300], [440, 322], [385, 335]]),
  cable: smooth([[385, 335], [300, 400], [205, 478]]),
  flight: 'M705 428 Q770 470 672 548'
}

const roads = [
  // QL4D: Sa Pa → Thác Bạc → Ô Quy Hồ → Rồng Mây
  smooth([[500, 300], [452, 268], [410, 228], [352, 205], [322, 168], [285, 150], [238, 172], [205, 215], [150, 232], [108, 196], [128, 150], [118, 108]]),
  // Sa Pa → Tả Phìn
  smooth([[500, 300], [532, 240], [505, 178], [548, 128], [575, 78]]),
  // Sa Pa → Moana → Hang Đá → Lao Chải → Tả Van → Bản Hồ
  smooth([[500, 300], [528, 338], [560, 372], [628, 378], [705, 428], [742, 486], [672, 548], [738, 574], [795, 592], [842, 640], [892, 672], [925, 700]]),
  // Tả Van → Séo Mý Tỷ
  smooth([[795, 592], [770, 646], [712, 660], [690, 706], [640, 712]]),
  // lối lên Hàm Rồng
  smooth([[500, 300], [556, 268], [612, 248]])
]

const treks = [
  // Sa Pa → Cát Cát → Ý Linh Hồ → Lao Chải → Tả Van → Giàng Tà Chải → Bản Hồ
  smooth([[500, 300], [448, 352], [398, 420], [468, 462], [540, 506], [612, 536], [672, 548], [735, 600], [795, 592], [860, 606], [905, 648], [925, 700]]),
  // Trạm Tôn → Fansipan
  smooth([[150, 232], [162, 320], [150, 400], [205, 478]])
]
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
.smap-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.smap-flow { animation: smap-flow 6s linear infinite; }
@keyframes smap-flow { to { stroke-dashoffset: -72; } }
@media (prefers-reduced-motion: reduce) { .smap-flow { animation: none; } }
.smap-minor text { fill: #c9d8cf; font-size: 13px; font-weight: 300; opacity: 0.85; }
.smap-minor .smap-river-name { fill: #9fdfe3; font-size: 12px; font-style: italic; letter-spacing: 0.08em; }
.smap-title { fill: #f0b775; font-family: 'Yellowtail', 'Brush Script MT', cursive; font-size: 74px; opacity: 0.95; paint-order: stroke; stroke: #0b1d17; stroke-width: 5px; stroke-linejoin: round; }
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
  .smap-active .smap-label { display: flex; }
  .smap-side-right .smap-label { left: 17px; }
  .smap-side-left .smap-label { right: 17px; }
  /* chú giải đè lên chữ "Sapa Map" khi sơ đồ co nhỏ → ẩn trên điện thoại */
  .smap-legend { display: none; }
}
</style>
