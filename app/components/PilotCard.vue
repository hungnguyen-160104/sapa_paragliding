<template>
    <div class="group cursor-pointer bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        @click="navigateToPilot">
        <!-- Image Container -->
        <div class="relative overflow-hidden aspect-[4/5]">
            <!-- Main Image -->
            <NuxtImg :src="`/images/pilots/${currentImage}`" :alt="pilotData.name" format="webp"
                class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                width="400" height="500"
                @error="handleImageError" />

            <!-- Gallery Navigation -->
            <div v-if="galleryImages.length > 1"
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button @click.stop="previousImage"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-lg transition-all"
                    aria-label="Previous image">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button @click.stop="nextImage"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-lg transition-all"
                    aria-label="Next image">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <!-- Image Indicators -->
                <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    <button v-for="(img, index) in galleryImages" :key="index" @click.stop="currentImageIndex = index"
                        class="w-2 h-2 transition-all"
                        :class="currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'"
                        :aria-label="`Go to image ${index + 1}`" />
                </div>
            </div>

            <!-- Gradient Overlay -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />

            <!-- Role Badge -->
            <div class="absolute top-4 left-4">
                <span
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                    <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                    {{ pilotData.role }}
                </span>
            </div>

            <!-- Pilot Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-5">
                <h3 class="text-xl font-black text-white mb-1">{{ pilotData.name }}</h3>
                <p class="text-sm text-slate-300 italic">"{{ pilotData.nickname }}"</p>
            </div>
        </div>

        <!-- Content Section -->
        <div class="p-5">
            <!-- Description Preview -->
            <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                {{ pilotData.des }}
            </p>

            <!-- NuxtLink chứ không phải button: cả thẻ chỉ có @click nên trong HTML
                 không tồn tại một thẻ <a href> nào dẫn tới trang phi công — bot không
                 lần tới được, người dùng cũng không mở được tab mới. Bấm cả thẻ vẫn
                 chạy như cũ, .stop để không điều hướng hai lần. -->
            <NuxtLink :to="pilotHref" @click.stop
                class="block w-full py-3 text-center border-2 border-red-600 text-red-600 font-bold uppercase tracking-wider text-sm hover:bg-red-600 hover:text-white transition-all duration-300">
                {{ $t('buttons.viewMore') }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { pilotPath, type PilotKey } from '~~/shared/pilots'

const props = defineProps<{
    pilotId: number
}>()

const { t } = useI18n()
const localePath = useLocalePath()

/**
 * Địa chỉ trang phi công: /pilots/<slug-tên>, dựng qua localePath().
 *
 * Bản cũ tự ghép tiền tố ngôn ngữ ("vi thì không thêm gì, khác vi thì thêm
 * /<locale>") — sai, vì site prefix cả tiếng Việt, nên mọi cú bấm ở bản tiếng
 * Việt đẩy tới /pilots/... không có route và ra thẳng 404. localePath() biết
 * đúng luật của cấu hình i18n.
 */
const pilotKey = computed(() => `pilot${props.pilotId}` as PilotKey)
const pilotHref = computed(() => localePath(pilotPath(pilotKey.value)))

// Get pilot data from i18n
const pilotData = computed(() => {
    const pilotKey = `pilot${props.pilotId}`
    return {
        id: pilotKey,
        name: t(`pilots.${pilotKey}.name`),
        nickname: t(`pilots.${pilotKey}.nickname`),
        role: t(`pilots.${pilotKey}.role`),
        des: t(`pilots.${pilotKey}.des`),
        img: t(`pilots.${pilotKey}.img`)
    }
})

// Gallery functionality
const currentImageIndex = ref(0)

// Get gallery images - try to get from i18n, fallback to main image
const galleryImages = computed(() => {
    const pilotKey = `pilot${props.pilotId}`
    try {
        const gallery = t(`pilots.${pilotKey}.gallery`)
        // If gallery exists and is an array, use it
        if (gallery && Array.isArray(gallery) && gallery.length > 0) {
            return gallery
        }
    } catch (e) {
        // Gallery doesn't exist, use main image only
    }
    // Fallback to main image
    return [pilotData.value.img]
})

const currentImage = computed(() => {
    return galleryImages.value[currentImageIndex.value] || pilotData.value.img
})

const nextImage = () => {
    currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length
}

const previousImage = () => {
    currentImageIndex.value = currentImageIndex.value === 0
        ? galleryImages.value.length - 1
        : currentImageIndex.value - 1
}

const navigateToPilot = () => {
    navigateTo(pilotHref.value)
}

const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/images/placeholder-pilot.jpg'
}
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
}
</style>
