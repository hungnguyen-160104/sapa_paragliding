<template>
  <!--
    GIẢN ĐỒ THÁM KHÔNG SKEW-T LOG-P — vẽ tay bằng SVG từ số mực áp suất của mô
    hình (chuyển từ mebayluon components/weather/SkewT.tsx). Trục đứng áp suất
    thang log; trục ngang nhiệt độ BỊ XIÊN (Skew-T) hoặc thẳng (Emagram). Đỏ =
    nhiệt độ, xanh = điểm sương, cam đứt = bọt khí từ bãi, dải tím = nghịch nhiệt.
  -->
  <div class="min-w-0 mt-2">
    <div v-if="loi" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{{ t('weather.skewt.error') }}</div>
    <div v-else-if="!du" class="p-3 text-xs text-slate-500">{{ t('weather.skewt.loading') }}</div>
    <div v-else-if="!hienTai" class="p-3 text-xs text-slate-500">{{ t('weather.skewt.noLevels') }}</div>
    <template v-else>
      <div class="mb-2 flex flex-wrap items-center gap-1">
        <span class="text-[11px] font-bold text-slate-500">{{ t('weather.chartType') }}:</span>
        <button v-for="k in (['skewt', 'emagram'] as const)" :key="k" type="button" @click="kieu = k"
          :class="['rounded px-1.5 py-0.5 text-[11px] font-bold', kieu === k ? 'bg-slate-800 text-white' : 'border border-slate-300 bg-white text-slate-700']">
          {{ k === 'skewt' ? 'Skew-T' : 'Emagram' }}
        </button>
      </div>
      <div class="mb-2 flex flex-wrap items-center gap-1">
        <span class="text-[11px] font-bold text-slate-500">{{ t('weather.hourLabel') }}:</span>
        <button v-for="g in gioTrongKhung" :key="g.gio" type="button" @click="gioChon = g.gio"
          :class="['rounded px-1.5 py-0.5 text-[11px] font-bold', g.gio === hienTai.gio ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700']">
          {{ g.gio.slice(11, 16) }}
        </button>
      </div>

      <div :class="hep ? '' : 'overflow-x-auto'">
        <svg :viewBox="`0 0 ${k.W} ${k.H}`" :class="['block h-auto w-full', k.W > 500 ? 'min-w-[560px]' : '']" role="img" :aria-label="`Skew-T ${hienTai.gio}`">
          <defs>
            <clipPath id="khungSkewT"><rect :x="k.LE.trai" :y="k.LE.tren" :width="k.veW + k.LE.phai - 20" :height="k.veH" /></clipPath>
          </defs>
          <rect :x="k.LE.trai" :y="k.LE.tren" :width="k.veW + k.LE.phai - 20" :height="k.veH" fill="#f8fafc" />

          <!-- Đẳng nhiệt mỗi 5°C (đậm ở 10°C, xanh ở 0°C) -->
          <line v-for="l in hinh.dangNhiet" :key="'t' + l.t" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" :stroke="l.t === 0 ? '#60a5fa' : '#e2e8f0'" :stroke-width="l.t === 0 ? 1.2 : l.t % 10 === 0 ? 0.8 : 0.5" />
          <!-- Đoạn nhiệt khô -->
          <polyline v-for="(p, i) in hinh.doanNhietKho" :key="'k' + i" :points="p" fill="none" stroke="#cbd5e1" stroke-width="0.6" stroke-dasharray="3 3" />
          <!-- Nghịch nhiệt -->
          <rect v-for="(n, i) in hinh.nghich" :key="'n' + i" :x="k.LE.trai" :y="n.y" :width="k.veW + k.LE.phai - 20" :height="n.h" fill="#a78bfa" opacity="0.16" />
          <!-- Trục áp suất + độ cao -->
          <g v-for="m in hinh.trongKhung" :key="'p' + m.ap">
            <line :x1="k.LE.trai" :y1="yAp(m.ap)" :x2="k.LE.trai + k.veW + k.LE.phai - 20" :y2="yAp(m.ap)" stroke="#e2e8f0" stroke-width="0.7" />
            <text :x="k.LE.trai - 6" :y="yAp(m.ap) + 3" text-anchor="end" :font-size="k.chu" fill="#64748b">{{ m.ap }}<tspan :font-size="k.chuNho" fill="#94a3b8"> hPa</tspan></text>
            <text :x="k.LE.trai - 6" :y="yAp(m.ap) + 12" text-anchor="end" :font-size="k.chuNho" fill="#94a3b8">{{ m.cao >= 1000 ? `${(m.cao / 1000).toFixed(1)}km` : `${Math.round(m.cao)}m` }}</text>
          </g>
          <!-- Vạch bãi cất / bãi hạ -->
          <g v-if="altBai > 0">
            <line :x1="k.LE.trai" :y1="yCao(altBai)" :x2="k.LE.trai + k.veW" :y2="yCao(altBai)" stroke="#0f172a" stroke-width="1" stroke-dasharray="5 3" />
            <text :x="k.LE.trai + 3" :y="yCao(altBai) - 3" :font-size="k.chu" font-weight="700" fill="#0f172a">{{ t('weather.takeoff') }} {{ altBai }}m</text>
          </g>
          <g v-if="altCat2 !== undefined && altCat2 !== altBai">
            <line :x1="k.LE.trai" :y1="yCao(altCat2)" :x2="k.LE.trai + k.veW" :y2="yCao(altCat2)" stroke="#0f172a" stroke-width="0.7" stroke-dasharray="3 4" opacity="0.7" />
            <text :x="k.LE.trai + 3" :y="yCao(altCat2) - 3" :font-size="k.chuNho" font-weight="700" fill="#334155">{{ t('weather.takeoff') }} {{ altCat2 }}m</text>
          </g>
          <g v-if="altHa !== undefined && altHa < altBai">
            <line :x1="k.LE.trai" :y1="yCao(altHa)" :x2="k.LE.trai + k.veW" :y2="yCao(altHa)" stroke="#475569" stroke-width="0.9" stroke-dasharray="2 4" />
            <text :x="k.LE.trai + 3" :y="yCao(altHa) - 3" :font-size="k.chu" font-weight="700" fill="#475569">{{ t('weather.landing') }} {{ altHa }}m</text>
          </g>
          <!-- Đáy mây và trần thermal -->
          <g v-if="hinh.caoDayMay > altBai">
            <line :x1="k.LE.trai" :y1="yCao(hinh.caoDayMay)" :x2="k.LE.trai + k.veW" :y2="yCao(hinh.caoDayMay)" stroke="#0284c7" stroke-width="1" stroke-dasharray="2 3" />
            <text :x="k.LE.trai + k.veW - 3" :y="yCao(hinh.caoDayMay) - 3" text-anchor="end" :font-size="k.chu" fill="#0284c7" font-weight="700">{{ t('weather.cloudBase') }} ~{{ Math.round(hinh.caoDayMay) }}m</text>
          </g>
          <g v-if="hinh.tranThermal !== null && hinh.tranThermal > altBai">
            <line :x1="k.LE.trai" :y1="yCao(hinh.tranThermal)" :x2="k.LE.trai + k.veW" :y2="yCao(hinh.tranThermal)" stroke="#ea580c" stroke-width="1.2" />
            <text :x="k.LE.trai + k.veW - 3" :y="yCao(hinh.tranThermal) + 11" text-anchor="end" :font-size="k.chu" fill="#ea580c" font-weight="700">{{ t('weather.thermalTop') }} ~{{ hinh.tranThermal }}m</text>
          </g>
          <!-- Bọt khí, điểm sương, nhiệt độ -->
          <g clip-path="url(#khungSkewT)">
            <polyline :points="hinh.duongBot" fill="none" stroke="#f97316" stroke-width="1.6" stroke-dasharray="5 4" />
            <polyline :points="hinh.duongSuong" fill="none" stroke="#2563eb" stroke-width="2.4" />
            <polyline :points="hinh.duongNhiet" fill="none" stroke="#dc2626" stroke-width="2.4" />
          </g>
          <g clip-path="url(#khungSkewT)">
            <text v-for="m in hinh.trongKhung" :key="'tt' + m.ap" :x="xNhiet(m.nhiet, yAp(m.ap)) + 4" :y="yAp(m.ap) - 4" :font-size="k.chuNho" font-weight="700" fill="#b91c1c">{{ m.nhiet.toFixed(0) }}°</text>
          </g>
          <!-- Cờ gió bên phải -->
          <g v-for="w in hinh.gio" :key="'w' + w.ap">
            <g :transform="`translate(${w.x},${w.y}) rotate(${w.huong + 180})`">
              <line x1="0" y1="-7" x2="0" y2="7" stroke="#0f172a" stroke-width="1.2" />
              <polygon points="0,9 -3.2,3 3.2,3" fill="#0f172a" />
            </g>
            <text :x="w.x + 10" :y="w.y + 3" :font-size="k.chu" fill="#334155">{{ w.gio.toFixed(0) }}</text>
            <text :x="w.x - 12" :y="w.y + 3" text-anchor="end" :font-size="k.chuNho" fill="#64748b">{{ tenHuong(w.huong) }}</text>
          </g>
          <!-- Chú thích trên hình -->
          <g :transform="`translate(${k.LE.trai + 6},${k.LE.tren + 6})`">
            <rect x="0" y="0" :width="k.W > 500 ? 214 : 170" :height="k.W > 500 ? 64 : 54" rx="4" fill="#ffffff" opacity="0.88" stroke="#e2e8f0" />
            <g v-for="(c, i) in chuThich" :key="c.ten" :transform="`translate(8,${(k.W > 500 ? 13 : 11) + i * (k.W > 500 ? 14 : 12)})`">
              <line x1="0" y1="0" x2="20" y2="0" :stroke="c.mau" :stroke-width="c.day" :stroke-dasharray="c.net || undefined" />
              <text x="26" y="4" :font-size="k.chu" fill="#334155">{{ c.ten }}</text>
            </g>
          </g>
          <!-- Trục nhiệt độ -->
          <text v-for="tt in TRUC_T" :key="'x' + tt" :x="xNhiet(tt, k.LE.tren + k.veH)" :y="k.H - k.LE.duoi + 14" text-anchor="middle" :font-size="k.chu" fill="#64748b">{{ tt }}°</text>
          <text :x="k.LE.trai" :y="k.H - 6" :font-size="k.chu" fill="#94a3b8">{{ hienTai.gio.slice(11, 16) }} · {{ t('weather.skewCaption') }}</text>
        </svg>
      </div>

      <!-- Cách đọc: tiếng Việt bài dài, thứ tiếng khác bản gọn -->
      <div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] leading-snug text-slate-700">
        <template v-if="locale === 'vi'">
          <div class="mb-1 font-bold">Giản đồ này nói gì</div>
          <div class="mb-1">Mỗi đường là MỘT SỐ ĐO THEO ĐỘ CAO của cột không khí trên bãi, lúc giờ đang chọn. Trục dọc là độ cao (ghi kèm áp suất tính bằng hPa), trục ngang là nhiệt độ.</div>
          <div class="mb-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-1">
            <b>Đường đỏ nghiêng sang phải KHÔNG có nghĩa là càng lên càng nóng.</b> Ở kiểu <b>Skew-T</b>, trục nhiệt độ bị xiên có chủ ý (để đoạn nhiệt khô thành gần thẳng đứng), nên trời vẫn lạnh dần mà đường có thể ngả phải — số °C in ngay trên đường mới là nhiệt độ thật. Nghiêng phải = lớp khí <b>ổn định hơn</b> bình thường (thermal yếu), nghiêng trái = nguội nhanh, thermal lên tốt. Muốn nhìn đúng như cảm nhận thì bấm <b>Emagram</b>.
          </div>
          <ul class="ml-3 list-disc space-y-0.5">
            <li><b class="text-rose-700">Đỏ — nhiệt độ không khí</b>: trời ở độ cao ấy đang bao nhiêu độ. Bình thường càng lên càng lạnh.</li>
            <li><b class="text-blue-700">Xanh — điểm sương</b>: không khí phải nguội tới bao nhiêu độ thì hơi nước ngưng thành mây. Hai đường <b>sát nhau</b> là không khí ẩm (dễ có mây, mưa rào, mù); <b>tách xa</b> là khô, trời trong.</li>
            <li><b class="text-orange-600">Cam đứt nét — thermal từ mặt đất</b>: khối khí nóng bốc lên nguội dần theo đường này. Còn nằm <b>bên phải đường đỏ</b> thì còn tự lên — còn nâng để bay; chỗ chạm đường đỏ là hết nâng.</li>
            <li><b class="text-slate-500">Xám đứt nét — đoạn nhiệt khô</b>: quy luật vật lý (khí khô bốc lên nguội 1°C/100m), vẽ để so độ nghiêng với đường đỏ.</li>
          </ul>
          <div class="mt-1">
            Vạch ngang: <b>bãi cất</b> và <b>bãi hạ</b> (chênh nhau là độ cao thả)<template v-if="hinh.caoDayMay > 0">, <b class="text-sky-700">đáy mây ~{{ Math.round(hinh.caoDayMay) }}m</b></template><template v-if="hinh.tranThermal !== null">, <b class="text-orange-700">trần thermal ~{{ hinh.tranThermal }}m</b></template>.
          </div>
          <div class="mt-1" :class="hinh.nghich.length ? '' : 'opacity-80'">
            <span v-if="hinh.nghich.length" class="inline-block h-2 w-4 rounded-sm bg-violet-300 align-middle" />
            {{ hinh.nghich.length ? t('weather.skewt.inversionBand') : t('weather.skewt.noInversion') }}
          </div>
          <div class="mt-1 opacity-80">{{ t('weather.skewt.windColumn') }}</div>
        </template>
        <template v-else>
          <div class="mb-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-1">{{ t('weather.skewTiltNote') }}</div>
          <ul class="ml-3 list-disc space-y-0.5">
            <li><b class="text-rose-700">—</b> {{ t('weather.skewTemp') }}</li>
            <li><b class="text-blue-700">—</b> {{ t('weather.skewDew') }}</li>
            <li><b class="text-orange-600">- -</b> {{ t('weather.skewParcel') }}<template v-if="hinh.tranThermal !== null"> · ~{{ hinh.tranThermal }}m</template></li>
            <li><b class="text-slate-500">- -</b> {{ t('weather.skewDry') }}</li>
          </ul>
          <div class="mt-1">{{ hinh.nghich.length ? t('weather.skewt.inversionBand') : t('weather.skewt.noInversion') }}</div>
          <div class="mt-1 opacity-80">{{ t('weather.skewt.windColumn') }}</div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { dayMay, duongBotKhi, lopNghichNhiet, tranBotKhi, type MucSkewT, type ThamKhong } from '~/utils/weather-skewt'
import { useManHinhHep } from '~/composables/useCuonTheoNgay'
import { useWeatherI18n } from '~/composables/useWeatherI18n'

const props = withDefaults(defineProps<{
  ngay: string
  moHinh: string
  altBai?: number
  altHa?: number
  altCat2?: number
  gioBay?: [number, number]
}>(), { altBai: 0, gioBay: () => [7, 17] })

const { t, locale, tenHuong } = useWeatherI18n()
const hep = useManHinhHep(700)

/* ---- Khung vẽ: máy tính 820×620, điện thoại 400×520 ---- */
const k = computed(() => {
  const h = hep.value
  const W = h ? 400 : 820
  const H = h ? 520 : 620
  const LE = h ? { trai: 40, phai: 54, tren: 12, duoi: 30 } : { trai: 62, phai: 92, tren: 16, duoi: 38 }
  return { W, H, LE, veW: W - LE.trai - LE.phai, veH: H - LE.tren - LE.duoi, chu: h ? 9 : 11, chuNho: h ? 8 : 10 }
})
const T_MIN = -20
const T_MAX = 45
const XIEN = 0.47
const AP_DUOI = 1000
const AP_TREN = 616
const TRUC_T = Array.from({ length: 7 }, (_, i) => T_MIN + i * 10)

const kieu = ref<'skewt' | 'emagram'>('skewt')
const yAp = (ap: number) => k.value.LE.tren + (k.value.veH * (Math.log(AP_TREN) - Math.log(ap))) / (Math.log(AP_TREN) - Math.log(AP_DUOI))
const xNhiet = (tt: number, y: number) =>
  k.value.LE.trai + ((tt - T_MIN) / (T_MAX - T_MIN)) * k.value.veW + (k.value.LE.tren + k.value.veH - y) * (kieu.value === 'emagram' ? 0 : XIEN)

/* ---- Dữ liệu ---- */
const du = ref<{ khoa: string; gio: ThamKhong[] } | null>(null)
const loi = ref(false)
const gioChon = ref<string | null>(null)
const khoa = computed(() => `${props.ngay}|${props.moHinh}`)
watch(khoa, async (kh) => {
  loi.value = false
  du.value = null
  try {
    const js = await $fetch<{ gio?: ThamKhong[] }>('/api/weather-skewt', { query: { date: props.ngay, model: props.moHinh } })
    if (khoa.value === kh) du.value = { khoa: kh, gio: js.gio ?? [] }
  } catch {
    if (khoa.value === kh) loi.value = true
  }
}, { immediate: true })

const gioTrongKhung = computed(() =>
  (du.value?.gio ?? []).filter((g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= props.gioBay[0] && h <= props.gioBay[1] && g.muc.length >= 3
  })
)
const hienTai = computed(() =>
  gioTrongKhung.value.find((g) => g.gio === gioChon.value) ??
  gioTrongKhung.value.find((g) => g.gio.slice(11, 13) === '13') ??
  gioTrongKhung.value[Math.floor(gioTrongKhung.value.length / 2)] ?? null
)

/* ---- Hình học ---- */
const yCaoTheoBang = (trongKhung: MucSkewT[]) => (cao: number): number => {
  for (let i = 1; i < trongKhung.length; i++) {
    const a = trongKhung[i - 1]!
    const b = trongKhung[i]!
    if (cao >= a.cao && cao <= b.cao) {
      const f = (cao - a.cao) / Math.max(1, b.cao - a.cao)
      return yAp(a.ap) + (yAp(b.ap) - yAp(a.ap)) * f
    }
  }
  if (!trongKhung.length) return 0
  return cao < trongKhung[0]!.cao ? yAp(trongKhung[0]!.ap) : yAp(trongKhung[trongKhung.length - 1]!.ap)
}

const hinh = computed(() => {
  const muc = hienTai.value?.muc ?? []
  const trongKhung = muc.filter((m) => m.ap <= AP_DUOI && m.ap >= AP_TREN)
  const tren = muc.filter((m) => m.ap < AP_TREN).sort((a, b) => b.ap - a.ap)[0]
  const noiDai = tren ? [...trongKhung, tren] : trongKhung
  const batDau = trongKhung.find((m) => m.cao >= props.altBai - 50) ?? trongKhung[0]
  const yC = yCaoTheoBang(trongKhung)
  const duong = (lay: (m: MucSkewT) => number) => noiDai.map((m) => `${xNhiet(lay(m), yAp(m.ap)).toFixed(1)},${yAp(m.ap).toFixed(1)}`).join(' ')
  const bot = batDau ? duongBotKhi({ ap: batDau.ap, cao: batDau.cao, nhiet: batDau.nhiet, suong: batDau.suong }, noiDai.map((m) => ({ ap: m.ap, cao: m.cao }))) : []
  const yD = k.value.LE.tren + k.value.veH
  const yT = k.value.LE.tren
  return {
    trongKhung,
    caoDayMay: batDau ? batDau.cao + dayMay(batDau.nhiet, batDau.suong) : 0,
    tranThermal: batDau ? tranBotKhi(bot, noiDai.map((m) => ({ cao: m.cao, nhiet: m.nhiet }))) : null,
    nghich: lopNghichNhiet(trongKhung).map((n) => ({ y: yC(n.den), h: Math.max(1, yC(n.tu) - yC(n.den)) })),
    dangNhiet: Array.from({ length: 14 }, (_, i) => T_MIN + i * 5).map((tt) => ({ t: tt, x1: xNhiet(tt, yD), y1: yD, x2: xNhiet(tt, yT), y2: yT })),
    doanNhietKho: Array.from({ length: 9 }, (_, i) => -20 + i * 10).map((t0) => {
      const diem: string[] = []
      for (let ap = AP_DUOI; ap >= AP_TREN; ap -= 25) {
        const y = yAp(ap)
        const tt = (t0 + 273.15) * Math.pow(ap / 1000, 0.286) - 273.15
        diem.push(`${xNhiet(tt, y).toFixed(1)},${y.toFixed(1)}`)
      }
      return diem.join(' ')
    }),
    duongBot: bot.map((p) => `${xNhiet(p.nhiet, yAp(p.ap)).toFixed(1)},${yAp(p.ap).toFixed(1)}`).join(' '),
    duongSuong: duong((m) => m.suong),
    duongNhiet: duong((m) => m.nhiet),
    gio: trongKhung.flatMap((m) => (m.gio === null || m.huong === null ? [] : [{ ap: m.ap, x: k.value.W - k.value.LE.phai + 26, y: yAp(m.ap), gio: m.gio, huong: m.huong }]))
  }
})
const yCao = (cao: number) => yCaoTheoBang(hinh.value.trongKhung)(cao)

const chuThich = computed(() => [
  { mau: '#dc2626', ten: t('weather.skewTemp'), day: 2.4, net: '' },
  { mau: '#2563eb', ten: t('weather.skewDew'), day: 2.4, net: '' },
  { mau: '#f97316', ten: t('weather.skewParcel'), day: 1.6, net: '5 4' },
  { mau: '#cbd5e1', ten: t('weather.skewDry'), day: 1, net: '3 3' }
])
</script>
