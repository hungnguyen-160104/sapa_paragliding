import { defineEventHandler, setHeader, createError, getQuery } from 'h3'
import { laMaMoHinh, MO_HINH_MAC_DINH } from '~/utils/weather'

/**
 * THỜI TIẾT BAY SA PA — lấy từ hệ thống dự báo của mebayluon.com.
 *
 * Bên mebayluon.com đã có bộ chấm ngày bay hoàn chỉnh cho điểm Mường Hoa – Sa Pa
 * (mô hình ECMWF/GFS/ICON… qua Open-Meteo, ngưỡng gió do chủ điểm bay chấm dần,
 * nhận định ngày bay, điểm chuyên gia, lời chuyên gia người, tiềm năng thermal).
 * API ấy công khai, không cần đăng nhập, nên web Sapa chỉ việc gọi sang rồi
 * hiển thị — cùng một bộ số với đội bay đang nhìn, không khai lại ngưỡng lần
 * thứ hai. Chủ sửa gì ở trang quản lý mebayluon.com thì tối đa ~50 phút sau
 * (cache biên 30' bên đó + cache 20' ở đây) web Sapa hiện theo.
 *
 * GET /api/weather?model=ecmwf|gfs|icon|ukmo|gem  (mặc định ecmwf)
 *
 * Vì sao gọi qua máy chủ chứ không để trình duyệt gọi thẳng:
 *  - Cắt bớt trường: bản gốc ~330 KB vì kèm bảng điểm từng giờ của chuyên gia
 *    và thermal; trang khách chỉ cần vài chục trường.
 *  - Cache 20 phút trong tiến trình theo từng mô hình.
 *  - Khi mebayluon.com chậm hoặc lỗi thì trả bản cũ (tới 6 giờ) thay vì trắng trang.
 */
/**
 * 15 NGÀY (chủ 16/09) — ECMWF trên Open-Meteo phủ tới ~15 ngày, GFS 16; mô hình
 * nào không đủ thì mebayluon tự cắt những ngày trống. Mặc định bên mebayluon
 * là 10, nên phải xin rõ `days=15`.
 */
const SO_NGAY = 15
const NGUON = `https://www.mebayluon.com/api/thoi-tiet?spot=muong-hoa-sapa&days=${SO_NGAY}`
/**
 * 5 PHÚT chứ không phải 20 (chủ 17/09: ghi lời chuyên gia bên mebayluon mà nửa
 * tiếng sau web Sapa vẫn chưa hiện). Lời chuyên gia là thứ đổi trong ngày và
 * phải tới khách nhanh; số mô hình thì vài lần một ngày, 5 phút vẫn thừa.
 * Cộng với CDN 2 phút bên dưới, tối đa ~7 phút là khách thấy.
 */
const CACHE_MS = 5 * 60 * 1000
const CACHE_CU_MS = 6 * 60 * 60 * 1000

/** Trường của TỪNG GIỜ mà trang khách cần — xem app/utils/weather.ts. */
const TRUONG_GIO = [
  'gio', 'gio10m', 'giat', 'huong', 'mua', 'muaRao', 'may', 'nhietDo', 'diemSuong',
  'mayThap', 'am', 'cape', 'chiSoNang', 'tranThermal', 'xacSuatMua', 'buXa',
  'chenhDoCao', 'apSuat', 'giayNang', 'gio925', 'gio850', 'gio700',
  'huong925', 'huong850', 'huong700', 'h925', 'h850', 't925', 't850', 't700',
  'mayGiua', 'mayCao', 'muc', 'lyDo'
] as const

/**
 * LUẬT HƯỚNG GIÓ BÃI SA PA (chủ 16/09): không bay khi gió BẮC hoặc ĐÔNG BẮC
 * mạnh (nhẹ thì vẫn bay), gió TÂY mạnh hoặc gió ĐÔNG mạnh cũng nghỉ. "Mạnh" =
 * trên 6 m/s theo thang chủ.
 *
 * Nguồn thật của luật là mebayluon (lib/baobay/thoi-tiet.ts, điểm `sapa`) —
 * bên đó chấm màu từng giờ. Khai lại ở đây chỉ để GHÉP THÊM những hướng mà bản
 * mebayluon đang chạy chưa có (bên đó deploy sau), cho mũi tên hướng và bảng
 * luật trên trang khách đúng ngay; hướng nào mebayluon đã có thì giữ số của họ.
 */
const CAP_TOC_SAPA = [
  { tam: [0], max: 6, ten: 'Bắc' },
  { tam: [45], max: 6, ten: 'Đông Bắc' },
  { tam: [90], max: 6, ten: 'Đông' },
  { tam: [270], max: 6, ten: 'Tây' }
]

type Bat = Record<string, unknown>

function lay(o: Bat, khoa: readonly string[]): Bat {
  const r: Bat = {}
  for (const k of khoa) if (o[k] !== undefined) r[k] = o[k]
  return r
}

function ghepLuatHuong(toaDo: Bat | undefined): Bat | undefined {
  if (!toaDo) return toaDo
  const luat = ((toaDo.luatHuong as Bat | undefined) ?? {}) as Bat
  const capToc = Array.isArray(luat.capToc) ? [...(luat.capToc as Array<{ tam: number[]; max: number; ten: string }>)] : []
  for (const c of CAP_TOC_SAPA) {
    const daCo = capToc.some((x) => Array.isArray(x.tam) && x.tam.some((h) => Math.abs(((h - c.tam[0]! + 540) % 360) - 180) <= 22.5))
    if (!daCo) capToc.push(c)
  }
  return { ...toaDo, luatHuong: { ...luat, capToc } }
}

function catGon(goc: Bat): Bat {
  const ngay = (Array.isArray(goc.ngay) ? goc.ngay : []) as Bat[]
  return {
    slug: goc.slug,
    ten: goc.ten,
    tinh: goc.tinh,
    toaDo: ghepLuatHuong(goc.toaDo as Bat | undefined),
    nguong: goc.nguong,
    moHinh: goc.moHinh,
    layLuc: goc.layLuc,
    ngay: ngay.map((n) => {
      const { gio, thermal, chuyenGia, ...con } = n
      const th = thermal as Bat | undefined
      const cg = chuyenGia as Bat | undefined
      return {
        ...con,
        gio: ((gio as Bat[]) ?? []).map((g) => lay(g, TRUONG_GIO)),
        thermal: th ? lay(th, ['diem', 'muc', 'khung', 'gioDung', 'lyDo', 'canhBao']) : undefined,
        chuyenGia: cg
          ? lay(cg, ['diem', 'xepLoai', 'khungTotNhat', 'gioBayDuoc', 'doTinCay', 'lyDoTinCay'])
          : undefined
      }
    })
  }
}

const cache = new Map<string, { luc: number; du: Bat }>()
/** Nhiều khách vào cùng lúc khi cache hết hạn thì chỉ gọi sang MỘT lần mỗi mô hình. */
const dangGoi = new Map<string, Promise<Bat>>()

async function goiNguon(moHinh: string): Promise<Bat> {
  const goc = await $fetch<Bat>(`${NGUON}&model=${encodeURIComponent(moHinh)}`, {
    signal: AbortSignal.timeout(20_000),
    headers: { accept: 'application/json' }
  })
  if (!goc || !Array.isArray(goc.ngay) || goc.ngay.length === 0) {
    throw new Error('mebayluon.com trả dữ liệu rỗng')
  }
  return catGon(goc)
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const moHinh = laMaMoHinh(q.model) ? q.model : MO_HINH_MAC_DINH
  const cu = cache.get(moHinh)
  if (cu && Date.now() - cu.luc < CACHE_MS) {
    setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    return cu.du
  }
  try {
    let p = dangGoi.get(moHinh)
    if (!p) {
      p = goiNguon(moHinh).finally(() => { dangGoi.delete(moHinh) })
      dangGoi.set(moHinh, p)
    }
    const du = await p
    cache.set(moHinh, { luc: Date.now(), du })
    setHeader(event, 'Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    return du
  } catch (err) {
    console.error(`GET /api/weather (${moHinh}): không lấy được dự báo từ mebayluon.com:`, err)
    if (cu && Date.now() - cu.luc < CACHE_CU_MS) {
      setHeader(event, 'Cache-Control', 'public, s-maxage=60')
      return cu.du
    }
    throw createError({ statusCode: 502, statusMessage: 'Weather forecast unavailable' })
  }
})
