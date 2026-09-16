/**
 * SKEW-T LOG-P — phép tính cho giản đồ thám không (chuyển từ mebayluon
 * lib/baobay/skew-t.ts, giữ nguyên công thức). Thuần tính, không mạng.
 */

export const MUC_AP = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300] as const

export type MucSkewT = {
  ap: number
  cao: number
  nhiet: number
  suong: number
  gio: number | null
  huong: number | null
}

export type ThamKhong = { gio: string; muc: MucSkewT[] }

const KHO = 9.8 / 1000

export function caoTheoAp(ap: number): number {
  return Math.round(44330 * (1 - Math.pow(ap / 1013.25, 0.1903)))
}

/** Đáy mây (LCL) theo Espy: 125m cho mỗi 1°C chênh nhiệt độ – điểm sương. Mét TRÊN mực xuất phát. */
export function dayMay(nhiet: number, suong: number): number {
  return Math.max(0, Math.round((nhiet - suong) * 125))
}

/** Đường bọt khí bốc lên từ một mực: khô tới đáy mây, ẩm ở trên. */
export function duongBotKhi(
  batDau: { ap: number; cao: number; nhiet: number; suong: number },
  mucCao: Array<{ ap: number; cao: number }>
): Array<{ ap: number; cao: number; nhiet: number }> {
  const caoLCL = batDau.cao + dayMay(batDau.nhiet, batDau.suong)
  const ra: Array<{ ap: number; cao: number; nhiet: number }> = []
  let t = batDau.nhiet
  let caoTruoc = batDau.cao
  for (const m of [{ ap: batDau.ap, cao: batDau.cao }, ...mucCao.filter((x) => x.cao > batDau.cao)]) {
    const dz = m.cao - caoTruoc
    if (dz > 0) {
      if (m.cao <= caoLCL) {
        t -= KHO * dz
      } else {
        const dzKho = Math.max(0, caoLCL - caoTruoc)
        const dzAm = dz - dzKho
        t -= KHO * dzKho
        const amRate = 0.004 + 0.003 * Math.max(0, Math.min(1, (0 - t) / 40))
        t -= amRate * dzAm
      }
    }
    ra.push({ ap: m.ap, cao: m.cao, nhiet: t })
    caoTruoc = m.cao
  }
  return ra
}

/** Trần bọt khí: độ cao mà bọt nguội bằng môi trường — "trần thermal" đọc từ giản đồ. */
export function tranBotKhi(
  bot: Array<{ cao: number; nhiet: number }>,
  moiTruong: Array<{ cao: number; nhiet: number }>
): number | null {
  const nhietTai = (cao: number): number | null => {
    for (let i = 1; i < moiTruong.length; i++) {
      const a = moiTruong[i - 1]!
      const b = moiTruong[i]!
      if (cao >= a.cao && cao <= b.cao) {
        const f = (cao - a.cao) / Math.max(1, b.cao - a.cao)
        return a.nhiet + (b.nhiet - a.nhiet) * f
      }
    }
    return null
  }
  let duoi: { cao: number; chenh: number } | null = null
  for (const p of bot) {
    const mt = nhietTai(p.cao)
    if (mt === null) continue
    const chenh = p.nhiet - mt
    if (duoi && duoi.chenh > 0 && chenh <= 0) {
      const f = duoi.chenh / (duoi.chenh - chenh)
      return Math.round(duoi.cao + (p.cao - duoi.cao) * f)
    }
    duoi = { cao: p.cao, chenh }
  }
  return null
}

/** Lớp nghịch nhiệt: đoạn nhiệt độ TĂNG theo độ cao (hoặc giảm quá chậm) — cái nắp chặn thermal. */
export function lopNghichNhiet(muc: MucSkewT[]): Array<{ tu: number; den: number; manh: number }> {
  const ra: Array<{ tu: number; den: number; manh: number }> = []
  for (let i = 1; i < muc.length; i++) {
    const a = muc[i - 1]!
    const b = muc[i]!
    if (b.cao <= a.cao) continue
    const doc = ((b.nhiet - a.nhiet) / (b.cao - a.cao)) * 100
    if (doc > -0.2) ra.push({ tu: a.cao, den: b.cao, manh: Math.round(doc * 100) / 100 })
  }
  return ra
}
