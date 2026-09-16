import { defineEventHandler, setHeader, createError, getQuery } from 'h3'
import { laMaMoHinh, MO_HINH_MAC_DINH } from '~/utils/weather'

/**
 * THÁM KHÔNG (SKEW-T) cho điểm Sa Pa, một ngày — lấy từ mebayluon.com.
 *
 * GET /api/weather-skewt?date=YYYY-MM-DD&model=ecmwf
 *
 * Lấy riêng chứ không nhét vào /api/weather: một ngày × 12 mực × 5 trường là
 * gần 60 con số mỗi giờ, mà giản đồ chỉ mở khi có người bấm tab Skew-T.
 * Cache 30 phút theo (ngày, mô hình).
 */
const NGUON = 'https://www.mebayluon.com/api/thoi-tiet/skew-t?spot=muong-hoa-sapa'
const CACHE_MS = 30 * 60 * 1000

type Bat = Record<string, unknown>
const cache = new Map<string, { luc: number; du: Bat }>()

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const date = String(q.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing date (YYYY-MM-DD)' })
  }
  const moHinh = laMaMoHinh(q.model) ? q.model : MO_HINH_MAC_DINH
  const khoa = `${date}:${moHinh}`
  const cu = cache.get(khoa)
  if (cu && Date.now() - cu.luc < CACHE_MS) {
    setHeader(event, 'Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    return cu.du
  }
  try {
    const du = await $fetch<Bat>(`${NGUON}&date=${date}&model=${encodeURIComponent(moHinh)}`, {
      signal: AbortSignal.timeout(20_000),
      headers: { accept: 'application/json' }
    })
    if (!du || !Array.isArray(du.gio)) throw new Error('mebayluon.com trả dữ liệu rỗng')
    /** Bỏ ngày cũ khỏi cache để bộ nhớ không lớn dần. */
    for (const [k, v] of cache) if (Date.now() - v.luc > CACHE_MS * 4) cache.delete(k)
    cache.set(khoa, { luc: Date.now(), du })
    setHeader(event, 'Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    return du
  } catch (err) {
    console.error(`GET /api/weather-skewt (${khoa}):`, err)
    if (cu) return cu.du
    throw createError({ statusCode: 502, statusMessage: 'Sounding unavailable' })
  }
})
