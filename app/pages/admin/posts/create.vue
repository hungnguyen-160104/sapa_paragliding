<template>
  <div />
</template>

<script setup lang="ts">
/**
 * Trang tạo bài cũ dùng PostForm — bản biên tập lỗi thời, KHÔNG có nút dịch
 * và thiếu các tính năng mới (bảng, chữ đậm/nghiêng, dịch từng ô). Không còn
 * liên kết nội bộ nào trỏ tới đây; chỉ còn bookmark cũ.
 *
 * Chuyển hướng về trình biên tập hiện đại ở /admin/posts, kèm ?create=1 để
 * editor mở sẵn ở chế độ tạo bài.
 */
definePageMeta({ layout: 'admin' })

const localePath = useLocalePath()

await navigateTo(`${localePath('/admin/posts')}?create=1`, { redirectCode: 302, replace: true })
</script>
