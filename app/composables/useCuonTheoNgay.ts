import { onMounted, ref, watch, type Ref } from 'vue'

/**
 * CUỘN NGANG QUA NHIỀU NGÀY, đồng bộ với dải ngày phía trên (chuyển từ
 * mebayluon components/weather/cuon-ngay.ts).
 *
 * Dùng chung cho Basic · Meteogram · Airgram: vuốt ngang là chạy sang ngày
 * sau, bấm ngày ở dải trên thì trượt tới ngày đó, gạt tới ngày nào thì dải
 * trên sáng ngày ấy. Bắt theo mốc trong DOM (`data-ngay`) chứ không theo bề
 * rộng cột; trừ bề ngang cột nhãn dính bên trái (`data-truc`).
 */
export function useCuonTheoNgay(ngayChon: Ref<string | null | undefined>, onNgayHien?: (ngay: string) => void) {
  const khung = ref<HTMLElement | null>(null)
  let daBao: string | null = null
  let dangCho: number | null = null
  /** Đang cuộn máy tới một ngày: bỏ qua các mốc trung gian lướt qua mép trái. */
  let dangCuonToi: { ngay: string; het: number } | null = null

  const viTri = (el: HTMLElement, moc: HTMLElement) =>
    moc.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft
  const beNgangTruc = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-truc]')?.getBoundingClientRect().width ?? 0

  const cuonToi = (d: string, muot: boolean) => {
    const el = khung.value
    if (!el) return
    const moc = el.querySelector<HTMLElement>(`[data-ngay="${d}"]`)
    if (!moc) return
    const left = Math.max(0, viTri(el, moc) - beNgangTruc(el))
    if (muot) {
      dangCuonToi = { ngay: d, het: Date.now() + 1500 }
      el.scrollTo({ left, behavior: 'smooth' })
    } else {
      daBao = d
      el.scrollLeft = left
    }
  }

  onMounted(() => {
    if (ngayChon.value) cuonToi(ngayChon.value, false)
  })
  watch(ngayChon, (d) => {
    if (!d || d === daBao) return
    cuonToi(d, true)
  }, { flush: 'post' })

  const onScroll = () => {
    const el = khung.value
    if (!el || !onNgayHien) return
    if (dangCho !== null) return
    dangCho = requestAnimationFrame(() => {
      dangCho = null
      const moc = [...el.querySelectorAll<HTMLElement>('[data-ngay]')]
      if (!moc.length) return
      const mep = el.scrollLeft + beNgangTruc(el) + 8
      let chon = moc[0]!
      for (const m of moc) if (viTri(el, m) <= mep) chon = m
      const d = chon.dataset.ngay
      if (dangCuonToi) {
        if (d !== dangCuonToi.ngay && Date.now() < dangCuonToi.het) return
        dangCuonToi = null
        daBao = d ?? null
        return
      }
      if (d && d !== daBao) {
        daBao = d
        onNgayHien(d)
      }
    })
  }

  return { khung, onScroll }
}

/** Màn hình hẹp (điện thoại) hay không — biểu đồ vẽ px cố định nên phải biết bề ngang thật. */
export function useManHinhHep(mocPx = 640): Ref<boolean> {
  const hep = ref(false)
  onMounted(() => {
    const mq = window.matchMedia(`(max-width: ${mocPx}px)`)
    const doi = () => { hep.value = mq.matches }
    doi()
    mq.addEventListener('change', doi)
  })
  return hep
}
