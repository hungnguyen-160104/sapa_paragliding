<template>
  <div />
</template>

<script setup lang="ts">
/**
 * Trang sửa bài cũ dùng PostForm — lỗi thời, không có nút dịch. Chuyển hướng
 * về trình biên tập hiện đại, kèm ?edit=<id> để mở sẵn đúng bài.
 */
definePageMeta({ layout: 'admin' })

const route = useRoute()
const localePath = useLocalePath()

await navigateTo(`${localePath('/admin/posts')}?edit=${encodeURIComponent(String(route.params.id))}`, {
  redirectCode: 302,
  replace: true
})
</script>
