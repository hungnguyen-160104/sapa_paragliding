import { onMounted, ref } from 'vue'

/**
 * Hoãn tải video nền cho tới khi trang đã tải xong.
 *
 * Video nền trang trí nặng vài MB. Nếu để thẻ <source> sẵn trong HTML, trình
 * duyệt tải nó SONG SONG với chữ, CSS và ảnh, làm chậm lúc hiện nội dung đầu
 * tiên. Đặt nguồn bằng JS sau sự kiện load thì video xuống hàng chờ cuối cùng.
 *
 * Ảnh poster (hoặc ảnh nền phía sau) che kín khung trong lúc chờ nên người
 * dùng không thấy khoảng trống, và khi video chạy thì vẫn đúng file đó —
 * chất lượng không đổi chút nào.
 *
 * Đã đo: hai file mp4 của dự án vốn đã nén gần tối ưu (moov atom nằm sẵn đầu
 * file, mã hoá lại bằng H.264/VP9/AV1 ở mức chất lượng tương đương đều cho ra
 * file TO HƠN). Nên hoãn tải là cách duy nhất còn lại để trang nhẹ đi mà
 * không phải hạ chất lượng.
 *
 * Dùng:
 *   const heroVideo = useDeferredVideo('/videos/header/xxx.mp4')
 *   <video ref="heroVideo" autoplay muted loop playsinline preload="none" />
 *   (KHÔNG đặt <source> trong template — composable tự thêm)
 */
export function useDeferredVideo(src: string, type = 'video/mp4') {
  const videoRef = ref<HTMLVideoElement | null>(null)

  const attachSource = () => {
    const el = videoRef.value
    if (!el || el.querySelector('source')) return

    const source = document.createElement('source')
    source.src = src
    source.type = type
    el.appendChild(source)
    el.load()

    // autoplay không tự kích hoạt lại sau load() nên gọi tay. Bỏ qua nếu trình
    // duyệt chặn — video đã muted nên hầu như luôn được phép.
    void el.play().catch(() => {})
  }

  const whenIdle = (fn: () => void) => {
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void
    }).requestIdleCallback

    if (ric) ric(fn, { timeout: 3000 })
    else setTimeout(fn, 400)
  }

  onMounted(() => {
    if (document.readyState === 'complete') {
      whenIdle(attachSource)
    } else {
      window.addEventListener('load', () => whenIdle(attachSource), { once: true })
    }
  })

  return videoRef
}
