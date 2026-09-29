<template>
  <!-- Logo "Đã thông báo Bộ Công Thương". Chưa có mã từ Bộ (BCT_NOTICE_URL =
       null trong shared/legal.ts) thì không render gì cả.
       Có mã từ Bộ thì CHỈ sửa BCT_NOTICE_URL trong shared/legal.ts. -->
  <a v-if="BCT_NOTICE_URL" :href="BCT_NOTICE_URL" target="_blank" rel="noopener" class="inline-block">
    <img :src="BCT_NOTICE_LOGO_SRC" alt="Đã thông báo Bộ Công Thương" width="150" height="57" loading="lazy" />
  </a>
</template>

<script setup lang="ts">
import { BCT_NOTICE_LOGO_SRC, BCT_NOTICE_URL } from '~~/shared/legal'
</script>
