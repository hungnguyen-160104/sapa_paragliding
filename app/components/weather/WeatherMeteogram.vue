<template>
  <!--
    METEOGRAM — biểu đồ nhiều tầng theo giờ, vẽ theo lối Windy, NỐI LIỀN CẢ DÃY
    NGÀY (chuyển từ mebayluon components/weather/Meteogram.tsx). Bấm ngày ở dải
    trên thì biểu đồ trượt tới; gạt biểu đồ tới ngày nào thì dải trên sáng theo.
  -->
  <div v-if="cot.length >= 2" class="mt-2 rounded-xl border border-slate-200 bg-white">
    <div ref="khung" class="overflow-x-auto overscroll-x-contain" @scroll="onScroll">
      <div class="flex" :style="{ width: `${wNhan + rong}px` }">
        <!-- Cột nhãn trục trái — DÍNH khi cuộn -->
        <div data-truc class="sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-white" :style="{ width: `${wNhan}px` }">
          <div class="h-[22px] border-b border-slate-200 bg-slate-50" />
          <div :class="['h-[22px]', nhanTrai]">{{ nhan.gio }}</div>
          <div :class="['h-[26px]', nhanTrai]">{{ nhan.troi }}</div>
          <div :style="{ height: `${H_NHIET}px` }" :class="nhanTrai">°C</div>
          <div :class="[hep ? 'h-[38px]' : 'h-[44px]', nhanTrai]">{{ nhan.gioMs }}</div>
          <div :class="['h-[20px]', nhanTrai]">{{ nhan.giat }}</div>
          <div :style="{ height: `${H_KHOI}px` }" :class="nhanTrai">
            {{ nhan.may }}
            <div class="mt-1 font-normal text-blue-600">{{ nhan.mua }}</div>
            <div class="mt-1 font-normal">hPa</div>
          </div>
          <div :class="['h-[22px] border-t border-slate-200', nhanTrai]">{{ nhan.tran }}</div>
        </div>

        <div :style="{ width: `${rong}px` }">
          <WeatherHangNgay :cot="cot" :w="W" />
          <WeatherHangGio :cot="cot" :w="W" />

          <!-- Biểu tượng trời -->
          <div class="flex h-[26px] items-center">
            <div
              v-for="c in cot"
              :key="c.g.gio"
              :style="{ width: `${W}px` }"
              :class="['h-full shrink-0 pt-0.5 text-center text-lg leading-none', c.dem ? 'bg-indigo-50' : '', c.dau ? 'border-l-2 border-slate-300' : '']"
              :title="`${Math.round(c.g.may)}%`"
            >
              {{ bieuTuongTroi(c.g.may, c.g.mua, c.g.buXa) }}
            </div>
          </div>

          <!-- Nhiệt độ: đường cong nền, số in đè -->
          <div class="relative" :style="{ height: `${H_NHIET}px` }">
            <svg :width="rong" :height="H_NHIET" class="absolute inset-0" aria-hidden="true">
              <template v-for="(c, i) in cot" :key="'d' + c.g.gio">
                <rect v-if="c.dem" :x="i * W" y="0" :width="W" :height="H_NHIET" fill="#eef2ff" />
              </template>
              <path :d="`${duongNhiet} L${rong},${H_NHIET} L0,${H_NHIET} Z`" fill="#fecaca" opacity="0.5" />
              <path :d="duongNhiet" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round" />
              <template v-for="(c, i) in cot" :key="'v' + c.g.gio">
                <line v-if="c.dau && i > 0" :x1="i * W" y1="0" :x2="i * W" :y2="H_NHIET" stroke="#cbd5e1" stroke-width="2" />
              </template>
            </svg>
            <div class="relative flex items-start" :style="{ height: `${H_NHIET}px` }">
              <div v-for="c in cot" :key="c.g.gio" :style="{ width: `${W}px` }" :class="['shrink-0 pt-1 text-center font-black text-slate-800', hep ? 'text-[11px]' : 'text-[13px]']">
                {{ Math.round(c.g.nhietDo) }}°
              </div>
            </div>
          </div>

          <!-- Gió mặt đất -->
          <WeatherHangGioMuc :cot="cot" :lay="(g) => g.gio10m" :lay-huong="(g) => g.huong" :cao="hep ? 38 : 44" :w="W" :hep="hep" :nguong="nguong" />

          <!-- Giật -->
          <div class="flex h-[20px] items-stretch">
            <div
              v-for="c in cot"
              :key="c.g.gio"
              :style="{ width: `${W}px`, ...styleGiat(c.g.giat) }"
              :class="['shrink-0 pt-0.5 text-center font-bold leading-tight', hep ? 'text-[10px]' : 'text-[11px]', c.dau ? 'border-l-2 border-slate-300' : '']"
              :title="`${nhan.giat} ${c.g.giat.toFixed(1)} m/s`"
            >
              {{ c.g.giat.toFixed(0) }}
            </div>
          </div>

          <!-- Khối chính: mây theo độ cao + cột mưa + áp suất -->
          <svg :width="rong" :height="H_KHOI" class="block">
            <defs>
              <filter id="mayMem" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <template v-for="(c, i) in cot" :key="'n' + c.g.gio">
              <rect v-if="c.dem" :x="i * W" y="0" :width="W" :height="H_KHOI" fill="#eef2ff" />
            </template>
            <line v-for="m in MOC_CAO" :key="'l' + m" x1="0" :y1="yCao(m)" :x2="rong" :y2="yCao(m)" stroke="#e2e8f0" stroke-width="1" />
            <template v-for="(c, i) in cot" :key="'t' + c.g.gio">
              <template v-if="c.dau">
                <text v-for="m in MOC_CAO" :key="m" :x="i * W + 3" :y="yCao(m) - 3" fill="#94a3b8" font-size="9">
                  {{ m / 1000 }}km {{ Math.round((m * 3.28) / 100) * 100 }}ft
                </text>
              </template>
            </template>
            <g filter="url(#mayMem)">
              <rect v-for="(o, k) in oMay" :key="k" :x="o.x" :y="o.y" :width="W / CON + 0.6" :height="o.h" fill="#475569" :opacity="Math.min(0.92, (o.pt / 100) ** 0.75)" />
            </g>
            <g v-if="altBai > 0">
              <line x1="0" :y1="yCao(altBai)" :x2="rong" :y2="yCao(altBai)" stroke="#0f766e" stroke-width="1.5" stroke-dasharray="6 3" />
              <template v-for="(c, i) in cot" :key="'b' + c.g.gio">
                <text v-if="c.dau" :x="i * W + 3" :y="yCao(altBai) - 3" fill="#0f766e" font-size="9" font-weight="bold">{{ nhan.batDau }} {{ altBai }}m</text>
              </template>
            </g>
            <!-- Cột mưa hai màu: xanh mưa thường, cam phần mưa rào/giông chồng lên -->
            <g v-for="m in cotMua" :key="'m' + m.gio">
              <rect v-if="m.thuong > 0" :x="m.x" :y="H_KHOI - m.caoThuong" :width="m.rong" :height="m.caoThuong" :fill="m.that ? '#2563eb' : '#93c5fd'" rx="2" />
              <rect v-if="m.rao > 0" :x="m.x" :y="H_KHOI - m.caoTong" :width="m.rong" :height="m.caoRao" :fill="m.that ? '#f97316' : '#fdba74'" rx="2" />
              <text v-if="m.that" :x="m.xGiua" :y="H_KHOI - m.caoTong - 3" :fill="m.rao > m.thuong ? '#c2410c' : '#1d4ed8'" font-size="10" font-weight="bold" text-anchor="middle">{{ m.tong.toFixed(1) }}mm</text>
            </g>
            <path v-if="duongAp" :d="duongAp" fill="none" stroke="#475569" stroke-width="1.4" opacity="0.85" stroke-linejoin="round" />
            <text v-for="(n, k) in nhanAp" :key="'ap' + k" :x="n.x" :y="n.y" fill="#475569" font-size="9" font-weight="bold" text-anchor="middle">{{ n.p }}hPa</text>
            <template v-for="(c, i) in cot" :key="'vv' + c.g.gio">
              <line v-if="c.dau && i > 0" :x1="i * W" y1="0" :x2="i * W" :y2="H_KHOI" stroke="#cbd5e1" stroke-width="2" />
            </template>
          </svg>

          <!-- Trần mây: ô tô màu như Windy -->
          <div class="flex h-[22px] items-center border-t border-slate-200">
            <div
              v-for="c in cot"
              :key="c.g.gio"
              :style="{ width: `${W}px`, background: mauTranMay(tranCua(c.g)) }"
              :title="c.g.mayThap !== undefined ? `${nhan.may} ${Math.round(c.g.mayThap)}%${tranCua(c.g) !== null ? ` · ${nhan.tran} ~${tranCua(c.g)}m` : ''}` : undefined"
              :class="[
                'h-full shrink-0 pt-1 text-center font-bold',
                hep ? 'text-[9px]' : 'text-[11px]',
                tranCua(c.g) !== null && (tranCua(c.g) as number) < 200 ? 'text-fuchsia-900' : tranCua(c.g) === null ? 'text-slate-400' : 'text-slate-800',
                c.dau ? 'border-l-2 border-slate-300' : ''
              ]"
            >
              {{ tranCua(c.g) === null ? '--' : tranCua(c.g) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-100 px-2 py-1 text-[10px] leading-snug text-slate-500">{{ nhan.vuot }}</div>
  </div>
</template>

<script setup lang="ts">
import {
  bieuTuongTroi, dungCot, duongCong, mauTranMay, MUA_BAY, MUA_DANG_KE, styleGiat, tranMay,
  type GioTT, type NgayTT, type NguongMau
} from '~/utils/weather'
import { useCuonTheoNgay, useManHinhHep } from '~/composables/useCuonTheoNgay'

export type NhanMeteogram = {
  gio: string; troi: string; gioMs: string; giat: string; may: string; mua: string
  tran: string; matDat: string; batDau: string; haCanh: string; amsl: string; vuot: string
}

const props = withDefaults(defineProps<{
  ngay: NgayTT[]
  nguong?: NguongMau | null
  altBai?: number
  tuGio?: number
  denGio?: number
  ngayChon?: string | null
  nhan: NhanMeteogram
}>(), { altBai: 0, tuGio: 4, denGio: 21, ngayChon: null, nguong: null })
const emit = defineEmits<{ ngayHien: [ngay: string] }>()

const W_RONG = 56
const W_HEP = 26
const GIO_HEP: [number, number] = [7, 17]
const H_KHOI = 200
const H_NHIET = 36
const CON = 4
const MOC_CAO = [1000, 2000, 3000, 4000, 5000]
const CAO_MAX = 6000

const hep = useManHinhHep()
const W = computed(() => (hep.value ? W_HEP : W_RONG))
const wNhan = computed(() => (hep.value ? 36 : 54))
const cot = computed(() =>
  dungCot(props.ngay, hep.value ? Math.max(props.tuGio, GIO_HEP[0]) : props.tuGio, hep.value ? Math.min(props.denGio, GIO_HEP[1]) : props.denGio)
)
const rong = computed(() => cot.value.length * W.value)
const xGiua = (i: number) => i * W.value + W.value / 2
const nhanTrai = computed(() => 'pt-1 font-bold text-slate-400 ' + (hep.value ? 'text-[9px] leading-tight' : 'text-[10px]'))

const ngayChonRef = computed(() => props.ngayChon)
const { khung, onScroll } = useCuonTheoNgay(ngayChonRef, (d) => emit('ngayHien', d))

/* ---- Nhiệt độ ---- */
const duongNhiet = computed(() => {
  const nhiet = cot.value.map((c) => c.g.nhietDo)
  const tMin = Math.min(...nhiet)
  const tMax = Math.max(...nhiet)
  const y = (t: number) => H_NHIET - 6 - ((t - tMin) / Math.max(1, tMax - tMin)) * (H_NHIET - 14)
  return duongCong(cot.value.map((c, i) => [xGiua(i), y(c.g.nhietDo)]))
})

/* ---- Độ cao 0 → 6km ---- */
const yCao = (m: number) => H_KHOI - (Math.min(m, CAO_MAX) / CAO_MAX) * H_KHOI

/* ---- Áp suất ---- */
const apInfo = computed(() => {
  const ap = cot.value.map((c) => c.g.apSuat).filter((x): x is number => typeof x === 'number')
  const apMin = ap.length ? Math.min(...ap) : 0
  const apMax = ap.length ? Math.max(...ap) : 1
  const yAp = (p: number) => 18 + (1 - (p - apMin) / Math.max(0.5, apMax - apMin)) * (H_KHOI * 0.36)
  const diem: Array<[number, number]> = cot.value.flatMap((c, i) => (typeof c.g.apSuat === 'number' ? [[xGiua(i), yAp(c.g.apSuat)] as [number, number]] : []))
  const nhan = cot.value
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => c.dau && typeof cot.value[Math.min(i + 2, cot.value.length - 1)]!.g.apSuat === 'number')
    .map(({ i }) => {
      const j = Math.min(i + 2, cot.value.length - 1)
      const p = cot.value[j]!.g.apSuat as number
      return { x: xGiua(j), y: yAp(p) - 5, p: Math.round(p) }
    })
  return { duong: duongCong(diem), nhan }
})
const duongAp = computed(() => apInfo.value.duong)
const nhanAp = computed(() => apInfo.value.nhan)

/* ---- Mưa ---- */
const cotMua = computed(() => {
  const muaMax = Math.max(2, ...cot.value.map((c) => c.g.mua))
  const cao = (mm: number) => (mm / muaMax) * (H_KHOI * 0.45)
  return cot.value.flatMap((c, i) => {
    const tong = c.g.mua
    if (tong < MUA_BAY) return []
    const rao = Math.min(tong, Math.max(0, c.g.muaRao ?? 0))
    const thuong = Math.max(0, tong - rao)
    return [{
      gio: c.g.gio, tong, rao, thuong, that: tong >= MUA_DANG_KE,
      x: i * W.value + W.value * 0.34, rong: W.value * 0.32, xGiua: xGiua(i),
      caoThuong: cao(thuong), caoTong: cao(tong), caoRao: cao(rao)
    }]
  })
})

/* ---- Mây trên lưới mịn ---- */
const oMay = computed(() => {
  const ra: Array<{ x: number; y: number; h: number; pt: number }> = []
  const tang: Array<{ lay: (g: GioTT) => number; y: number; h: number }> = [
    { lay: (g) => g.mayThap ?? 0, y: yCao(2000), h: H_KHOI - yCao(2000) },
    { lay: (g) => g.mayGiua ?? 0, y: yCao(6000), h: yCao(2000) - yCao(6000) },
    { lay: (g) => g.mayCao ?? 0, y: 0, h: Math.max(12, yCao(6000)) }
  ]
  const cs = cot.value
  for (let i = 0; i < cs.length; i++) {
    const a = cs[i]!.g
    const b = cs[Math.min(i + 1, cs.length - 1)]!.g
    for (const t of tang) {
      const pa = t.lay(a)
      const pb = t.lay(b)
      for (let k = 0; k < CON; k++) {
        const f = (k + 0.5) / CON
        const pt = pa + (pb - pa) * f
        if (pt > 15) ra.push({ x: i * W.value + (k * W.value) / CON, y: t.y, h: t.h, pt })
      }
    }
  }
  return ra
})

const tranCua = (g: GioTT) => tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0)
</script>
