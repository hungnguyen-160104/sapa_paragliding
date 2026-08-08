/**
 * Hai văn phòng của Sapa Paragliding — nguồn duy nhất cho vé bay, email xác
 * nhận, footer, trang chủ và LocalBusiness JSON-LD.
 *
 * Mỗi văn phòng đồng thời là một đầu của chuyến bay:
 *   • Văn phòng Bản Hang Đá  = nơi khách tập trung, cũng là BÃI CẤT CÁNH
 *   • Văn phòng Cầu Lao Chải = cũng là BÃI HẠ CÁNH
 * Hai nơi cách nhau khoảng 1,35 km theo đường chim bay.
 *
 * Toạ độ 22.3219262, 103.8766636 chính là văn phòng cất cánh — trước đây tôi
 * từng nhầm nó là "văn phòng ở thị trấn, không phải điểm bay".
 */

export interface FlyingOffice {
  /** Khoá i18n cho nhãn vai trò ("Văn phòng bãi cất cánh"/"bãi hạ cánh"). */
  roleKey: 'takeoffOffice' | 'landingOffice'
  /** Tên ngắn hiển thị cho khách. */
  name: string
  /** Địa chỉ ngắn dùng ở footer và trang chủ. */
  shortAddress: string
  /** Địa chỉ đầy đủ. */
  address: string
  latitude: number
  longitude: number
  /** Ghim Google Maps chính chủ. */
  mapUrl: string
}

/** Văn phòng 1 — bãi cất cánh. */
export const TAKEOFF_OFFICE: FlyingOffice = {
  roleKey: 'takeoffOffice',
  name: 'Bản Hang Đá, Sa Pa',
  shortAddress: 'Bản Hang Đá, Phường Sa Pa',
  address: 'Tổ 3, Bản Hang Đá, Phường Sa Pa, Lào Cai',
  latitude: 22.3219262,
  longitude: 103.8766636,
  mapUrl: 'https://maps.app.goo.gl/bGtKFTuxyZvJhsJZ9'
}

/** Văn phòng 2 — bãi hạ cánh. Toạ độ gốc: 22°18'35.2"N 103°52'32.8"E. */
export const LANDING_OFFICE: FlyingOffice = {
  roleKey: 'landingOffice',
  name: 'Cầu Lao Chải, Tả Van',
  shortAddress: 'Cầu Lao Chải, Xã Tả Van',
  address: 'Cầu Lao Chải, Xã Tả Van, Sa Pa, Lào Cai',
  latitude: 22.3097778,
  longitude: 103.8757778,
  mapUrl: 'https://maps.app.goo.gl/mYnh4KJVk3aQZLYC6'
}

export const OFFICES: FlyingOffice[] = [TAKEOFF_OFFICE, LANDING_OFFICE]

/** Giữ lại tên cũ để các chỗ đang dùng không phải sửa đồng loạt. */
export const TAKEOFF_NAME = TAKEOFF_OFFICE.name
export const TAKEOFF_MAP_URL = TAKEOFF_OFFICE.mapUrl
export const LANDING_MAP_URL = LANDING_OFFICE.mapUrl
