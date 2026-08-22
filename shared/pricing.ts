/**
 * Quy tắc giảm giá nhóm — nguồn duy nhất cho cả web và máy chủ.
 *
 * Chỉ còn MỘT mức: nhóm từ 4 khách trở lên giảm 50.000đ/người.
 * 1–2–3 khách không giảm. Trước đây có bốn bậc (2/3/4/6 khách), giá hiển thị
 * ở bước 1, email, Telegram và vé đều lấy từ đây nên sửa một chỗ là đủ.
 */
export const GROUP_DISCOUNT_MIN_PEOPLE = 4
export const GROUP_DISCOUNT_VND = 50000
export const GROUP_DISCOUNT_USD = 2

/** Giảm giá mỗi khách (VND) theo số khách của đơn. */
export function groupDiscountPerPerson(numberOfPassengers: number): number {
  const pax = Number(numberOfPassengers) || 0
  return pax >= GROUP_DISCOUNT_MIN_PEOPLE ? GROUP_DISCOUNT_VND : 0
}

/** Giảm giá mỗi khách (USD) — dùng cho bảng giá ngoại tệ ở bước 1. */
export function groupDiscountPerPersonUSD(numberOfPassengers: number): number {
  const pax = Number(numberOfPassengers) || 0
  return pax >= GROUP_DISCOUNT_MIN_PEOPLE ? GROUP_DISCOUNT_USD : 0
}

