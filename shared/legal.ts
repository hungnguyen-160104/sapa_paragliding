/**
 * Thông tin PHÁP NHÂN chủ sở hữu website — nguồn duy nhất cho footer, các
 * trang chính sách (/policies/...) và logo "Đã thông báo Bộ Công Thương".
 *
 * Đây là thông tin bắt buộc phải công bố khi thông báo website thương mại
 * điện tử bán hàng với Bộ Công Thương (Nghị định 52/2013/NĐ-CP, sửa bởi
 * 85/2021/NĐ-CP; Thông tư 47/2014/TT-BCT). Chủ chỉ cần điền ĐÚNG MỘT CHỖ này,
 * toàn bộ website tự cập nhật.
 *
 * Cách điền: thay chuỗi "[CẦN ĐIỀN: ...]" bằng giá trị thật, chép NGUYÊN VĂN
 * từ Giấy chứng nhận đăng ký doanh nghiệp.
 *
 * Trường nào còn là "[CẦN ĐIỀN: ...]" thì:
 *   • bản production (build) TỰ ẨN dòng đó, khách không thấy chữ giữ chỗ;
 *   • bản dev (npm run dev) vẫn hiện, tô vàng, để chủ nhìn thấy chỗ còn thiếu.
 *
 * TUYỆT ĐỐI KHÔNG đưa lên đây: số định danh cá nhân (CCCD), ngày sinh, địa chỉ
 * liên lạc cá nhân của người đại diện — web chỉ cần họ tên và chức danh.
 *
 * Hotline / email / văn phòng Sa Pa phục vụ KHÁCH vẫn giữ nguyên ở
 * components/Footer.vue và shared/flying-site.ts; khối này chỉ bổ sung thông
 * tin pháp nhân.
 */

export const PLACEHOLDER_PREFIX = '[CẦN ĐIỀN'

/** true khi trường đã được chủ điền giá trị thật (không rỗng, không còn giữ chỗ). */
export function isLegalValueFilled(value: string | null | undefined): value is string {
  return Boolean(value && value.trim() && !value.trim().startsWith(PLACEHOLDER_PREFIX))
}

export interface CompanyLegalInfo {
  /** Tên doanh nghiệp viết bằng tiếng Việt, đúng như trên Giấy CN ĐKDN. */
  name: string
  /** Tên doanh nghiệp viết bằng tiếng nước ngoài (nếu Giấy CN ĐKDN có ghi). */
  nameEn: string
  /** Tên viết tắt (nếu có). */
  shortName: string
  /** Tên rút gọn tiếng Việt cho footer ("CTCP ..."). */
  footerName: string
  /** Mã số doanh nghiệp (đồng thời là mã số thuế). */
  taxCode: string
  /** Ngày đăng ký lần đầu, dạng dd/mm/yyyy. */
  firstRegisteredDate: string
  /** Lần thay đổi gần nhất, ví dụ "đăng ký thay đổi lần 2 ngày dd/mm/yyyy" — để trống nếu chưa thay đổi. */
  latestChange: string
  /** Cơ quan cấp. */
  issuedBy: string
  /** Địa chỉ trụ sở chính. */
  headOffice: string
  /** Điện thoại của pháp nhân. */
  phone: string
  /** Email của pháp nhân. */
  email: string
  /** Người đại diện theo pháp luật: CHỈ họ tên. */
  representative: string
  /** Chức danh người đại diện, ví dụ "Giám đốc". */
  representativeTitle: string
}

export const COMPANY: CompanyLegalInfo = {
  // Chép nguyên văn từ Giấy chứng nhận đăng ký doanh nghiệp.
  name: 'CÔNG TY CỔ PHẦN THỂ THAO VÀ DU LỊCH DÙ LƯỢN SA PA',
  nameEn: 'SAPA PARAGLIDING SPORTS AND TOURISM JOINT STOCK COMPANY',
  shortName: 'SAPA PARAGLIDING .,JSC',
  // Tên rút gọn hiện ở dòng đầu footer, theo đúng định dạng chủ chốt:
  // "CTCP THỂ THAO VÀ DU LỊCH DÙ LƯỢN SA PA (5300829527)".
  footerName: 'CTCP THỂ THAO VÀ DU LỊCH DÙ LƯỢN SA PA',
  taxCode: '5300829527',
  firstRegisteredDate: '15/01/2025',
  // Chưa đăng ký thay đổi lần nào. Khi có: 'đăng ký thay đổi lần 1 ngày dd/mm/yyyy'.
  latestChange: '',
  issuedBy: 'Phòng Đăng ký kinh doanh – Sở Kế hoạch và Đầu tư tỉnh Lào Cai',
  headOffice: 'Tổ 3, Phường Cầu Mây, Thị xã Sa Pa, Tỉnh Lào Cai, Việt Nam',
  phone: '0964073555',
  email: 'sapa.paragliding@gmail.com',
  representative: 'Đặng Văn Mỹ',
  representativeTitle: 'Giám đốc'
}

/**
 * Tài khoản ngân hàng nhận chuyển khoản — CHỈ tài khoản đứng tên
 * CÔNG TY CỔ PHẦN THỂ THAO VÀ DU LỊCH DÙ LƯỢN SA PA. Không bao giờ công khai
 * tài khoản cá nhân trên website.
 *
 * TODO(chủ): điền TK đứng tên CÔNG TY CỔ PHẦN THỂ THAO VÀ DU LỊCH DÙ LƯỢN SA PA, ví dụ
 *   { bank: 'Ngân hàng ...', accountNumber: '...', accountHolder: 'CONG TY CO PHAN THE THAO VA DU LICH DU LUON SA PA' }
 * Khi còn null: trang Chính sách thanh toán ghi "Nhân viên sẽ gửi thông tin
 * chuyển khoản của công ty khi xác nhận đặt chỗ".
 */
export const COMPANY_BANK_ACCOUNT: { bank: string; accountNumber: string; accountHolder: string } | null = null

/**
 * Kênh hỗ trợ KHÁCH HÀNG (đặt bay, khiếu nại) — chính là hotline/email đang
 * hiện ở footer từ trước, gom về đây để các trang chính sách dùng chung.
 */
export const CUSTOMER_SUPPORT = {
  hotline: '+84 386 887 489',
  email: 'sapa.paragliding@gmail.com',
  zaloUrl: 'https://zalo.me/84386887489',
  whatsappUrl: 'https://wa.me/84386887489'
}

/**
 * Logo "Đã thông báo Bộ Công Thương".
 *
 * Khi còn null: KHÔNG hiển thị gì.
 * Khi Bộ Công Thương duyệt hồ sơ trên online.gov.vn, họ cấp một đường dẫn dạng
 *   http://online.gov.vn/Home/WebDetails/XXXXX
 * >>> CÓ MÃ TỪ BỘ THÌ CHỈ SỬA DÒNG NÀY: thay null bằng chuỗi URL đó. <<<
 */
export const BCT_NOTICE_URL: string | null = null

/** Ảnh logo do Bộ Công Thương cung cấp — không cần sửa. */
export const BCT_NOTICE_LOGO_SRC = 'http://online.gov.vn/Content/EndUserResources/Images/logoSaleNoti.png'

/**
 * Các trang chính sách: slug = đường dẫn /policies/<slug>.
 * Nội dung nằm ở app/data/policies/<ngôn ngữ>.json; nhãn ở i18n key
 * legal.policies.<key>.
 */
export const POLICY_PAGES = [
  { key: 'terms', slug: 'terms' },
  { key: 'payment', slug: 'payment' },
  { key: 'cancellation', slug: 'cancellation-refund' },
  { key: 'service', slug: 'service' },
  { key: 'privacy', slug: 'privacy' },
  { key: 'complaints', slug: 'complaints' }
] as const

export type PolicyKey = (typeof POLICY_PAGES)[number]['key']

/**
 * Nội dung chính sách có bản riêng cho các ngôn ngữ này. Ngôn ngữ khác
 * (fr, ru, zh, hi, ko, de) hiển thị bản tiếng Anh; bản tiếng Việt là bản có
 * hiệu lực pháp lý.
 */
export const POLICY_CONTENT_LOCALES = ['vi', 'en'] as const
