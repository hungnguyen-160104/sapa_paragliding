/**
 * Địa chỉ trang phi công: /pilots/<slug-tên> — nguồn duy nhất.
 *
 * Trước đây địa chỉ là /pilots/pilot1..pilot14. Đổi sang slug tên vì địa chỉ
 * là thứ khách nhìn thấy khi chia sẻ và là thứ Google đọc để đoán nội dung:
 * "dang-van-my" nói được điều mà "pilot1" không nói được.
 *
 * Bảng này VIẾT TAY, cố ý không sinh tự động từ i18n. Slug là một phần của
 * địa chỉ vĩnh viễn: sửa một chữ trong tên ở i18n mà slug tự đổi theo thì mọi
 * link cũ chết lặng lẽ. Muốn đổi slug thì phải sửa ở đây, và phải cân nhắc
 * việc mất toàn bộ thứ hạng của địa chỉ cũ.
 *
 * Slug lấy theo tên tiếng Việt và DÙNG CHUNG cho cả sáu ngôn ngữ. Tên người
 * không dịch, nên /en/pilots/dang-van-my và /vi/pilots/dang-van-my là cùng một
 * người — mỗi ngôn ngữ một slug riêng chỉ tổ sinh ra sáu địa chỉ phải quản.
 */
export const PILOT_SLUG_BY_KEY = {
  pilot1: 'dang-van-my',
  pilot2: 'alish-thapa',
  pilot3: 'subash-thapa',
  pilot4: 'suman-thapa',
  pilot5: 'bishal-thapa',
  pilot6: 'bishal-skyboy',
  pilot7: 'dinh-the-anh',
  pilot8: 'tuan-nguyen',
  pilot9: 'minh-trung',
  pilot10: 'phan-hung',
  pilot11: 'ngo-van-doi',
  pilot12: 'minh-vo',
  pilot13: 'toan-nguyen',
  pilot14: 'chien-thang'
} as const

export type PilotKey = keyof typeof PILOT_SLUG_BY_KEY

export const PILOT_KEYS = Object.keys(PILOT_SLUG_BY_KEY) as PilotKey[]

const SLUG_TO_KEY = new Map<string, PilotKey>(
  PILOT_KEYS.map((key) => [PILOT_SLUG_BY_KEY[key], key])
)

/**
 * Phi công đã nghỉ, không hiển thị nữa.
 * pilot8 = Tuấn Nguyễn (Nhị ca) — đã chuyển sang công ty khác.
 *
 * Giữ slug trong bảng trên để địa chỉ của anh ấy vẫn được nhận diện rồi trả
 * 404 thật, thay vì rơi vào nhánh "không biết đây là gì".
 */
export const HIDDEN_PILOT_KEYS: readonly PilotKey[] = ['pilot8']

export function isHiddenPilot(key: PilotKey): boolean {
  return HIDDEN_PILOT_KEYS.includes(key)
}

/** Khoá i18n của phi công đang hiển thị, theo đúng thứ tự trên trang danh sách. */
export const VISIBLE_PILOT_KEYS: readonly PilotKey[] = PILOT_KEYS.filter((key) => !isHiddenPilot(key))

export function pilotKeyFromSlug(slug: string): PilotKey | null {
  return SLUG_TO_KEY.get(slug) ?? null
}

/**
 * Nhận dạng địa chỉ cũ /pilots/pilot<N> để đổi 301 sang slug.
 * Trả về null nếu tham số không phải dạng cũ.
 */
export function pilotKeyFromLegacyParam(param: string): PilotKey | null {
  return param in PILOT_SLUG_BY_KEY ? (param as PilotKey) : null
}

export function pilotPath(key: PilotKey): string {
  return `/pilots/${PILOT_SLUG_BY_KEY[key]}`
}
