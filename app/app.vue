<template>
  <div>
    <NuxtRouteAnnouncer />
    <Header v-if="!isAdminRoute" :key="'header-' + isAdminRoute" />
    <NuxtLayout :key="route.fullPath">
      <NuxtPage :key="route.fullPath" />
    </NuxtLayout>
    <ChatButtons v-if="!isAdminRoute" :key="'chat-' + isAdminRoute" />
    <Footer v-if="!isAdminRoute" :key="'footer-' + isAdminRoute" />
  </div>
</template>

<script setup lang="ts">
import { buildLocalBusinessJsonLD } from '~/utils/seo'

const route = useRoute()
const { locale } = useI18n()
const config = useRuntimeConfig()

useHead(() => {
  const scripts = config.public.gaId
    ? [
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${config.public.gaId}`,
          async: true,
          defer: true
        },
        {
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.public.gaId}', { send_page_view: false });
          `,
          defer: true
        }
      ]
    : []

  const localBusinessScript = !route.path.includes('/admin')
    ? [{ type: 'application/ld+json', children: JSON.stringify(buildLocalBusinessJsonLD(locale.value)) }]
    : []

  return {
    htmlAttrs: {
      lang: locale.value || 'vi'
    },
    script: [...scripts, ...localBusinessScript]
  }
})

const isAdminRoute = computed(() => {
  return route.path.includes('/admin')
})
</script>

<style>
/* Page transition effects */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Alternative: Fade and Scale effect */
/* 
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
*/

/* Alternative: Slide effect */
/*
.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
*/
</style>