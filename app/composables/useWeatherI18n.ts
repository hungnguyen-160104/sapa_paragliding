import { computed } from 'vue'
import { chiSoHuong, homNayVN, nhanNgay } from '~/utils/weather'

/** Tên 16 hướng gió theo ngôn ngữ trang (weather.dirs) và nhãn ngày "Hôm nay"/"T5 10/09". */
export function useWeatherI18n() {
  const { locale, t, tm, rt } = useI18n()
  const layChuoi = (x: unknown): string => (typeof x === 'string' ? x : rt(x as never))
  const dirs = computed<string[]>(() => {
    const raw = tm('weather.dirs') as unknown
    return Array.isArray(raw) ? raw.map(layChuoi) : []
  })
  const tenHuong = (deg: number) => dirs.value[chiSoHuong(deg)] ?? ''
  const homNay = ref('')
  onMounted(() => { homNay.value = homNayVN() })
  const nhanNgayHienThi = (d: string) => (d === homNay.value ? t('weather.today') : nhanNgay(d, locale.value))
  const mang = (khoa: string): string[] => {
    const raw = tm(khoa) as unknown
    return Array.isArray(raw) ? raw.map(layChuoi) : []
  }
  return { locale, t, tenHuong, homNay, nhanNgayHienThi, layChuoi, mang }
}
