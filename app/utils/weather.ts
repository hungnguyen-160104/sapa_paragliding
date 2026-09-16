/**
 * TIỆN ÍCH ĐỌC DỰ BÁO THỜI TIẾT BAY — chuyển từ bộ mã của mebayluon.com
 * (lib/baobay/thoi-tiet.ts, components/weather/mau-gio.ts) sang cho web Sapa.
 * Các ngưỡng, thang màu và công thức giữ NGUYÊN để hai trang hiện cùng một số.
 */

export type MucDo = 'xanh' | 'vang' | 'do'
export type SucThermal = 'khong' | 'nhe' | 'vua' | 'manh' | 'gat'

export type GioTT = {
  gio: string
  gio10m: number
  giat: number
  huong: number
  mua: number
  muaRao?: number
  may: number
  nhietDo: number
  diemSuong?: number
  mayThap?: number
  am?: number
  cape?: number
  chiSoNang?: number
  tranThermal?: number
  xacSuatMua?: number
  buXa?: number
  chenhDoCao?: number
  apSuat?: number
  giayNang?: number
  gio925?: number
  gio850?: number
  gio700?: number
  huong925?: number
  huong850?: number
  huong700?: number
  h925?: number
  h850?: number
  t925?: number
  t850?: number
  t700?: number
  /** Mây tầng giữa / tầng cao (%) — cho khối mây theo độ cao của meteogram. */
  mayGiua?: number
  mayCao?: number
  muc: MucDo
  lyDo: string[]
}

export type NhanDinhNgay = {
  muc: 'tot' | 'kha' | 'hanChe' | 'nghi'
  kieuNgay: string
  tomTat: string
  diem: Array<{ icon: string; ten: string; noiDung: string; ngan?: string; tong: 'tot' | 'chuY' | 'xau' | 'thongTin' }>
  khuyenCao: string[]
}

export type NgayTT = {
  ngay: string
  muc: MucDo
  mucMay?: MucDo
  gioXanh: number
  gioVang: number
  gioDo: number
  khungDep: string | null
  gioMax: number
  giatMax: number
  muaTong: number
  nhietMin: number
  nhietMax: number
  xacSuatMuaMax: number
  gioMua: number
  muaTongThat: number
  khungMua: string | null
  gioMuaBay: number
  khungMuaBay: string | null
  matTroi?: { moc: string; lan: string }
  xacSuatDongMax: number
  tranMax: number | null
  gio: GioTT[]
  nhanDinh?: NhanDinhNgay
  chuyenGia?: { diem: number; xepLoai: string; khungTotNhat: string | null; gioBayDuoc: number; doTinCay: number; lyDoTinCay: string[] }
  thermal?: { diem: number; muc: SucThermal; khung: string | null; gioDung: number; lyDo: string[]; canhBao: string[] }
  chuyenGiaNguoi?: { ket?: 'tot' | 'han-che' | 'nghi'; khung?: string; ghiChu?: string; boi?: string; luc?: string }
  ngayGiong?: Array<{ ngay: string; ket: 'tot' | 'han-che' | 'nghi'; ghiChu?: string; gioMax: number; giatMax: number }>
}

export type LuatHuong = {
  tot?: [number, number]
  xau?: [number, number]
  xiet?: number[]
  capToc?: Array<{ tam: number[]; max: number; ten: string }>
}

export type DuBaoSapa = {
  slug: string
  ten: string
  tinh: string
  toaDo: { lat: number; lon: number; ten: string; alt?: number; altHa?: number; altCat2?: number; luatHuong?: LuatHuong }
  nguong: { gioXanh: number; gioDo: number; giatDo: number; muaDo: number; tranMayDo: number }
  ngay: NgayTT[]
  moHinh: string
  layLuc: string
}

/** Mưa bay (0,4 – dưới 0,8 mm/giờ) chỉ ghi chú; từ 0,8 là mưa thật. */
export const MUA_BAY = 0.4
export const MUA_DANG_KE = 0.8

export const BIEU_TUONG_MUC: Record<MucDo, string> = { xanh: '😊', vang: '😐', do: '😞' }

/* ------------------------------------------------------------------ */
/* Màu gió chuyển dần: xanh → vàng → cam → đỏ (thang của chủ điểm bay)  */
/* ------------------------------------------------------------------ */

type Moc = Array<[number, string]>

/** Ngưỡng gió của điểm: đẹp ≤ gioXanh · cấm > gioDo (m/s) — cùng số với NguongBay. */
export type NguongMau = { gioXanh: number; gioDo: number }
const NGUONG_MAU_MAC_DINH: NguongMau = { gioXanh: 4, gioDo: 7 }

/**
 * Gió trung bình 10m — BA BẬC THEO NGƯỠNG CỦA ĐIỂM (mebayluon 16/09): XANH =
 * nhẹ & vừa (≤ gioXanh) · VÀNG = hơi mạnh (gioXanh → gioDo) · ĐỎ = rất mạnh
 * (> gioDo). Trong một bậc vẫn đậm dần theo tốc độ nhưng không ngả sang màu
 * bậc kế, nên nhìn ô nào cũng đúng thước với màu chấm giờ.
 */
function mocGio(n: NguongMau): Moc {
  const x = Math.max(0.5, n.gioXanh)
  const d = Math.max(x + 0.5, n.gioDo)
  return [
    [0, '#d1fae5'], [x, '#4ade80'], [x + 0.001, '#fde047'], [d, '#f59e0b'], [d + 0.001, '#ef4444'], [d + 5, '#7f1d1d']
  ]
}
const MOC_GIAT: Moc = [
  [0, '#d1fae5'], [6, '#86efac'], [8, '#4ade80'], [10, '#fde047'], [12, '#fbbf24'],
  [14, '#f87171'], [16, '#ef4444'], [18, '#b91c1c'], [22, '#7f1d1d']
]

function hexSangRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbSangHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')
}
function troiMau(v: number, moc: Moc): string {
  if (!Number.isFinite(v) || v <= moc[0]![0]) return moc[0]![1]
  for (let i = 1; i < moc.length; i++) {
    if (v <= moc[i]![0]) {
      const [x0, c0] = moc[i - 1]!
      const [x1, c1] = moc[i]!
      const f = (v - x0) / (x1 - x0)
      const a = hexSangRgb(c0)
      const b = hexSangRgb(c1)
      return rgbSangHex(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f)
    }
  }
  return moc[moc.length - 1]![1]
}
export function chuTrenNen(hex: string): string {
  const [r, g, b] = hexSangRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#0f172a' : '#ffffff'
}
export function mauGio(v: number, nguong?: NguongMau | null): string {
  return troiMau(v, mocGio(nguong ?? NGUONG_MAU_MAC_DINH))
}
export function mauGiat(v: number): string {
  return troiMau(v, MOC_GIAT)
}
export function styleGio(v: number, nguong?: NguongMau | null): { background: string; color: string } {
  const bg = mauGio(v, nguong)
  return { background: bg, color: chuTrenNen(bg) }
}
export function styleGiat(v: number): { background: string; color: string } {
  const bg = mauGiat(v)
  return { background: bg, color: chuTrenNen(bg) }
}

/** Sức gió năm bậc (thang chủ) — dùng cho bảng so sánh mô hình. */
export type SucGio = 'nhe' | 'vua' | 'hoiManh' | 'manh' | 'ratManh'
export function sucGio(v: number): SucGio {
  if (v < 2) return 'nhe'
  if (v < 4) return 'vua'
  if (v < 6) return 'hoiManh'
  if (v < 8) return 'manh'
  return 'ratManh'
}
/** Giật trên mức này là "gust mạnh" (cảnh báo). */
export const GIAT_CANH_BAO = 16

/**
 * MÀU HÀNG TRẦN MÂY như Windy: cao thì xanh lá, thấp dần chuyển xanh nước,
 * tím, rồi hồng khi mây sát bãi/mù. Không có mây thấp thì xám nhạt.
 */
export function mauTranMay(cm: number | null): string {
  if (cm === null) return '#f1f5f9'
  if (cm >= 1500) return '#bbf7d0'
  if (cm >= 1000) return '#d9f99d'
  if (cm >= 500) return '#bae6fd'
  if (cm >= 200) return '#c7d2fe'
  return '#f5d0fe'
}

/* ------------------------------------------------------------------ */
/* Hướng gió                                                           */
/* ------------------------------------------------------------------ */

export function trongCung(huong: number, cung: [number, number]): boolean {
  const [tu, den] = cung
  const h = ((huong % 360) + 360) % 360
  return tu <= den ? h >= tu && h <= den : h >= tu || h <= den
}
export function lechGoc(a: number, b: number): number {
  return ((((a - b) % 360) + 540) % 360) - 180
}
export function huongTheNao(huong: number, gio: number, luat?: LuatHuong): 'tot' | 'xau' | 'thuong' {
  if (!luat) return 'thuong'
  if (luat.xau && trongCung(huong, luat.xau)) return 'xau'
  if (luat.capToc?.some((c) => gio > c.max && c.tam.some((h) => Math.abs(lechGoc(huong, h)) <= 22.5))) return 'xau'
  if (gio > 6 && luat.xiet?.some((h) => Math.abs(lechGoc(huong, h)) <= 22.5)) return 'xau'
  if (luat.tot && trongCung(huong, luat.tot)) return 'tot'
  return 'thuong'
}
/** 135° → chỉ số 6 (ĐN) trong bảng 16 hướng. */
export function chiSoHuong(do_: number): number {
  const h = ((do_ % 360) + 360) % 360
  return Math.round(h / 22.5) % 16
}
/** Hướng gió trội của dãy giờ — trung bình véc-tơ có trọng số theo tốc độ. */
export function huongTroiNgay(gio: GioTT[], khung?: [number, number]): number | null {
  let x = 0
  let y = 0
  for (const g of gio) {
    if (!Number.isFinite(g.huong) || !(g.gio10m > 0.3)) continue
    if (khung) {
      const h = Number(g.gio.slice(11, 13))
      if (h < khung[0] || h > khung[1]) continue
    }
    const r = (g.huong * Math.PI) / 180
    x += Math.sin(r) * g.gio10m
    y += Math.cos(r) * g.gio10m
  }
  if (x === 0 && y === 0) return null
  const d = (Math.atan2(x, y) * 180) / Math.PI
  return ((d % 360) + 360) % 360
}

/* ------------------------------------------------------------------ */
/* Trời, mây, thermal, dông                                            */
/* ------------------------------------------------------------------ */

export function bieuTuongTroi(may: number, mua = 0, buXa?: number): string {
  if (mua >= MUA_DANG_KE) return '🌧'
  if (mua >= MUA_BAY) return '🌦'
  if (buXa !== undefined && buXa < 30) return may > 70 ? '☁️' : '🌥'
  if (may < 30) return '☀️'
  if (may < 70) return '⛅'
  return '☁️'
}

/** Trần mây ước tính (m trên bãi) — chỉ khi thật sự có mây thấp (≥ 25%). */
export function tranMay(nhietDo: number, diemSuong?: number, mayThap?: number, chenhDoCao = 0): number | null {
  if (diemSuong === undefined || !Number.isFinite(diemSuong)) return null
  if (mayThap !== undefined && Number.isFinite(mayThap) && mayThap < 25) return null
  return Math.max(0, Math.round((nhietDo - diemSuong) * 125 + chenhDoCao))
}

export function chiSoBay(g: GioTT): { thermal: SucThermal; xacSuatDong: number } {
  const cape = g.cape ?? 0
  const li = g.chiSoNang
  const tran = Number.isFinite(g.tranThermal as number) ? Math.round(g.tranThermal as number) : null
  const buXa = g.buXa ?? 0
  let thermal: SucThermal
  if (tran !== null) {
    thermal = tran < 300 ? 'khong' : tran < 800 ? 'nhe' : tran < 1500 ? 'vua' : tran < 2200 ? 'manh' : 'gat'
  } else {
    thermal = cape < 100 ? 'khong' : cape < 400 ? 'nhe' : cape < 1000 ? 'vua' : cape < 2000 ? 'manh' : 'gat'
  }
  if (buXa < 50 && thermal !== 'khong') thermal = 'khong'
  let xacSuatDong = 0
  if (cape > 0) {
    const nhienLieu = Math.min(1, cape / 2500)
    const moi = li === undefined || !Number.isFinite(li) ? 0.35 : Math.min(1, Math.max(0, -li / 6))
    xacSuatDong = Math.round(nhienLieu * (0.3 + 0.7 * moi) * 100)
  }
  return { thermal, xacSuatDong }
}

/** Gió ở một độ cao tính từ bãi (m), nội suy giữa các mực mô hình. */
export function gioTrenBai(g: GioTT, mTrenBai: number, alt: number): number | null {
  const co = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const moc: Array<{ h: number; v: number }> = [{ h: alt, v: g.gio10m }]
  if (co(g.h925) && co(g.gio925) && g.h925 > alt + 50) moc.push({ h: g.h925, v: g.gio925 })
  if (co(g.h850) && co(g.gio850) && g.h850 > alt + 50) moc.push({ h: g.h850, v: g.gio850 })
  if (co(g.gio700)) moc.push({ h: 3000, v: g.gio700 })
  if (moc.length < 2) return null
  moc.sort((a, b) => a.h - b.h)
  const muc = alt + mTrenBai
  if (muc >= moc[moc.length - 1]!.h) return moc[moc.length - 1]!.v
  for (let i = 1; i < moc.length; i++) {
    if (muc <= moc[i]!.h) {
      const a = moc[i - 1]!
      const b = moc[i]!
      return a.v + ((b.v - a.v) * (muc - a.h)) / (b.h - a.h)
    }
  }
  return moc[0]!.v
}

/** Hoàng hôn đẹp: 40 phút cuối trước lúc lặn còn nắng, ít mây, không mưa. */
export function hoangHonDep(ngay: NgayTT): boolean {
  const lan = ngay.matTroi?.lan
  if (!lan || !/^\d{2}:\d{2}$/.test(lan)) return false
  const gioLan = Number(lan.slice(0, 2)) + Number(lan.slice(3, 5)) / 60
  const tu = Math.floor(gioLan - 40 / 60)
  const cuoi = ngay.gio.filter((g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= tu && h <= Math.floor(gioLan)
  })
  if (!cuoi.length) return false
  if (cuoi.some((g) => g.mua >= MUA_BAY)) return false
  if (cuoi.some((g) => g.may > 60)) return false
  return cuoi.some((g) => (g.giayNang ?? 0) > 600 || (g.buXa ?? 0) > 30)
}

/** Số giờ có nắng trong khung 6–18h. */
export function gioNangCuaNgay(ngay: NgayTT): number {
  const giay = ngay.gio.reduce((t, g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= 6 && h <= 18 ? t + (g.giayNang ?? 0) : t
  }, 0)
  return Math.round((giay / 3600) * 10) / 10
}

/* ------------------------------------------------------------------ */
/* Ngày giờ                                                            */
/* ------------------------------------------------------------------ */

export function homNayVN(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

const MA_NGON_NGU: Record<string, string> = {
  vi: 'vi-VN', en: 'en-GB', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', hi: 'hi-IN'
}

/** "2026-09-10" → "T5 10/09" theo ngôn ngữ đang xem. */
export function nhanNgay(d: string, lang: string): string {
  const ngay = new Date(`${d}T12:00:00+07:00`)
  return ngay.toLocaleDateString(MA_NGON_NGU[lang] ?? 'en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh'
  })
}

/* ------------------------------------------------------------------ */
/* Windy                                                               */
/* ------------------------------------------------------------------ */

export const WINDY_MODELS = [
  { id: 'ecmwf', ten: 'ECMWF' },
  { id: 'gfs', ten: 'GFS' },
  { id: 'icon', ten: 'ICON' },
  { id: 'ecmwfAifs', ten: 'ECMWF AI' }
] as const

/** Mã lớp là mã thật của Windy (đã dò trên embed2.html) — đừng đoán tên. */
export const WINDY_LAYERS = ['wind', 'gust', 'clouds', 'lclouds', 'cbase', 'fog', 'visibility', 'rain', 'rh'] as const

export function windyEmbedUrl(lat: number, lon: number, product = 'ecmwf', overlay = 'wind'): string {
  const q = new URLSearchParams({
    lat: String(lat), lon: String(lon), detailLat: String(lat), detailLon: String(lon),
    zoom: '10', level: 'surface', overlay, product, menu: '', message: 'true', marker: 'true',
    calendar: 'now', pressure: '', type: 'map', location: 'coordinates', detail: 'true',
    metricWind: 'm/s', metricTemp: '°C', radarRange: '-1'
  })
  return `https://embed.windy.com/embed2.html?${q}`
}
export function windyPageUrl(lat: number, lon: number, kieu: 'meteogram' | 'airgram'): string {
  return `https://www.windy.com/${lat.toFixed(3)}/${lon.toFixed(3)}/${kieu}?${lat.toFixed(3)},${lon.toFixed(3)},11`
}

/* ------------------------------------------------------------------ */
/* Mô hình dự báo (qua Open-Meteo, cùng danh sách với mebayluon)      */
/* ------------------------------------------------------------------ */

export type MoHinh = { ma: string; ten: string; mo: string }
export const MO_HINH: MoHinh[] = [
  { ma: 'ecmwf', ten: 'ECMWF', mo: 'Châu Âu · lưới 25km · thường sát nhất ở núi' },
  { ma: 'gfs', ten: 'GFS', mo: 'Mỹ (NOAA) · 13km · cập nhật 4 lần/ngày · có đủ chỉ số ổn định' },
  { ma: 'icon', ten: 'ICON', mo: 'Đức (DWD) · 13km' },
  { ma: 'ukmo', ten: 'UKMO', mo: 'Anh (Met Office) · 10km' },
  { ma: 'gem', ten: 'GEM', mo: 'Canada · 15km' }
]
export const MO_HINH_MAC_DINH = 'ecmwf'
export function laMaMoHinh(ma: unknown): ma is string {
  return typeof ma === 'string' && MO_HINH.some((m) => m.ma === ma)
}

/* ------------------------------------------------------------------ */
/* Dải cột giờ nối liền nhiều ngày — dùng chung cho bảng và biểu đồ   */
/* ------------------------------------------------------------------ */

export type Cot = { g: GioTT; ngay: NgayTT; h: number; dem: boolean; dau: boolean }

/** "05:52" → 5.87 giờ. */
export function gioThapPhan(hhmm?: string): number | null {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null
  return Number(hhmm.slice(0, 2)) + Number(hhmm.slice(3, 5)) / 60
}

/** Dựng dải cột từ dãy ngày, lọc theo khung giờ; đêm tô theo mọc/lặn thật của ngày. */
export function dungCot(ngay: NgayTT[], tuGio: number, denGio: number): Cot[] {
  const cot: Cot[] = []
  for (const n of ngay) {
    const moc = gioThapPhan(n.matTroi?.moc) ?? 6
    const lan = gioThapPhan(n.matTroi?.lan) ?? 18
    let dau = true
    for (const g of n.gio) {
      const h = Number(g.gio.slice(11, 13))
      if (h < tuGio || h > denGio) continue
      cot.push({ g, ngay: n, h, dem: h + 0.5 < moc || h + 0.5 >= lan, dau })
      dau = false
    }
  }
  return cot
}

/** Đường cong mượt qua dãy điểm (Catmull-Rom → bezier bậc ba), đi QUA đúng các điểm. */
export function duongCong(diem: Array<[number, number]>): string {
  if (diem.length < 2) return ''
  if (diem.length === 2) return `M${diem[0]![0]},${diem[0]![1]} L${diem[1]![0]},${diem[1]![1]}`
  let d = `M${diem[0]![0].toFixed(1)},${diem[0]![1].toFixed(1)}`
  for (let i = 0; i < diem.length - 1; i++) {
    const p0 = diem[Math.max(0, i - 1)]!
    const p1 = diem[i]!
    const p2 = diem[i + 1]!
    const p3 = diem[Math.min(diem.length - 1, i + 2)]!
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

/**
 * Gió (hoặc hướng) nội suy ở một độ cao TUYỆT ĐỐI (m AMSL) giữa các mực mô
 * hình — cho airgram: hàng dưới cùng là bãi hạ, kế là bãi cất, trên là các mực.
 */
export function noiSuyGio(g: GioTT, cao: number, lay: 'gio' | 'huong', altHa: number, cao925: number, cao850: number): number | undefined {
  const moc: Array<{ h: number; v: number | undefined; d: number | undefined }> = [
    { h: altHa, v: g.gio10m, d: g.huong },
    { h: cao925, v: g.gio925, d: g.huong925 },
    { h: cao850, v: g.gio850, d: g.huong850 },
    { h: 3000, v: g.gio700, d: g.huong700 }
  ].filter((x) => (lay === 'gio' ? x.v !== undefined : x.d !== undefined))
  if (!moc.length) return undefined
  if (cao <= moc[0]!.h) return lay === 'gio' ? moc[0]!.v : moc[0]!.d
  for (let i = 1; i < moc.length; i++) {
    if (cao <= moc[i]!.h) {
      const a = moc[i - 1]!
      const b = moc[i]!
      const f = (cao - a.h) / Math.max(1, b.h - a.h)
      if (lay === 'gio') return (a.v as number) + ((b.v as number) - (a.v as number)) * f
      const da = a.d as number
      const db = b.d as number
      const lech = ((((db - da) % 360) + 540) % 360) - 180
      return (((da + lech * f) % 360) + 360) % 360
    }
  }
  const cuoi = moc[moc.length - 1]!
  return lay === 'gio' ? cuoi.v : cuoi.d
}

/* ------------------------------------------------------------------ */
/* MÙ VÀ MÂY THẤP — phân tích riêng cho Sa Pa                          */
/* ------------------------------------------------------------------ */

/**
 * Sa Pa nằm ở 1.500m, đúng tầng mây thấp của khối khí ẩm từ thung lũng Mường
 * Hoa bốc lên, nên mù chặn bay nhiều hơn gió. Mô hình không có ô "có mù không";
 * suy từ bốn dấu hiệu, cùng ngưỡng với bộ chấm giờ của mebayluon:
 *  - ĐỘ ẨM ≥ 97% và CHÊNH nhiệt độ – điểm sương ≤ 1°C: không khí bão hoà → MÙ DÀY.
 *  - MÂY THẤP ≥ 70% và TRẦN MÂY < 150m trên bãi: mây trùm bãi cất.
 *  - Mây thấp ≥ 50% mà trần < 400m, hoặc ẩm ≥ 95% chênh ≤ 1,5°C: tầm nhìn hạn chế.
 */
export type MucMu = 'quang' | 'hanChe' | 'trumBai' | 'muDay'

export function mucMu(g: GioTT): MucMu {
  const chenh = g.diemSuong === undefined || !Number.isFinite(g.diemSuong) ? null : g.nhietDo - g.diemSuong
  const am = g.am ?? 0
  const mayThap = g.mayThap ?? 0
  const cm = tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0)
  if (am >= 97 && chenh !== null && chenh <= 1 && mayThap >= 70) return 'muDay'
  if (mayThap >= 70 && cm !== null && cm < 150) return 'trumBai'
  if ((mayThap >= 50 && cm !== null && cm < 400) || (am >= 95 && chenh !== null && chenh <= 1.5)) return 'hanChe'
  return 'quang'
}

export type PhanTichMu = {
  nguyCo: 'thap' | 'vua' | 'cao'
  /** Số giờ mù dày / mây trùm bãi trong khung bay. */
  gioXau: number
  gioHanChe: number
  /** Giờ đầu tiên bãi quang trở lại sau đợt mù buổi sáng ("07:00"…), null nếu sáng không mù. */
  tanLuc: string | null
  /** Mù/mây kéo tới hết khung bay. */
  caNgay: boolean
  /** Mây trùm lại từ giờ này vào buổi chiều (sáng đã quang). */
  trumLaiLuc: string | null
  /** Chênh nhiệt độ – điểm sương nhỏ nhất (°C) và độ ẩm cao nhất (%) trong khung bay. */
  chenhMin: number | null
  amMax: number
  mayThapMax: number
  /** Trần mây thấp nhất (m trên bãi) trong những giờ có mây thấp. */
  tranMin: number | null
  gio: Array<{ gio: string; muc: MucMu; doDac: number }>
}

export function phanTichMu(ngay: NgayTT, khung: [number, number] = [7, 17]): PhanTichMu {
  const gio = ngay.gio.filter((g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= khung[0] && h <= khung[1]
  })
  const ds = gio.map((g) => ({ g, muc: mucMu(g) }))
  const xau = (m: MucMu) => m === 'muDay' || m === 'trumBai'
  const gioXau = ds.filter((x) => xau(x.muc)).length
  const gioHanChe = ds.filter((x) => x.muc === 'hanChe').length
  const nguyCo: PhanTichMu['nguyCo'] = gioXau >= 4 ? 'cao' : gioXau >= 1 || gioHanChe >= 3 ? 'vua' : 'thap'

  let tanLuc: string | null = null
  let caNgay = false
  let trumLaiLuc: string | null = null
  if (gioXau > 0) {
    const sangMu = ds.length > 0 && xau(ds[0]!.muc)
    if (sangMu) {
      const dauQuang = ds.findIndex((x) => !xau(x.muc))
      if (dauQuang === -1) caNgay = true
      else tanLuc = ds[dauQuang]!.g.gio.slice(11, 16)
    }
    /** Sau khi đã quang (hoặc từ đầu), mù/mây quay lại vào buổi chiều. */
    const tu = sangMu ? ds.findIndex((x) => !xau(x.muc)) : 0
    if (tu !== -1) {
      const lai = ds.slice(tu).find((x) => xau(x.muc) && Number(x.g.gio.slice(11, 13)) >= 11)
      if (lai) trumLaiLuc = lai.g.gio.slice(11, 16)
    }
  }

  const chenh = gio.map((g) => (g.diemSuong === undefined ? null : g.nhietDo - g.diemSuong)).filter((x): x is number => x !== null)
  const tran = gio
    .filter((g) => (g.mayThap ?? 0) >= 50)
    .map((g) => tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0))
    .filter((x): x is number => x !== null)
  return {
    nguyCo,
    gioXau,
    gioHanChe,
    tanLuc,
    caNgay,
    trumLaiLuc,
    chenhMin: chenh.length ? Math.round(Math.min(...chenh) * 10) / 10 : null,
    amMax: gio.length ? Math.round(Math.max(...gio.map((g) => g.am ?? 0))) : 0,
    mayThapMax: gio.length ? Math.round(Math.max(...gio.map((g) => g.mayThap ?? 0))) : 0,
    tranMin: tran.length ? Math.min(...tran) : null,
    gio: ds.map((x) => ({ gio: x.g.gio, muc: x.muc, doDac: doDacMu(x.g) }))
  }
}

/* ------------------------------------------------------------------ */
/* GIÓ TRÊN CAO theo hướng — luật bãi Sa Pa                            */
/* ------------------------------------------------------------------ */

/** Cung hướng 8 nhánh của một góc: 'B' 'ĐB' 'Đ' 'ĐN' 'N' 'TN' 'T' 'TB' (theo mã ngắn). */
export type HuongTam = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
const HUONG_TAM: HuongTam[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export function huongTam(deg: number): HuongTam {
  const h = ((deg % 360) + 360) % 360
  return HUONG_TAM[Math.round(h / 45) % 8]!
}

/**
 * Luật chủ (16/09): gió trên cao từ TÂY, ĐÔNG hoặc BẮC rất mạnh thì bãi cất
 * bị ảnh hưởng xấu dù gió mặt đất nhẹ. Xét ở +500m trên bãi (cùng mốc với luật
 * chung của mebayluon: từ 8 m/s lắp speedbar, trên 12 khuyến cáo nghỉ).
 */
export const HUONG_TREN_CAO_XAU: HuongTam[] = ['N', 'NE', 'E', 'W', 'NW']
export const GIO_TREN_CAO_SPEEDBAR = 8
export const GIO_TREN_CAO_CAM = 12

export type GioCaoGio = { gio: string; v500: number | null; huong: number | null; muc: MucDo }
export type PhanTichGioCao = {
  muc: MucDo
  /** Giờ mạnh nhất ở +500m trong khung bay. */
  max500: number | null
  huongMax: number | null
  gioMax: string | null
  /** Số giờ +500m vượt 12 m/s từ hướng xấu. */
  gioXau: number
  gioCanhBao: number
  /** Gió ngang mực 850 hPa (≈ độ cao bãi cất Sa Pa) và 700 hPa (≈3.000m) — mạnh nhất trong khung. */
  max850: number | null
  huong850: number | null
  max700: number | null
  huong700: number | null
  gio: GioCaoGio[]
}

export function phanTichGioCao(ngay: NgayTT, alt: number, khung: [number, number] = [7, 17]): PhanTichGioCao {
  const gio = ngay.gio.filter((g) => {
    const h = Number(g.gio.slice(11, 13))
    return h >= khung[0] && h <= khung[1]
  })
  const ds: GioCaoGio[] = gio.map((g) => {
    const v500 = gioTrenBai(g, 500, alt)
    /** Hướng ở +500m: mực 850 nằm ngang bãi (~1.525m) nên lấy 700 hPa, không có thì 850. */
    const huong = typeof g.huong700 === 'number' ? g.huong700 : typeof g.huong850 === 'number' ? g.huong850 : null
    let muc: MucDo = 'xanh'
    if (v500 !== null) {
      const xauHuong = huong !== null && HUONG_TREN_CAO_XAU.includes(huongTam(huong))
      if (v500 > GIO_TREN_CAO_CAM && xauHuong) muc = 'do'
      else if (v500 > GIO_TREN_CAO_CAM || v500 >= GIO_TREN_CAO_SPEEDBAR) muc = 'vang'
    }
    return { gio: g.gio, v500, huong, muc }
  })
  const co = ds.filter((x) => x.v500 !== null)
  const manhNhat = co.reduce<GioCaoGio | null>((a, b) => (a === null || (b.v500 as number) > (a.v500 as number) ? b : a), null)
  const lonNhat = (lay: (g: GioTT) => number | undefined, layH: (g: GioTT) => number | undefined) => {
    let best: { v: number; h: number | null } | null = null
    for (const g of gio) {
      const v = lay(g)
      if (typeof v !== 'number') continue
      if (!best || v > best.v) best = { v, h: layH(g) ?? null }
    }
    return best
  }
  const m850 = lonNhat((g) => g.gio850, (g) => g.huong850)
  const m700 = lonNhat((g) => g.gio700, (g) => g.huong700)
  const muc: MucDo = ds.some((x) => x.muc === 'do') ? 'do' : ds.some((x) => x.muc === 'vang') ? 'vang' : 'xanh'
  return {
    muc,
    max500: manhNhat?.v500 ?? null,
    huongMax: manhNhat?.huong ?? null,
    gioMax: manhNhat?.gio.slice(11, 16) ?? null,
    gioXau: ds.filter((x) => x.muc === 'do').length,
    gioCanhBao: ds.filter((x) => x.muc === 'vang').length,
    max850: m850?.v ?? null,
    huong850: m850?.h ?? null,
    max700: m700?.v ?? null,
    huong700: m700?.h ?? null,
    gio: ds
  }
}

/**
 * ĐỘ ĐẶC CỦA MÙ (0–1) — thang liên tục để tô xám→đen (chủ 16/09: biểu tượng
 * không nói được mù "đặc" tới đâu). Bốn dấu hiệu cùng thang với `mucMu`:
 * chênh nhiệt độ – điểm sương khép lại, độ ẩm sát bão hoà, mây thấp dày, trần
 * mây sát bãi. Trời khô và ít mây thấp thì kéo về gần 0 dù ẩm cao.
 */
export function doDacMu(g: GioTT): number {
  const kep = (x: number) => Math.max(0, Math.min(1, x))
  const chenh = g.diemSuong === undefined || !Number.isFinite(g.diemSuong) ? 3 : g.nhietDo - g.diemSuong
  const am = g.am ?? 0
  const mayThap = g.mayThap ?? 0
  const cm = tranMay(g.nhietDo, g.diemSuong, g.mayThap, g.chenhDoCao ?? 0)
  const s1 = kep((3 - chenh) / 3)
  const s2 = kep((am - 85) / 15)
  const s3 = kep(mayThap / 100)
  const s4 = cm === null ? 0 : kep((600 - cm) / 600)
  let d = 0.35 * s1 + 0.25 * s2 + 0.2 * s3 + 0.2 * s4
  /** Không có mây thấp mà cũng chưa bão hoà thì chỉ là ẩm, chưa phải mù. */
  if (mayThap < 25 && am < 95) d *= 0.3
  return Math.round(kep(d) * 100) / 100
}

/** Xám nhạt (quang) → đen (mù dày) theo độ đặc 0–1; chữ tự đổi trắng khi nền tối. */
export function styleMu(doDac: number): { background: string; color: string } {
  const f = Math.max(0, Math.min(1, doDac))
  const a = hexSangRgb('#f8fafc')
  const b = hexSangRgb('#0f172a')
  const bg = rgbSangHex(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f)
  return { background: bg, color: chuTrenNen(bg) }
}
