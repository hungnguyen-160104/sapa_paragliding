<template>
  <!--
    BẢNG GIỜ (Basic) — nối liền cả dãy ngày, cuộn đồng bộ với dải ngày phía trên,
    y như Meteogram/Airgram. Thêm hai hàng riêng cho Sa Pa: MÙ (mù dày / mây
    trùm bãi / tầm nhìn hạn chế) và GIÓ +500m trên bãi cất (theo hướng).
  -->
  <div v-if="gio.length" ref="khung" class="mt-2 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200" @scroll="onScroll">
    <table class="border-collapse text-xs">
      <tbody>
        <tr>
          <th data-truc class="sticky left-0 z-10 bg-white px-2 py-1 text-left text-xs font-bold text-slate-400" />
          <template v-for="(c, i) in cot" :key="'ngay' + c.g.gio">
            <td v-if="c.dau" :data-ngay="c.ngay.ngay" :colspan="cot.filter((x) => x.ngay.ngay === c.ngay.ngay).length" :class="['bg-slate-50 px-2 py-1 text-left text-xs font-bold text-slate-700', i > 0 ? 'border-l-2 border-l-slate-300' : '']">
              <span class="sticky left-14 inline-flex items-center gap-1 whitespace-nowrap">
                <span class="inline-block h-1.5 w-1.5 rounded-full" :style="{ background: c.ngay.muc === 'xanh' ? '#16a34a' : c.ngay.muc === 'vang' ? '#eab308' : '#e11d48' }" aria-hidden="true" />
                {{ nhanNgayHienThi(c.ngay.ngay) }}
                <span v-if="c.ngay.matTroi" class="font-medium text-amber-700">☀ {{ c.ngay.matTroi.moc }}–{{ c.ngay.matTroi.lan }}</span>
              </span>
            </td>
          </template>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.hour') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center font-bold text-slate-800', bd(g)]">{{ g.gio.slice(11, 13) }}h</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.sky') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center text-base leading-none', bd(g)]" :title="`${Math.round(g.may)}%`">{{ bieuTuongTroi(g.may, g.mua, g.buXa) }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.wind') }} {{ t('weather.windUnit') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center font-black', bd(g)]" :style="styleGio(g.gio10m, nguong)">{{ g.gio10m.toFixed(1) }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.canFly') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center font-bold', DAC[g.muc], bd(g)]" :title="locale === 'vi' ? g.lyDo.join(' · ') : undefined">{{ BIEU_TUONG_MUC[g.muc] }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.gust') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center font-bold', bd(g)]" :style="styleGiat(g.giat)">{{ g.giat.toFixed(1) }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.direction') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center', bd(g)]" :title="tenHuong(g.huong)">
            <WeatherWindArrow :deg="g.huong" :size-class="'h-5 w-5 ' + mauMuiTen(g)" />
          </td>
        </tr>
        <!-- GIÓ +500m TRÊN BÃI CẤT — theo hướng: Tây/Đông/Bắc rất mạnh là bãi cất hỏng dù gió mặt đất nhẹ. -->
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.upper.row') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center', bd(g)]" :style="gioCao(g).v !== null ? styleGio(gioCao(g).v as number, { gioXanh: GIO_TREN_CAO_SPEEDBAR, gioDo: GIO_TREN_CAO_CAM }) : undefined" :title="gioCao(g).huong !== null ? tenHuong(gioCao(g).huong as number) : undefined">
            <template v-if="gioCao(g).v !== null">
              <WeatherWindArrow v-if="gioCao(g).huong !== null" :deg="gioCao(g).huong as number" :size-class="'h-3.5 w-3.5 ' + (gioCao(g).muc === 'do' ? 'text-rose-900' : '')" />
              <div class="font-bold leading-none">{{ (gioCao(g).v as number).toFixed(0) }}</div>
            </template>
            <template v-else>–</template>
          </td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.rain') }} mm</th>
          <td v-for="g in gio" :key="g.gio" :class="['relative px-1 py-1 text-center', g.mua >= MUA_DANG_KE ? 'font-bold text-blue-900' : 'text-slate-400', bd(g)]">
            <span v-if="g.mua >= MUA_BAY" aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" :style="{ height: daiMuaCao(g.mua) }">
              <span class="absolute inset-0" :style="{ background: g.mua >= MUA_DANG_KE ? '#60a5fa' : '#bfdbfe' }" />
              <span v-if="(g.muaRao ?? 0) > 0" class="absolute inset-x-0 top-0" :style="{ height: `${(Math.min(g.mua, g.muaRao ?? 0) / g.mua) * 100}%`, background: g.mua >= MUA_DANG_KE ? '#fb923c' : '#fed7aa' }" />
            </span>
            <span class="relative">{{ g.mua >= MUA_BAY ? g.mua.toFixed(1) : '–' }}</span>
          </td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">⚡ {{ t('weather.storm') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center', chiSoBay(g).xacSuatDong >= 40 ? 'bg-rose-200 font-bold text-rose-900' : chiSoBay(g).xacSuatDong >= 20 ? 'bg-amber-100 font-bold text-amber-900' : 'text-slate-400', bd(g)]">
            {{ chiSoBay(g).xacSuatDong > 0 ? `${chiSoBay(g).xacSuatDong}%` : '–' }}
          </td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.cloudBase') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center', tranCua(g) !== null && (tranCua(g) as number) < 400 && (g.mayThap ?? 0) >= 70 ? 'bg-slate-300 font-bold text-slate-900' : 'text-slate-500', bd(g)]">
            {{ tranCua(g) === null ? '–' : (tranCua(g) as number) >= 1000 ? `${((tranCua(g) as number) / 1000).toFixed(1)}km` : `${tranCua(g)}m` }}
          </td>
        </tr>
        <!-- MÙ — riêng Sa Pa: mù dày / mây trùm bãi / tầm nhìn hạn chế -->
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.fog.row') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center text-[10px] font-bold leading-none', bd(g)]" :style="styleMu(doDacMu(g))" :title="tipMu(g)">{{ Math.round(doDacMu(g) * 100) }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.thermal') }}</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center', chiSoBay(g).thermal === 'gat' ? 'font-bold text-orange-700' : 'text-slate-500', bd(g)]">{{ t('weather.thermalLevels.' + chiSoBay(g).thermal) }}</td>
        </tr>
        <tr>
          <th class="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold text-slate-500">{{ t('weather.temp') }} °C</th>
          <td v-for="g in gio" :key="g.gio" :class="['px-1 py-1 text-center text-slate-700', bd(g)]">{{ Math.round(g.nhietDo) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  BIEU_TUONG_MUC, bieuTuongTroi, chiSoBay, dungCot, GIO_TREN_CAO_CAM, GIO_TREN_CAO_SPEEDBAR, gioTrenBai, HUONG_TREN_CAO_XAU, huongTam, huongTheNao,
  MUA_BAY, MUA_DANG_KE, doDacMu, mucMu, styleGiat, styleGio, styleMu, tranMay,
  type GioTT, type LuatHuong, type MucDo, type NgayTT, type NguongMau
} from '~/utils/weather'
import { useCuonTheoNgay, useManHinhHep } from '~/composables/useCuonTheoNgay'
import { useWeatherI18n } from '~/composables/useWeatherI18n'

const props = withDefaults(defineProps<{
  ngay: NgayTT[]
  ngayChon?: string | null
  luat?: LuatHuong
  nguong?: NguongMau | null
  alt?: number
}>(), { ngayChon: null, nguong: null, alt: 0 })
const emit = defineEmits<{ ngayHien: [ngay: string] }>()
const { t, locale, tenHuong, nhanNgayHienThi } = useWeatherI18n()

const hep = useManHinhHep()
/** Điện thoại chỉ bày 7h–17h: cả dải 6–18 thì một ngày dài quá hai màn. */
const cot = computed(() => dungCot(props.ngay, hep.value ? 7 : 6, hep.value ? 17 : 18))
const gio = computed(() => cot.value.map((c) => c.g))
const dauNgay = computed(() => new Set(cot.value.filter((c) => c.dau).map((c) => c.g.gio)))
const bd = (g: GioTT) => (dauNgay.value.has(g.gio) ? 'border-l-2 border-l-slate-300' : '')
const ngayChonRef = computed(() => props.ngayChon)
const { khung, onScroll } = useCuonTheoNgay(ngayChonRef, (d) => emit('ngayHien', d))

const DAC: Record<MucDo, string> = { xanh: 'bg-emerald-500 text-white', vang: 'bg-amber-400 text-amber-950', do: 'bg-rose-500 text-white' }

const mauMuiTen = (g: GioTT) => {
  const the = huongTheNao(g.huong, g.gio10m, props.luat)
  if (the === 'tot') return 'text-emerald-600'
  if (the === 'xau') return 'text-rose-600'
  return g.muc === 'do' ? 'text-rose-600' : g.muc === 'vang' ? 'text-amber-500' : 'text-emerald-600'
}
const tranCua = (g: GioTT) => tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0)
const tipMu = (g: GioTT) => {
  const chenh = g.diemSuong === undefined ? null : (g.nhietDo - g.diemSuong).toFixed(1)
  return `${t('weather.fog.levels.' + mucMu(g))} · ${Math.round(doDacMu(g) * 100)}%${chenh !== null ? ` · Δ ${chenh}°C` : ''}${g.am !== undefined ? ` · ${Math.round(g.am)}%` : ''}${g.mayThap !== undefined ? ` · ${t('weather.cloud')} ${Math.round(g.mayThap)}%` : ''}`
}
const gioCao = (g: GioTT) => {
  const v = props.alt ? gioTrenBai(g, 500, props.alt) : null
  const huong = typeof g.huong700 === 'number' ? g.huong700 : typeof g.huong850 === 'number' ? g.huong850 : null
  let muc: MucDo = 'xanh'
  if (v !== null) {
    if (v > GIO_TREN_CAO_CAM && huong !== null && HUONG_TREN_CAO_XAU.includes(huongTam(huong))) muc = 'do'
    else if (v >= GIO_TREN_CAO_SPEEDBAR) muc = 'vang'
  }
  return { v, huong, muc }
}
/** Dải nước trong ô mưa: dâng theo căn bậc hai, thang 2–10mm theo giờ mưa to nhất đang bày. */
const daiMuaCao = (mm: number) => {
  const max = gio.value.reduce((tt, g) => Math.max(tt, g.mua || 0), 0)
  const thang = Math.min(10, Math.max(2, max))
  const pt = Math.max(20, Math.min(100, Math.sqrt(mm / thang) * 100))
  return `${(pt / 100) * 18}px`
}
</script>
