<template>
  <!--
    SO SÁNH 2–3 MÔ HÌNH cạnh nhau (chuyển từ mebayluon SoSanhMoHinh.tsx). Chỗ
    các mô hình KHÔNG đồng ý với nhau chính là chỗ dự báo còn mong manh — hàng
    "Đồng thuận" ở cuối nói đúng điều đó cho từng giờ.
  -->
  <div class="mt-2 rounded-lg border border-violet-200 bg-violet-50/50 p-2">
    <div class="flex flex-wrap items-center gap-1 text-[11px]">
      <span class="font-bold text-violet-900">{{ t('weather.compare.title') }}</span>
      <button v-for="m in MO_HINH" :key="m.ma" type="button" :title="m.mo" @click="doiChon(m.ma)"
        :class="['rounded-lg border px-2 py-0.5 font-bold', chon.includes(m.ma) ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-slate-600']">
        {{ m.ten }}
      </button>
      <span v-if="dangTai" class="text-slate-500">{{ t('weather.compare.loading') }}</span>
    </div>

    <!-- 10 ngày × mô hình -->
    <div v-if="ds.length" class="mt-2 overflow-x-auto overscroll-x-contain">
      <table class="border-separate border-spacing-0.5 text-center text-[10px]">
        <thead>
          <tr>
            <th class="pr-1 text-left font-bold text-slate-500">{{ t('weather.compare.day') }}</th>
            <th v-for="n in ds[0]!.ngay" :key="n.ngay" class="font-bold text-slate-700">
              <button type="button" @click="emit('chonNgay', n.ngay)" :class="['rounded px-1', n.ngay === ngayChon ? 'bg-blue-600 text-white' : 'hover:bg-slate-200']">
                {{ n.ngay === homNay ? t('weather.compare.today') : n.ngay.slice(8, 10) + '/' + n.ngay.slice(5, 7) }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in ds" :key="m.ma">
            <th class="pr-1 text-left font-bold text-slate-700" :title="m.nhan">{{ m.ten }}</th>
            <td v-for="n0 in ds[0]!.ngay" :key="n0.ngay" :class="['rounded px-1 py-0.5 font-bold', ngayCua(m, n0.ngay) ? MAU_NGAY[ngayCua(m, n0.ngay)!.muc] : 'bg-slate-100 text-slate-400']" :title="tipNgay(ngayCua(m, n0.ngay))">
              {{ ngayCua(m, n0.ngay) ? ngayCua(m, n0.ngay)!.gioMax.toFixed(1) : '–' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bảng giờ ngày đang chọn: so ngang mọi yếu tố -->
    <div v-if="ngayChon && gioBang.length" class="mt-2 overflow-x-auto overscroll-x-contain">
      <table class="w-full min-w-[560px] border-separate border-spacing-0.5 text-center text-[10px]">
        <thead>
          <tr>
            <th class="sticky left-0 z-10 bg-violet-50 pr-1 text-left font-bold text-slate-500">{{ ngayChon.slice(8, 10) }}/{{ ngayChon.slice(5, 7) }}</th>
            <th v-for="g in gioBang" :key="g.gio" class="font-bold text-slate-700">{{ g.gio.slice(11, 13) }}h</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="yt in yeuTo" :key="yt.ma">
            <tr>
              <th :colspan="gioBang.length + 1" class="sticky left-0 bg-violet-100/60 px-1 py-0.5 text-left text-[10px] font-black text-violet-900">{{ yt.ten }}</th>
            </tr>
            <tr v-for="m in ds" :key="`${yt.ma}:${m.ma}`">
              <th class="sticky left-0 z-10 bg-violet-50 pr-1 text-left font-semibold text-slate-600" :title="m.nhan">{{ m.ten }}</th>
              <td v-for="g0 in gioBang" :key="g0.gio" :class="['rounded px-0.5 py-0.5', oCua(m, g0.gio) ? yt.ve(oCua(m, g0.gio)!).cls : 'bg-slate-100 text-slate-400']" :title="oCua(m, g0.gio) ? yt.ve(oCua(m, g0.gio)!).title : undefined">
                <template v-if="oCua(m, g0.gio)">
                  <WeatherWindArrow v-if="yt.ve(oCua(m, g0.gio)!).arrow !== undefined" :deg="yt.ve(oCua(m, g0.gio)!).arrow as number" size-class="h-4 w-4 text-slate-700" />
                  <span v-else :class="yt.ve(oCua(m, g0.gio)!).bold ? 'font-black' : ''">{{ yt.ve(oCua(m, g0.gio)!).text }}</span>
                </template>
                <template v-else>–</template>
              </td>
            </tr>
          </template>
          <tr>
            <th class="sticky left-0 z-10 bg-violet-50 pr-1 text-left font-black text-violet-900">{{ t('weather.compare.consensus') }}</th>
            <td v-for="g in gioBang" :key="g.gio" :class="['rounded px-0.5 py-0.5 font-black', dongThuan(g.gio) === 'lech' ? 'bg-violet-200 text-violet-900' : MAU_O[dongThuan(g.gio) as MucDo]]" :title="dongThuan(g.gio) === 'lech' ? t('weather.compare.disagreeTip') : t('weather.compare.agreeTip')">
              {{ dongThuan(g.gio) === 'lech' ? '?' : BIEU_TUONG_MUC[dongThuan(g.gio) as MucDo] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-1 text-[11px] font-semibold text-violet-950">{{ ketLuan }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BIEU_TUONG_MUC, bieuTuongTroi, chiSoBay, GIAT_CANH_BAO, MO_HINH, MO_HINH_MAC_DINH, MUA_BAY, MUA_DANG_KE, sucGio, tranMay,
  type DuBaoSapa, type GioTT, type MucDo, type NgayTT, type SucGio
} from '~/utils/weather'
import { useWeatherI18n } from '~/composables/useWeatherI18n'

const props = defineProps<{ ngayChon: string | null; homNay: string }>()
const emit = defineEmits<{ chonNgay: [ngay: string] }>()
const { t, tenHuong } = useWeatherI18n()

type KetQua = { ma: string; ten: string; nhan: string; ngay: NgayTT[] }
const chon = ref<string[]>([MO_HINH_MAC_DINH, 'gfs', 'icon'])
const ket = ref<Record<string, KetQua | 'loi'>>({})
const dangTai = ref(false)

watch(chon, async (ds) => {
  const thieu = ds.filter((ma) => !ket.value[ma])
  if (!thieu.length) return
  dangTai.value = true
  await Promise.all(thieu.map(async (ma) => {
    try {
      const r = await $fetch<DuBaoSapa>('/api/weather', { query: { model: ma } })
      const mh = MO_HINH.find((x) => x.ma === ma)
      ket.value = { ...ket.value, [ma]: { ma, ten: mh?.ten ?? ma, nhan: r.moHinh, ngay: r.ngay } }
    } catch {
      ket.value = { ...ket.value, [ma]: 'loi' }
    }
  }))
  dangTai.value = false
}, { immediate: true, deep: true })

const ds = computed(() => chon.value.map((ma) => ket.value[ma]).filter((x): x is KetQua => Boolean(x) && x !== 'loi'))
const gioBang = computed(() => {
  if (!props.ngayChon || !ds.value.length) return []
  return ds.value[0]!.ngay.find((n) => n.ngay === props.ngayChon)?.gio.filter((g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= 6 && h <= 18
  }) ?? []
})
const ngayCua = (m: KetQua, ngay: string) => m.ngay.find((n) => n.ngay === ngay)
const oCua = (m: KetQua, gio: string) => m.ngay.find((n) => n.ngay === gio.slice(0, 10))?.gio.find((g) => g.gio === gio)
const dongThuan = (gio: string): MucDo | 'lech' => {
  const muc = ds.value.map((m) => oCua(m, gio)?.muc).filter(Boolean) as MucDo[]
  if (!muc.length) return 'lech'
  return muc.every((x) => x === muc[0]) ? muc[0]! : 'lech'
}
const doiChon = (ma: string) => {
  const c = chon.value
  chon.value = c.includes(ma) ? (c.length > 1 ? c.filter((x) => x !== ma) : c) : c.length >= 3 ? [...c.slice(1), ma] : [...c, ma]
}

const MAU_O: Record<MucDo, string> = { xanh: 'bg-emerald-400 text-emerald-950', vang: 'bg-amber-300 text-amber-950', do: 'bg-rose-400 text-white' }
const MAU_NGAY: Record<MucDo, string> = { xanh: 'bg-emerald-100 text-emerald-900', vang: 'bg-amber-100 text-amber-900', do: 'bg-rose-100 text-rose-900' }
const MAU_GIO: Record<SucGio, string> = {
  nhe: 'bg-emerald-200 text-emerald-900', vua: 'bg-emerald-500 text-white', hoiManh: 'bg-amber-300 text-amber-950', manh: 'bg-orange-400 text-white', ratManh: 'bg-rose-500 text-white'
}
const tipNgay = (n?: NgayTT) =>
  n ? `${t('weather.wind')} ${n.gioMax.toFixed(1)} · ${t('weather.gust')} ${n.giatMax.toFixed(1)} m/s · ${n.gioMua > 0 ? `${t('weather.rain')} ~${n.gioMua}h (${n.khungMua}) ${n.muaTong.toFixed(1)}mm` : t('weather.noRain')}${n.khungDep ? ` · ${t('weather.bestWindow')} ${n.khungDep}` : ''}` : undefined

type OSo = { text?: string; bold?: boolean; arrow?: number; cls: string; title?: string }
const yeuTo = computed<Array<{ ma: string; ten: string; ve: (g: GioTT) => OSo }>>(() => [
  { ma: 'troi', ten: `☀️ ${t('weather.sky')}`, ve: (g) => ({ text: bieuTuongTroi(g.may, g.mua, g.buXa), cls: 'bg-white', title: `${Math.round(g.may)}%` }) },
  { ma: 'gio', ten: `🌬 ${t('weather.wind')} (m/s)`, ve: (g) => ({ text: g.gio10m.toFixed(1), bold: true, cls: 'rounded ' + MAU_GIO[sucGio(g.gio10m)] }) },
  { ma: 'giat', ten: `💨 ${t('weather.gust')} (m/s)`, ve: (g) => ({ text: g.giat.toFixed(1), cls: g.giat > 18 ? 'bg-rose-200 font-bold text-rose-900' : g.giat > GIAT_CANH_BAO ? 'bg-orange-100 font-bold text-orange-800' : 'bg-white text-slate-600' }) },
  { ma: 'huong', ten: `🧭 ${t('weather.direction')}`, ve: (g) => ({ arrow: g.huong, cls: 'bg-white', title: `${tenHuong(g.huong)} (${Math.round(g.huong)}°)` }) },
  { ma: 'mua', ten: `🌧 ${t('weather.rain')} (mm)`, ve: (g) => ({ text: g.mua >= 0.05 ? g.mua.toFixed(1) : '–', cls: g.mua >= MUA_DANG_KE ? 'bg-blue-200 font-bold text-blue-900' : g.mua >= MUA_BAY ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-300' }) },
  { ma: 'tranMay', ten: `🌫 ${t('weather.cloudBase')} (m)`, ve: (g) => {
    const cm = tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0)
    const mu = cm !== null && cm < 400 && (g.mayThap ?? 0) >= 70
    return { text: cm === null ? '–' : cm >= 1000 ? `${(cm / 1000).toFixed(1)}k` : String(cm), cls: mu ? 'bg-slate-300 font-bold text-slate-900' : 'bg-white text-slate-600', title: g.mayThap !== undefined ? `${t('weather.cloud')} ${Math.round(g.mayThap)}%` : undefined }
  } },
  { ma: 'dong', ten: `⚡ ${t('weather.storm')} (%)`, ve: (g) => {
    const d = chiSoBay(g).xacSuatDong
    return { text: d > 0 ? String(d) : '–', cls: d >= 40 ? 'bg-rose-200 font-bold text-rose-900' : d >= 20 ? 'bg-amber-100 font-bold text-amber-900' : 'bg-white text-slate-300' }
  } }
])

const ketLuan = computed(() => {
  const n = ds.value.length
  const h = gioBang.value.length
  const lech = gioBang.value.filter((g) => dongThuan(g.gio) === 'lech').map((g) => g.gio.slice(11, 13) + 'h')
  const k = lech.length
  if (n < 2) return t('weather.compare.chooseMore')
  if (k === 0) return t('weather.compare.allAgree', { n, h })
  if (k <= 3) return t('weather.compare.fewDiffer', { n, k, gio: lech.join(', ') })
  return t('weather.compare.manyDiffer', { n, k, h, gio: lech.slice(0, 5).join(', ') + (lech.length > 5 ? '…' : '') })
})
</script>
