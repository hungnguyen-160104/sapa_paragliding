/**
 * Chèn tham số biến đổi vào URL ảnh Cloudinary.
 *
 * Ảnh bìa bài viết trước đây được nhúng thẳng bằng URL gốc, ví dụ:
 *   https://res.cloudinary.com/<cloud>/image/upload/v1785492768/posts/covers/abc.png
 * Không có tham số nào nên Cloudinary trả đúng file gốc: trung bình 0,64 MB
 * mỗi ảnh, cá biệt một file PNG nặng 4,39 MB. Trang /posts hiển thị 44 ảnh
 * bìa, tổng cộng ~28 MB cho một lần mở trang.
 *
 * Chỉ cần thêm tham số vào URL là Cloudinary tự xử lý, không phải tải lại ảnh:
 *   f_auto  - tự chọn định dạng tốt nhất trình duyệt hỗ trợ (WebP/AVIF)
 *   q_auto  - tự chọn mức nén theo nội dung ảnh
 *   c_limit - chỉ THU NHỎ khi ảnh lớn hơn, không bao giờ phóng to
 *   w_<n>   - giới hạn bề ngang theo đúng chỗ hiển thị
 *
 * Đo thực tế: giảm 82-99% dung lượng (692 KB -> 32 KB, 864 KB -> 12 KB).
 */

const UPLOAD_SEGMENT = '/image/upload/'

export function cloudinaryImage(url: string | null | undefined, width: number): string {
  if (!url) return ''

  if (!url.includes('res.cloudinary.com') || !url.includes(UPLOAD_SEGMENT)) {
    return url
  }

  const [prefix, rest] = url.split(UPLOAD_SEGMENT)
  if (!prefix || !rest) return url

  // Đoạn ngay sau /upload/ có dạng "v<số>" nghĩa là version — tức URL chưa
  // mang tham số biến đổi nào. Nếu khác thì ảnh đã được đặt tham số sẵn, giữ
  // nguyên để không chồng hai bộ tham số lên nhau.
  const firstSegment = rest.split('/')[0] ?? ''
  if (!/^v\d+$/.test(firstSegment)) return url

  return `${prefix}${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/${rest}`
}
