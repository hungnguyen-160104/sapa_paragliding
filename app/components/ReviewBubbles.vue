<template>
  <!-- Cặp bong bóng điểm đánh giá — góc TRÁI dưới, xếp dọc, đối xứng với cụm
       nút chat Zalo/WhatsApp đang chiếm góc phải dưới. -->
  <div class="fixed bottom-6 left-4 z-40 flex flex-col gap-2.5">
    <!-- ============ GOOGLE ============ -->
    <a
      :href="GOOGLE_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 rounded-full bg-white py-2 pl-3 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-transform hover:scale-105"
      aria-label="Google reviews"
    >
      <!-- Wordmark "Google" tô màu từng chữ cái — nhận diện tức thì, không
           rủi ro vẽ méo logo chữ G bốn màu -->
      <span class="text-lg font-bold leading-none tracking-tight">
        <span class="text-[#4285F4]">G</span><span class="text-[#EA4335]">o</span><span class="text-[#FBBC05]">o</span><span class="text-[#4285F4]">g</span><span class="text-[#34A853]">l</span><span class="text-[#EA4335]">e</span>
      </span>
      <span class="flex items-center gap-1.5">
        <span class="text-base font-black text-slate-900">{{ GOOGLE_SCORE.toFixed(1) }}</span>
        <!-- Google dùng SAO vàng -->
        <span class="flex items-center gap-0.5">
          <svg
            v-for="i in 5"
            :key="i"
            class="h-3 w-3"
            :class="i <= Math.round(GOOGLE_SCORE) ? 'text-[#FBBC05]' : 'text-slate-200'"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.077 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
        </span>
        <span v-if="GOOGLE_REVIEW_COUNT" class="text-[11px] text-slate-500">({{ GOOGLE_REVIEW_COUNT }})</span>
      </span>
    </a>

    <!-- ============ TRIPADVISOR ============ -->
    <a
      :href="TRIPADVISOR_URL"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2.5 rounded-full bg-white py-2 pl-2.5 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-transform hover:scale-105"
      aria-label="TripAdvisor reviews"
    >
      <!-- Cặp mắt cú (ống nhòm) — motif nhận diện TripAdvisor, vẽ bằng hình
           tròn thuần nên không bao giờ méo -->
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#34e0a1]">
        <svg class="h-5 w-5 text-black" viewBox="0 0 24 12" fill="none">
          <circle cx="6.5" cy="6" r="4.4" stroke="currentColor" stroke-width="1.8" />
          <circle cx="6.5" cy="6" r="1.7" fill="currentColor" />
          <circle cx="17.5" cy="6" r="4.4" stroke="currentColor" stroke-width="1.8" />
          <circle cx="17.5" cy="6" r="1.7" fill="currentColor" />
        </svg>
      </span>
      <span class="flex flex-col leading-tight">
        <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tripadvisor</span>
        <span class="flex items-center gap-1.5">
          <span class="text-base font-black text-slate-900">{{ TA_SCORE.toFixed(1) }}</span>
          <!-- Thang điểm kiểu TripAdvisor: chấm tròn xanh, không phải sao -->
          <span class="flex items-center gap-0.5">
            <span
              v-for="i in 5"
              :key="i"
              class="h-2.5 w-2.5 rounded-full"
              :class="i <= Math.round(TA_SCORE) ? 'bg-[#34e0a1]' : 'bg-slate-200'"
            />
          </span>
          <span v-if="TA_REVIEW_COUNT" class="text-[11px] text-slate-500">({{ TA_REVIEW_COUNT }})</span>
        </span>
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
/**
 * Bong bóng điểm đánh giá Google + TripAdvisor.
 *
 * Cả Google lẫn TripAdvisor đều không cho đọc điểm tự động (TripAdvisor chặn
 * bot 403, Content API phải nộp đơn; Google Places API cần khoá thanh toán),
 * nên điểm là HẰNG SỐ nhập tay — giống đa số widget điểm trên các site du
 * lịch. Điểm trên listing đổi thì sửa các hằng số dưới đây;
 * REVIEW_COUNT = null thì ẩn số lượt đánh giá.
 */
const GOOGLE_SCORE = 5.0
const GOOGLE_REVIEW_COUNT: number | null = null
/** Link chia sẻ chính chủ của hồ sơ Google Business (chủ doanh nghiệp cung
 * cấp) — mở thẳng trang địa điểm với điểm số và toàn bộ đánh giá, không qua
 * bước tìm kiếm. */
const GOOGLE_URL = 'https://maps.app.goo.gl/gUWjs458L8X6u9fe9'

const TA_SCORE = 5.0
const TA_REVIEW_COUNT: number | null = null
const TRIPADVISOR_URL =
  'https://www.tripadvisor.com/Attraction_Review-g311304-d33242005-Reviews-Paragliding_Experience_in_Sapa_Hotel_Pickup_and_Drop_off-Sapa_Lao_Cai_Province.html'
</script>
