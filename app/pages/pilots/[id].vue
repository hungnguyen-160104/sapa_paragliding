<template>
    <div v-if="pilot" class="min-h-screen bg-fixed bg-cover bg-center"
        :style="{ backgroundImage: `url(${heroImage})` }">
        <!-- Fixed Background Overlay (below header) -->
        <div class="fixed inset-0 bg-black/40 pointer-events-none z-10"></div>

        <!-- Main Content -->
        <div class="relative z-20">
            <!-- Hero Section Full Width -->
            <section class="h-screen flex items-center px-4 md:px-8 lg:px-16">
                <div class="w-full max-w-7xl mx-auto">
                    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                        <!-- Left: Pilot Info (3 columns) -->
                        <div class="lg:col-span-3 text-white space-y-10">
                            <!-- Badge -->
                            <div
                                class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30">
                                <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <span class="text-red-300 text-sm font-medium uppercase tracking-wider">{{
                                    pilot.role }}</span>
                            </div>

                            <!-- Main Title -->
                            <div>
                                <h1 class="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-none mb-6"
                                    style="text-shadow: 4px 4px 16px rgba(0,0,0,0.8)">
                                    {{ pilot.name }}
                                </h1>
                                <div class="h-1.5 w-32 bg-gradient-to-r from-red-400 to-orange-500"></div>
                            </div>

                            <!-- Subtitle -->
                            <div class="space-y-4 max-w-xl">
                                <p class="text-lg text-slate-300">
                                    {{ currentLocale === 'vi' ? `Biệt danh: ` : `Nickname: ` }}
                                    <span class="font-bold text-red-300 italic">"{{ pilot.nickname }}"</span>
                                </p>
                            </div>

                            <!-- CTA Button -->
                            <div class="pt-4">
                                <button @click="localizedNavigateTo('/booking')"
                                    class="px-10 py-4 bg-red-500 text-white font-bold uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30">
                                    {{ currentLocale === 'vi' ? 'Đặt bay cùng tôi' : 'Fly with me' }}
                                </button>
                            </div>
                        </div>

                        <!-- Right: Large Overlapping Multi-Image Collage (2 columns) -->
                        <div class="lg:col-span-2 hidden lg:flex justify-center items-center">
                            <div class="relative w-[550px] h-[650px]">
                                <!-- Collage Images with overlapping layout -->
                                <div v-for="(image, index) in collageImages" :key="index"
                                    class="collage-item absolute overflow-hidden cursor-pointer transition-all duration-700 ease-out"
                                    :class="[
                                        hoveredImage === index
                                            ? 'z-[100] scale-110 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'
                                            : hoveredImage !== null
                                                ? 'opacity-20 blur-[2px] scale-95'
                                                : 'shadow-2xl',
                                    ]" :style="getCollagePosition(index)" @mouseenter="hoveredImage = index"
                                    @mouseleave="hoveredImage = null">
                                    <!-- Border glow on hover -->
                                    <div class="absolute inset-0 transition-all duration-500"
                                        :class="hoveredImage === index ? 'ring-4 ring-red-400/60' : 'ring-2 ring-white/30'">
                                    </div>

                                    <img :src="image" :alt="`${pilot.name} - ${index + 1}`"
                                        class="w-full h-full object-cover object-center transition-transform duration-700"
                                        :class="hoveredImage === index ? 'scale-105' : ''" @error="handleImageError" />

                                    <!-- Gradient overlay -->
                                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent transition-opacity duration-500"
                                        :class="hoveredImage === index ? 'opacity-0' : 'opacity-100'"></div>

                                    <!-- Image number indicator -->
                                    <div class="absolute bottom-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center font-bold text-slate-800 text-sm transition-all duration-300"
                                        :class="hoveredImage === index ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">
                                        {{ index + 1 }}
                                    </div>
                                </div>

                                <!-- Decorative elements -->
                                <div
                                    class="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-red-500/25 to-orange-500/15 -z-10">
                                </div>
                                <div
                                    class="absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-orange-500/20 to-red-500/10 -z-10">
                                </div>
                                <div class="absolute top-1/2 -right-6 w-3 h-24 bg-red-400/40 -z-10"></div>
                            </div>
                        </div>

                        <!-- Mobile: Single Image Fallback -->
                        <div class="lg:hidden flex justify-center items-center mt-8">
                            <div
                                class="w-full max-w-sm aspect-[3/4] overflow-hidden shadow-xl border-4 border-white/20">
                                <img v-if="contentImages[0]" :src="contentImages[0]" :alt="pilot.name"
                                    class="w-full h-full object-cover object-center" @error="handleImageError" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Content Section in Centered Card -->
            <section class="px-4 md:px-6 py-12 md:py-20">
                <div class="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div class="p-8 md:p-12 lg:p-16 space-y-16">
                        <!-- Bio Section -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-4">
                                <div class="h-1 w-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                                <h2 class="text-3xl md:text-4xl font-black text-gray-900">
                                    {{ currentLocale === 'vi' ? 'Về Tôi' : 'About Me' }}
                                </h2>
                            </div>
                            <p class="text-lg text-gray-700 leading-relaxed font-medium">
                                {{ pilot.des }}
                            </p>
                            <div
                                class="inline-block px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                                <p class="text-base text-gray-700">
                                    <span class="font-semibold text-gray-900">{{ currentLocale === 'vi' ? 'Biệt danh: '
                                        : 'Nickname: '
                                    }}</span>
                                    <span class="italic text-red-700 font-medium">{{ pilot.nickname }}</span>
                                </p>
                            </div>
                        </div>

                        <!-- Experience & Achievements Section -->
                        <div class="space-y-6">
                            <div class="flex items-center gap-4">
                                <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <h2 class="text-3xl md:text-4xl font-black text-gray-900">
                                    {{ currentLocale === 'vi' ? 'Kinh Nghiệm & Thành Tích' : 'Experience & Achievements'
                                    }}
                                </h2>
                            </div>
                            <ul class="space-y-3">
                                <li v-for="(item, idx) in achievements" :key="idx"
                                    class="flex items-start gap-4 p-4 rounded-lg hover:bg-red-50 transition-colors duration-200">
                                    <span class="text-red-600 font-bold text-xl flex-shrink-0 mt-1">✓</span>
                                    <span class="text-lg text-gray-700 font-medium leading-relaxed">{{ item }}</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Personality Section with Alternating Image -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div class="space-y-6 order-2 lg:order-1">
                                <div class="flex items-center gap-4">
                                    <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2 class="text-3xl md:text-4xl font-black text-gray-900">
                                        {{ currentLocale === 'vi' ? 'Cá Tính' : 'Personality' }}
                                    </h2>
                                </div>
                                <div class="space-y-4">
                                    <p v-for="(fact, idx) in funFacts" :key="idx"
                                        class="text-lg text-gray-700 italic leading-relaxed font-medium p-6 bg-gray-50 rounded-lg border-l-4 border-red-400">
                                        "{{ fact }}"
                                    </p>
                                </div>
                            </div>
                            <div class="order-1 lg:order-2">
                                <img v-if="contentImages[1]" :src="contentImages[1]" :alt="`Pilot ${pilot.name}`"
                                    class="w-full rounded-2xl shadow-lg object-cover h-96 hover:shadow-xl transition-shadow duration-300"
                                    @error="handleImageError" />
                            </div>
                        </div>

                        <!-- Gallery Section - Pilot Specific Overlapping Collage -->
                        <div class="space-y-8">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-red-500 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-3xl md:text-4xl font-black text-gray-900">
                                        {{ currentLocale === 'vi' ? 'Thư Viện Ảnh' : 'Photo Gallery' }}
                                    </h2>
                                    <p class="text-slate-500 text-sm">{{ galleryImages.length }} {{ currentLocale ===
                                        'vi' ? 'hình ảnh' :
                                        'photos' }}</p>
                                </div>
                            </div>

                            <!-- Large Overlapping Gallery Collage -->
                            <div class="relative w-full min-h-[600px] lg:min-h-[700px]">
                                <!-- Gallery grid with overlapping effect -->
                                <div v-for="(image, index) in galleryImages.slice(0, 7)" :key="index"
                                    class="absolute overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                                    :class="[
                                        hoveredGalleryImage === index
                                            ? 'z-[100] scale-125 rounded-xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] rotate-0 !important'
                                            : hoveredGalleryImage !== null
                                                ? 'opacity-30 blur-[3px] scale-90 grayscale-[0.5]'
                                                : 'shadow-xl hover:shadow-2xl grayscale-0',
                                    ]" :style="hoveredGalleryImage === index
                                        ? { ...getGalleryPosition(index), transform: 'rotate(0deg)', width: '45%', height: '60%', marginLeft: '-10%', marginTop: '-10%' }
                                        : getGalleryPosition(index)" @mouseenter="hoveredGalleryImage = index"
                                    @mouseleave="hoveredGalleryImage = null"> <!-- Border glow -->
                                    <div class="absolute inset-0 transition-all duration-500 pointer-events-none"
                                        :class="hoveredGalleryImage === index ? 'ring-4 ring-red-400/70' : 'ring-2 ring-white/40'">
                                    </div>

                                    <img :src="image" :alt="`${pilot.name} - Gallery ${index + 1}`"
                                        class="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                                        :class="hoveredGalleryImage === index ? 'scale-105' : ''"
                                        @error="handleImageError" />

                                    <!-- Gradient overlay -->
                                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent transition-opacity duration-500 pointer-events-none"
                                        :class="hoveredGalleryImage === index ? 'opacity-0' : 'opacity-100'"></div>

                                    <!-- Image info on hover -->
                                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/90 to-transparent transition-all duration-500"
                                        :class="hoveredGalleryImage === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
                                        <p class="text-white font-bold text-sm">{{ pilot.name }}</p>
                                        <p class="text-slate-300 text-xs">{{ currentLocale === 'vi' ? `Ảnh ${index + 1}`
                                            : `Photo ${index +
                                            1}` }}</p>
                                    </div>
                                </div>

                                <!-- Decorative elements -->
                                <div
                                    class="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/10 -z-10">
                                </div>
                                <div
                                    class="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-orange-500/15 to-red-500/10 -z-10">
                                </div>
                            </div>

                            <!-- Gallery description -->
                            <div class="text-center pt-8">
                                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                                    {{ currentLocale === 'vi'
                                        ? 'Những khoảnh khắc đáng nhớ từ các chuyến bay cùng ' + pilot.name
                                        : 'Memorable moments from flights with ' + pilot.name
                                    }}
                                </p>
                            </div>
                        </div>

                        <!-- Pilot Pagination Navigation -->
                        <div class="bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-lg">
                            <h3 class="text-xl font-bold text-gray-900 mb-6 text-center">
                                {{ currentLocale === 'vi' ? 'Khám phá các phi công khác' : 'Explore Other Pilots' }}
                            </h3>

                            <!-- Pagination Buttons -->
                            <div class="flex flex-wrap justify-center gap-3">
                                <button v-for="pilotNum in totalPilots" :key="pilotNum"
                                    @click="navigateToPilot(pilotNum)" class="relative group">
                                    <div :class="[
                                        'w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-lg md:text-xl',
                                        'border-2 rounded-none transition-all duration-300',
                                        currentPilotNumber === pilotNum
                                            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
                                    ]">
                                        {{ pilotNum }}
                                    </div>
                                    <!-- Active Indicator -->
                                    <div v-if="currentPilotNumber === pilotNum"
                                        class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full">
                                    </div>
                                    <!-- Tooltip -->
                                    <div
                                        class="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                                        {{ getPilotName(pilotNum) }}
                                        <div
                                            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45">
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <!-- Navigation Arrows -->
                            <div class="flex justify-center items-center gap-4 mt-6">
                                <button @click="navigateToPilot(currentPilotNumber - 1)"
                                    :disabled="currentPilotNumber <= 1" :class="[
                                        'flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-300 rounded-none border-2',
                                        currentPilotNumber <= 1
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-red-600 border-red-500 hover:bg-red-600 hover:text-white'
                                    ]">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span class="hidden sm:inline">{{ currentLocale === 'vi' ? 'Trước' : 'Prev'
                                    }}</span>
                                </button>

                                <span class="text-gray-600 font-medium">
                                    {{ currentPilotNumber }} / {{ totalPilots }}
                                </span>

                                <button @click="navigateToPilot(currentPilotNumber + 1)"
                                    :disabled="currentPilotNumber >= totalPilots" :class="[
                                        'flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-300 rounded-none border-2',
                                        currentPilotNumber >= totalPilots
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-red-600 border-red-500 hover:bg-red-600 hover:text-white'
                                    ]">
                                    <span class="hidden sm:inline">{{ currentLocale === 'vi' ? 'Tiếp' : 'Next' }}</span>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- Pilot Not Found -->
    <div v-else class="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div class="text-center px-6">
            <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-4xl font-bold text-gray-900 mb-4">
                {{
                    currentLocale === 'vi' ? 'Không tìm thấy phi công' : 'Pilot Not Found' }}
            </h2>
            <p class="text-lg text-gray-600 mb-8">
                {{
                    currentLocale === 'vi' ?
                        'Phi công bạn tìm kiếm không tồn tại hoặc đã bị xóa.' :
                        'The pilot you are looking for does not exist or has been removed.'
                }}
            </p>
            <button @click="localizedNavigateTo('/pilots')"
                class="text-red-600 hover:text-red-700 font-semibold text-lg inline-flex items-center gap-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {{ currentLocale === 'vi' ? 'Quay lại danh sách' : 'Back to Pilots' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const pilotId = route.params.id as string

const currentLocale = computed(() => locale.value || 'vi')

const toggleLanguage = () => {
    locale.value = currentLocale.value === 'vi' ? 'en' : 'vi'
}

const localizedNavigateTo = (path: string) => {
    const fullPath = currentLocale.value === 'vi' ? path : `/${currentLocale.value}${path}`
    router.push(fullPath)
}

// Total number of pilots
const totalPilots = 14

// Current pilot number (extract from pilotId)
const currentPilotNumber = computed(() => {
    const num = parseInt(pilotId.replace('pilot', ''))
    return isNaN(num) ? 1 : num
})

// Navigate to specific pilot
const navigateToPilot = (pilotNum: number) => {
    if (pilotNum < 1 || pilotNum > totalPilots) return
    const path = `/pilots/pilot${pilotNum}`
    localizedNavigateTo(path)
}

// Get pilot name for tooltip
const getPilotName = (pilotNum: number): string => {
    try {
        return t(`pilots.pilot${pilotNum}.name`)
    } catch {
        return `Pilot ${pilotNum}`
    }
}

// Get pilot data from i18n
const pilot = computed(() => {
    try {
        return {
            name: t(`pilots.${pilotId}.name`),
            nickname: t(`pilots.${pilotId}.nickname`),
            role: t(`pilots.${pilotId}.role`),
            des: t(`pilots.${pilotId}.des`),
            img: t(`pilots.${pilotId}.img`),
            fullname: t(`pilots.${pilotId}.fullname`),
            experience: t(`pilots.${pilotId}.experience`),
            records: t(`pilots.${pilotId}.records`),
            personality: t(`pilots.${pilotId}.personality`)
        }
    } catch (error) {
        return null
    }
})

// Generate gallery images from folder structure
const galleryImages = computed(() => {
    const images: string[] = []

    // Extract pilot number from pilotId (e.g., "pilot1" -> "1")
    const pilotNumber = pilotId.replace('pilot', '')
    const basePath = `/images/pilots/pilot${pilotNumber}`

    // Add header images (header1.png to header5.png)
    for (let i = 1; i <= 5; i++) {
        images.push(`${basePath}/header${i}.png`)
    }

    // Add body images (body1.png to body2.png)
    for (let i = 1; i <= 2; i++) {
        images.push(`${basePath}/body${i}.png`)
    }

    return images
})

// Hero section collage (first 5 images)
const heroCollage = computed(() => galleryImages.value.slice(0, 5))

// Content section images (images 5-8)
const contentImages = computed(() => galleryImages.value.slice(5, 8))

// Collage images for hero (first 4 images)
const collageImages = computed(() => galleryImages.value.slice(0, 4))

// Hovered image state for collage interaction
const hoveredImage = ref<number | null>(null)

// Get collage position for overlapping layout - Large modern style
const getCollagePosition = (index: number): Record<string, string> => {
    const defaultPosition: Record<string, string> = {
        top: '0',
        left: '20px',
        width: '340px',
        height: '420px',
        zIndex: '10',
        transform: 'rotate(-3deg)'
    }
    const positions: Record<string, string>[] = [
        // Main image - left side, slightly tilted
        defaultPosition,
        // Second image - overlapping right, tilted opposite
        {
            top: '40px',
            left: '200px',
            width: '320px',
            height: '400px',
            zIndex: '20',
            transform: 'rotate(4deg)'
        },
        // Third image - bottom left corner  
        {
            top: '280px',
            left: '-20px',
            width: '280px',
            height: '350px',
            zIndex: '15',
            transform: 'rotate(-6deg)'
        },
        // Fourth image - bottom right, most forward
        {
            top: '300px',
            left: '240px',
            width: '260px',
            height: '320px',
            zIndex: '25',
            transform: 'rotate(2deg)'
        },
    ]
    const result = positions[index]
    return result !== undefined ? result : defaultPosition
}

// Hovered image state for gallery interaction
const hoveredGalleryImage = ref<number | null>(null)

// Get gallery position for large overlapping layout
const getGalleryPosition = (index: number): Record<string, string> => {
    const defaultPosition: Record<string, string> = { top: '0', left: '0', width: '20%', height: '20%', zIndex: '10' }
    const positions: Record<string, string>[] = [
        // Image 1: Main Center Top (Large)
        { top: '5%', left: '32%', width: '36%', height: '50%', zIndex: '30', transform: 'rotate(-2deg)' },
        // Image 2: Left Top
        { top: '0%', left: '2%', width: '28%', height: '40%', zIndex: '20', transform: 'rotate(4deg)' },
        // Image 3: Right Top
        { top: '4%', left: '70%', width: '28%', height: '42%', zIndex: '20', transform: 'rotate(-3deg)' },
        // Image 4: Left Bottom
        { top: '42%', left: '0%', width: '30%', height: '45%', zIndex: '25', transform: 'rotate(-5deg)' },
        // Image 5: Right Bottom
        { top: '50%', left: '65%', width: '33%', height: '43%', zIndex: '25', transform: 'rotate(3deg)' },
        // Image 6: Bottom Center
        { top: '52%', left: '28%', width: '35%', height: '40%', zIndex: '35', transform: 'rotate(1deg)' },
        // Image 7: Middle Right Filler
        { top: '30%', left: '82%', width: '18%', height: '25%', zIndex: '15', transform: 'rotate(6deg)' },
    ]
    const result = positions[index]
    return result !== undefined ? result : defaultPosition
}

// Hero background image
const heroImage = computed(() => {
    return `/images/G0035374.JPG`
})

// Parse achievements from experience text
const achievements = computed(() => {
    if (!pilot.value?.experience) return []
    return pilot.value.experience.split('\n').filter(line => line.trim())
})

// Parse fun facts from personality text
const funFacts = computed(() => {
    if (!pilot.value?.personality) return []
    return pilot.value.personality.split('\n').filter(line => line.trim())
})

const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = 'https://via.placeholder.com/800x600?text=Pilot'
}

// SEO
useHead({
    title: computed(() => pilot.value ? `${pilot.value.fullname} - Sapa Paragliding` : 'Pilot - Sapa Paragliding'),
    meta: computed(() => [
        {
            name: 'description',
            content: pilot.value ? pilot.value.des : 'Meet our professional paragliding pilots'
        }
    ])
})
</script>
