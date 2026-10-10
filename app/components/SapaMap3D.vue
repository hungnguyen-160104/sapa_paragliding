<template>
  <!--
    Bản đồ 3D thật (MapLibre) mở ra khi bấm một điểm trên sơ đồ Sa Pa: địa hình dựng từ
    dữ liệu độ cao, đường/nhà/thôn bản/suối từ OpenStreetMap (OpenFreeMap). Mọi thứ được
    vẽ lại ở từng mức zoom nên chữ luôn thẳng và nét; càng phóng càng hiện thêm chi tiết.
    Chỉ tải thư viện khi khách bấm lần đầu. Lỗi (không có WebGL, mất mạng) → emit('fail').
  -->
  <div class="sm3" :class="{ 'sm3-on': shown }">
    <div ref="el" class="sm3-map" />
  </div>
</template>

<script setup lang="ts">
import { SAPA_STOPS } from '~~/shared/sapa-map'

const props = defineProps<{ slug: string; lang: 'vi' | 'en'; names: Record<string, { vi: string; en: string }> }>()
const emit = defineEmits<{ select: [slug: string]; fail: []; closed: [] }>()

const el = ref<HTMLDivElement | null>(null)
const shown = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null

/** Khung toàn cảnh Sa Pa — điểm xuất phát của cú bay vào, khớp với sơ đồ phía sau. */
const BOUNDS: [[number, number], [number, number]] = [[103.804, 22.268], [103.909, 22.372]]
const FONT = ['Noto Sans Regular']
const FONT_B = ['Noto Sans Bold']
const INK = '#1c1a16'
/** Tên thôn bản trùng với điểm dừng (đã có nhãn riêng) → không vẽ lại lần nữa. */
const STOP_WORDS = ['Cát Cát', 'Tả Van', 'Lao Chải', 'Lao Chai', 'Tả Phìn', 'Bản Hồ', 'Sa Pa', 'Sapa']
const PAPER = '#fffdf6'

function stopsGeo() {
  return {
    type: 'FeatureCollection',
    features: SAPA_STOPS.map((s) => ({
      type: 'Feature',
      properties: { slug: s.slug, kind: s.kind, n: s.n, name: props.names[s.slug]?.[props.lang] ?? s.slug },
      geometry: { type: 'Point', coordinates: [s.lon, s.lat] }
    }))
  }
}

function style() {
  const w = (a: number, b: number) => ['interpolate', ['exponential', 1.6], ['zoom'], 12, a, 17, b]
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: '© OpenStreetMap contributors · OpenFreeMap' },
      dem: { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 15, attribution: 'Độ cao: AWS Terrain Tiles' },
      ours: { type: 'geojson', data: '/data/sapa-map-3d.geojson' },
      stops: { type: 'geojson', data: stopsGeo() }
    },
    terrain: { source: 'dem', exaggeration: 1.35 },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#c4d292' } },
      // cùng thang màu theo độ cao của sơ đồ
      { id: 'relief', type: 'color-relief', source: 'dem', paint: { 'color-relief-color': ['interpolate', ['linear'], ['elevation'], 900, 'rgb(112,166,104)', 1150, 'rgb(146,188,116)', 1400, 'rgb(190,206,134)', 1650, 'rgb(222,208,142)', 1900, 'rgb(216,184,128)', 2150, 'rgb(198,162,120)', 2400, 'rgb(188,164,142)', 2650, 'rgb(206,198,190)', 3000, 'rgb(240,238,236)'] } },
      { id: 'shade', type: 'hillshade', source: 'dem', paint: { 'hillshade-exaggeration': 0.55, 'hillshade-shadow-color': '#3a2c1c', 'hillshade-highlight-color': '#fffdf6', 'hillshade-accent-color': '#5a4630' } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#7fb4d6' } },
      // suối, sông: to dần khi phóng gần (sông > suối), có viền sáng cho nổi trên nền núi
      { id: 'river-glow', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 13, paint: { 'line-color': '#dff0fa', 'line-opacity': 0.85, 'line-width': ['interpolate', ['exponential', 1.7], ['zoom'], 13, ['match', ['get', 'class'], 'river', 4, 2.5], 17, ['match', ['get', 'class'], 'river', 34, 20]] }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'river', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': '#3d8fcc', 'line-width': ['interpolate', ['exponential', 1.7], ['zoom'], 11, ['match', ['get', 'class'], 'river', 1.6, 0.8], 14, ['match', ['get', 'class'], 'river', 5, 3], 17, ['match', ['get', 'class'], 'river', 26, 14]] }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      // đường: mòn / bản / tỉnh lộ / quốc lộ — nét to dần theo cấp và theo mức zoom
      { id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 13, filter: ['in', ['get', 'class'], ['literal', ['path', 'track']]], paint: { 'line-color': '#6e4628', 'line-width': w(0.6, 2.2), 'line-dasharray': [2, 1.5] } },
      { id: 'minor-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'service']]], paint: { 'line-color': '#8a6a4a', 'line-width': w(1.2, 7) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'minor', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['minor', 'service']]], paint: { 'line-color': PAPER, 'line-width': w(0.6, 5) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'major-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['tertiary', 'secondary', 'primary', 'trunk']]], paint: { 'line-color': '#5c1e0e', 'line-width': w(3, 14) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['tertiary', 'secondary', 'primary', 'trunk']]], paint: { 'line-color': '#e24a28', 'line-width': w(1.8, 10) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'house', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-extrusion-color': '#b49a80', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6], 'fill-extrusion-opacity': 0.92 } },
      // lớp riêng của Sapa Paragliding: cung trek, tàu leo núi, cáp treo, đường bay
      { id: 'trek', type: 'line', source: 'ours', filter: ['==', ['get', 'k'], 'trek'], paint: { 'line-color': '#14703a', 'line-width': w(2, 6), 'line-dasharray': [0.6, 1.6] }, layout: { 'line-cap': 'round' } },
      // tàu leo núi: xa thì là một nét xanh; phóng gần (≥ 14,5) thành đường ray thật — tà vẹt ngang + hai thanh ray
      { id: 'rail-case', type: 'line', source: 'ours', filter: ['==', ['get', 'k'], 'rail'], paint: { 'line-color': PAPER, 'line-width': w(5, 22), 'line-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 1, 15.2, 0.75] } },
      { id: 'rail', type: 'line', source: 'ours', filter: ['==', ['get', 'k'], 'rail'], paint: { 'line-color': '#164e6e', 'line-width': w(3, 9), 'line-opacity': ['interpolate', ['linear'], ['zoom'], 14.5, 1, 15.2, 0] } },
      { id: 'rail-bed', type: 'line', source: 'ours', minzoom: 14.5, filter: ['==', ['get', 'k'], 'rail'], paint: { 'line-color': '#9c8a74', 'line-width': w(4, 18) } },
      { id: 'rail-ties', type: 'line', source: 'ours', minzoom: 14.5, filter: ['==', ['get', 'k'], 'rail'], paint: { 'line-color': '#5b3d24', 'line-width': w(3.5, 16), 'line-dasharray': [0.16, 0.7] } },
      { id: 'rail-steel', type: 'line', source: 'ours', minzoom: 14.5, filter: ['==', ['get', 'k'], 'rail'], paint: { 'line-color': '#26323a', 'line-width': ['interpolate', ['linear'], ['zoom'], 14.5, 0.8, 17, 2.2], 'line-gap-width': w(1.6, 8) } },
      { id: 'cable', type: 'line', source: 'ours', filter: ['==', ['get', 'k'], 'cable'], paint: { 'line-color': '#164e6e', 'line-width': w(1.5, 4), 'line-dasharray': [3, 2] } },
      { id: 'flight', type: 'line', source: 'ours', filter: ['==', ['get', 'k'], 'flight'], paint: { 'line-color': '#78146e', 'line-width': w(2, 6), 'line-dasharray': [3, 2] } },
      // chữ: luôn đứng thẳng, sắc nét ở mọi mức zoom
      { id: 'road-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14, layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']], 'text-font': FONT, 'text-size': 12 }, paint: { 'text-color': '#5c1e0e', 'text-halo-color': PAPER, 'text-halo-width': 1.6 } },
      { id: 'water-name', type: 'symbol', source: 'omt', 'source-layer': 'waterway', minzoom: 13, layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']], 'text-font': FONT_B, 'text-size': ['interpolate', ['linear'], ['zoom'], 13, 12, 17, 16] }, paint: { 'text-color': '#13568a', 'text-halo-color': PAPER, 'text-halo-width': 1.8 } },
      // thác nước: nhãn xanh nổi bật, hiện từ xa
      { id: 'waterfall', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 12, filter: ['in', ['get', 'subclass'], ['literal', ['waterfall', 'rapids']]], layout: { 'text-field': ['concat', '≋ ', ['coalesce', ['get', 'name:vi'], ['get', 'name'], 'Thác']], 'text-font': FONT_B, 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 12, 17, 17], 'text-anchor': 'left', 'text-offset': [0.6, 0], 'text-allow-overlap': true }, paint: { 'text-color': '#13568a', 'text-halo-color': PAPER, 'text-halo-width': 2 } },
      { id: 'peak', type: 'symbol', source: 'omt', 'source-layer': 'mountain_peak', layout: { 'text-field': ['concat', '▲ ', ['coalesce', ['get', 'name:vi'], ['get', 'name'], ''], ['case', ['has', 'ele'], ['concat', ' ', ['to-string', ['get', 'ele']], ' m'], '']], 'text-font': FONT, 'text-size': 12, 'text-anchor': 'top' }, paint: { 'text-color': '#4a3420', 'text-halo-color': PAPER, 'text-halo-width': 1.6 } },
      { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['all', ['in', ['get', 'class'], ['literal', ['village', 'hamlet', 'suburb', 'neighbourhood', 'town', 'isolated_dwelling']]], ['!', ['in', ['coalesce', ['get', 'name:vi'], ['get', 'name']], ['literal', STOP_WORDS]]]], layout: { 'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']], 'text-font': FONT_B, 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 11, 16, 15], 'text-letter-spacing': 0.04 }, paint: { 'text-color': INK, 'text-halo-color': PAPER, 'text-halo-width': 1.8 } },
      // địa điểm nhỏ (quán, homestay…); ẩn ghim dù lượn của đơn vị khác
      { id: 'poi', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 15, filter: ['all', ['<=', ['get', 'rank'], 25], ['!', ['in', 'aragl', ['downcase', ['coalesce', ['get', 'name'], '']]]], ['!', ['in', 'dù lượn', ['downcase', ['coalesce', ['get', 'name'], '']]]]], layout: { 'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']], 'text-font': FONT, 'text-size': 11, 'text-max-width': 8 }, paint: { 'text-color': '#47443b', 'text-halo-color': PAPER, 'text-halo-width': 1.4 } },
      // điểm dừng của bản đồ
      { id: 'stop-dot', type: 'circle', source: 'stops', paint: { 'circle-radius': ['case', ['==', ['get', 'slug'], props.slug], 11, 8], 'circle-color': ['match', ['get', 'kind'], 'fly', '#0f2e21', 'rail', '#164e6e', INK], 'circle-stroke-color': ['case', ['==', ['get', 'slug'], props.slug], '#f2963e', PAPER], 'circle-stroke-width': ['case', ['==', ['get', 'slug'], props.slug], 4, 2.5], 'circle-pitch-alignment': 'viewport' } },
      { id: 'stop-name', type: 'symbol', source: 'stops', layout: { 'text-field': ['get', 'name'], 'text-font': FONT_B, 'text-size': 14, 'text-offset': [0, 1.3], 'text-anchor': 'top', 'text-allow-overlap': true }, paint: { 'text-color': INK, 'text-halo-color': PAPER, 'text-halo-width': 2.2 } }
    ]
  }
}

/**
 * Dù lượn bay vòng quanh bãi cất cánh (bản Hang Đá) và bãi hạ cánh (Lao Chải): marker HTML
 * giữ cỡ cố định trên màn hình, vị trí đổi theo từng khung hình (bay vòng tròn, hơi lệch tâm).
 */
const GLIDERS = [
  { c: [103.8772, 22.3205], r: 0.0026, t: 46, ph: 0 }, { c: [103.8772, 22.3205], r: 0.0018, t: 38, ph: 2.1 },
  { c: [103.8790, 22.3165], r: 0.0032, t: 55, ph: 4.0 }, { c: [103.8761, 22.3112], r: 0.0022, t: 42, ph: 1.0 },
  { c: [103.8749, 22.3125], r: 0.0016, t: 34, ph: 3.3 }, { c: [103.8805, 22.3140], r: 0.0028, t: 60, ph: 5.2 }
]
const GL_COLORS = ['#f2963e', '#e11d2e', '#2b74c9', '#14a37f', '#f2c12e', '#7b4bb3']
let raf = 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addGliders(ml: any) {
  const ms = GLIDERS.map((g, i) => {
    const el = document.createElement('div')
    el.className = 'sm3-glider'
    el.innerHTML = `<svg viewBox="-16 -16 32 34" width="30" height="32" aria-hidden="true"><path d="M-14 0 Q0 -15 14 0 Q0 -6 -14 0Z" fill="${GL_COLORS[i % GL_COLORS.length]}" stroke="#1c1a16" stroke-width="1.4" stroke-linejoin="round"/><path d="M-9 -1.5 L0 11 L9 -1.5" fill="none" stroke="#1c1a16" stroke-width="1"/><circle cx="0" cy="12.5" r="2.4" fill="#1c1a16"/></svg>`
    return new ml.Marker({ element: el, anchor: 'bottom', offset: [0, -26] }).setLngLat(g.c as [number, number]).addTo(map)
  })
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const tick = (now: number) => {
    GLIDERS.forEach((g, i) => {
      const a = g.ph + (reduce ? 0 : (now / 1000) * (2 * Math.PI / g.t))
      const lon = g.c[0] + Math.cos(a) * g.r * 1.08, lat = g.c[1] + Math.sin(a) * g.r * 0.72
      ms[i].setLngLat([lon, lat])
      const el = ms[i].getElement().firstElementChild as HTMLElement
      if (el) el.style.transform = `rotate(${Math.sin(a) * 14}deg)`
    })
    if (!reduce) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function camera(slug: string) {
  const s = SAPA_STOPS.find((x) => x.slug === slug)
  if (!s) return null
  const far = s.kind === 'peak' || s.kind === 'pass' || s.kind === 'bridge'
  return { center: [s.lon, s.lat] as [number, number], zoom: far ? 14.2 : 15.4, pitch: 62, bearing: -22 }
}

function fly(slug: string) {
  const c = camera(slug)
  if (!map || !c) return
  map.setPaintProperty('stop-dot', 'circle-radius', ['case', ['==', ['get', 'slug'], slug], 11, 8])
  map.setPaintProperty('stop-dot', 'circle-stroke-color', ['case', ['==', ['get', 'slug'], slug], '#f2963e', PAPER])
  map.setPaintProperty('stop-dot', 'circle-stroke-width', ['case', ['==', ['get', 'slug'], slug], 4, 2.5])
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  map.flyTo({ ...c, duration: reduce ? 0 : 2800, curve: 1.3, essential: true })
}

/** Thu về: bay lùi ra toàn cảnh rồi tắt dần lớp 3D, trả lại sơ đồ. */
function zoomOut() {
  if (!map) { emit('closed'); return }
  map.flyTo({ center: [103.8565, 22.32], zoom: 12.2, pitch: 0, bearing: 0, duration: 1100, essential: true })
  setTimeout(() => { shown.value = false; setTimeout(() => emit('closed'), 350) }, 900)
}
defineExpose({ zoomOut })

onMounted(async () => {
  try {
    const [ml, worker] = await Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl-worker.mjs?url'), import('maplibre-gl/dist/maplibre-gl.css')])
    ml.setWorkerUrl(worker.default)
    map = new ml.Map({ container: el.value!, style: style() as never, bounds: BOUNDS, pitch: 0, maxPitch: 75, attributionControl: { compact: true }, dragRotate: true, fadeDuration: 150, canvasContextAttributes: { preserveDrawingBuffer: location.search.includes('sm3debug') } })
    if (location.search.includes('sm3debug')) (window as unknown as { __sm3: unknown }).__sm3 = map
    map.addControl(new ml.NavigationControl({ visualizePitch: true }), 'bottom-right')
    map.on('error', (e: { error?: { message?: string } }) => console.warn('[SapaMap3D]', e?.error?.message))
    map.once('load', () => {
      addGliders(ml)
      shown.value = true
      setTimeout(() => fly(props.slug), 250)
    })
    map.on('click', 'stop-dot', (e: { features?: Array<{ properties: { slug: string } }> }) => { const s = e.features?.[0]?.properties.slug; if (s) emit('select', s) })
    map.on('mouseenter', 'stop-dot', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'stop-dot', () => { map.getCanvas().style.cursor = '' })
  } catch (err) {
    console.warn('[SapaMap3D] không dựng được bản đồ 3D', err)
    emit('fail')
  }
})
watch(() => props.slug, (s) => fly(s))
onBeforeUnmount(() => { cancelAnimationFrame(raf); map?.remove(); map = null })
</script>

<style>
.sm3 { position: absolute; inset: 0; z-index: 7; opacity: 0; transition: opacity 0.45s; pointer-events: none; }
.sm3.sm3-on { opacity: 1; pointer-events: auto; }
.sm3 .sm3-map, .sm3 .sm3-map.maplibregl-map { position: absolute; inset: 0; width: 100%; height: 100%; }
.sm3 .maplibregl-ctrl-attrib { font-size: 10px; }
.sm3-glider { pointer-events: none; filter: drop-shadow(0 6px 3px rgba(0, 0, 0, 0.28)); }
.sm3-glider svg { display: block; transition: transform 0.2s linear; }
</style>
