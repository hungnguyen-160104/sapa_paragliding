/**
 * Vá payload trang lỗi để Pinia tuần tự hoá được.
 *
 * Triệu chứng: MỌI URL sai đều trả 500 "Server Error" thay vì 404 — cả với
 * người dùng lẫn với Googlebot.
 *
 * Nguyên nhân: Nuxt render trang lỗi bằng cách gọi nội bộ
 *   /__nuxt_error?error=true&url=...&statusCode=404&statusMessage=...
 * Chuỗi query đó được phân tích thành object có prototype NULL, rồi gán thẳng
 * vào payload.error. Khi Nuxt tuần tự hoá payload, reducer của module Pinia
 * chạy qua từng giá trị và gọi obj.hasOwnProperty(...) — với object prototype
 * null thì hasOwnProperty không tồn tại:
 *
 *   TypeError: obj.hasOwnProperty is not a function
 *       at shouldHydrate (pinia)  ->  at renderPayloadJsonScript
 *
 * Việc render trang lỗi ném lỗi, nên Nuxt hạ tiếp xuống khung 500 trần. Không
 * liên quan gì tới nội dung trang lỗi — bản thân trang 404 vẫn đúng.
 *
 * Cách vá: trải object ra thành object thường (có Object.prototype) trước khi
 * payload được tuần tự hoá. Chạy ở app:rendered vì bước tuần tự hoá diễn ra
 * sau hook này.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:rendered', () => {
    const error = nuxtApp.payload.error

    if (error && typeof error === 'object' && Object.getPrototypeOf(error) === null) {
      nuxtApp.payload.error = { ...error } as typeof error
    }
  })
})
