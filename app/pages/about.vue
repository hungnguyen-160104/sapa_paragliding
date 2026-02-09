<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Hero Section - Large Image + 3 Small Images Grid -->
        <section class="relative min-h-[85vh] lg:min-h-[90vh]">
            <!-- Main Hero Image - Top -->
            <div class="relative h-[55vh] lg:h-[65vh] w-full overflow-hidden">
                <img src="/images/header-pic.jpeg" alt="Sapa Paragliding" class="w-full h-full object-cover" />
                <!-- Overlay for readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                <div class="absolute inset-0 bg-gradient-to-l from-slate-900/70 via-transparent to-transparent" />

                <!-- Main Content - Bottom Right -->
                <div class="absolute bottom-0 right-0 p-6 md:p-10 lg:p-16 max-w-2xl text-right">
                    <!-- Badge -->
                    <div
                        class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-4 border border-white/20">
                        <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-sm font-medium text-white">{{ $t('about.intro.highlight') }}</span>
                    </div>

                    <!-- Title -->
                    <h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        {{ $t('about.title') }}
                    </h1>

                    <!-- Subtitle -->
                    <p class="text-base md:text-lg lg:text-xl text-slate-200 mb-4 leading-relaxed">
                        {{ $t('about.subtitle') }}
                    </p>

                    <!-- Tagline -->
                    <p class="text-sm md:text-base text-red-300 italic">
                        "{{ $t('about.tagline') }}"
                    </p>
                </div>
            </div>

            <!-- 3 Small Images Grid - Bottom -->
            <div class="grid grid-cols-1 md:grid-cols-3 h-[30vh] lg:h-[25vh]">
                <!-- Image 1 -->
                <div class="relative overflow-hidden group">
                    <img src="/images/gallery/1. Soar above Sapa valley.JPG" alt="Paragliding Experience 1"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-transparent" />
                    <!-- Content - Top Left -->
                    <div class="absolute top-0 left-0 p-4 md:p-6">
                        <span
                            class="inline-block px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-full mb-2">
                            01
                        </span>
                        <h3 class="text-white font-bold text-lg md:text-xl drop-shadow-lg">
                            {{ $t('about.values.safety.title') }}
                        </h3>
                        <p class="text-slate-300 text-xs md:text-sm mt-1 max-w-[200px]">
                            {{ $t('about.mission.points.safety') }}
                        </p>
                    </div>
                </div>

                <!-- Image 2 -->
                <div class="relative overflow-hidden group hidden md:block">
                    <img src="/images/gallery/2. Sunset flight.jpg" alt="Paragliding Experience 2"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-transparent" />
                    <!-- Content - Top Left -->
                    <div class="absolute top-0 left-0 p-4 md:p-6">
                        <span
                            class="inline-block px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-full mb-2">
                            02
                        </span>
                        <h3 class="text-white font-bold text-lg md:text-xl drop-shadow-lg">
                            {{ $t('about.values.excellence.title') }}
                        </h3>
                        <p class="text-slate-300 text-xs md:text-sm mt-1 max-w-[200px]">
                            {{ $t('about.mission.points.experience') }}
                        </p>
                    </div>
                </div>

                <!-- Image 3 -->
                <div class="relative overflow-hidden group hidden md:block">
                    <img src="/images/gallery/3. Mountain peak.jpg" alt="Paragliding Experience 3"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-transparent" />
                    <!-- Content - Top Left -->
                    <div class="absolute top-0 left-0 p-4 md:p-6">
                        <span
                            class="inline-block px-3 py-1 bg-orange-600/90 text-white text-xs font-bold rounded-full mb-2">
                            03
                        </span>
                        <h3 class="text-white font-bold text-lg md:text-xl drop-shadow-lg">
                            {{ $t('about.values.passion.title') }}
                        </h3>
                        <p class="text-slate-300 text-xs md:text-sm mt-1 max-w-[200px]">
                            {{ $t('about.mission.points.nature') }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- CTA Buttons - Floating on Main Image -->
            <div class="absolute bottom-[32vh] lg:bottom-[27vh] left-0 p-6 md:p-10 lg:p-16 z-20">
                <div class="flex flex-col sm:flex-row gap-3">
                    <button @click="localizedNavigateTo('/pilots')"
                        class="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ $t('menu.pilots') }}
                    </button>
                </div>
            </div>

            <!-- Scroll Indicator -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-20 hidden lg:block">
                <div class="flex flex-col items-center gap-2">
                    <span class="text-white/70 text-xs uppercase tracking-widest">{{ $t('common.scroll') }}</span>
                    <svg class="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
        <!-- Our Story & Timeline -->
        <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div class="container-custom">
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-16">
                        <span
                            class="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                            {{ $t('about.story.founded') }}
                        </span>
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {{ $t('about.story.title') }}
                        </h2>
                        <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                            {{ $t('about.story.description') }}
                        </p>
                    </div>

                    <!-- Timeline -->
                    <div class="relative">
                        <!-- Timeline Line -->
                        <div
                            class="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-orange-500 to-red-600 transform md:-translate-x-1/2">
                        </div>

                        <div class="space-y-12">
                            <div v-for="(year, index) in ['2010', '2015', '2020', '2024']" :key="year"
                                class="relative flex items-start gap-6 md:gap-0"
                                :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'">
                                <!-- Timeline dot -->
                                <div
                                    class="absolute left-8 md:left-1/2 w-4 h-4 bg-red-600 rounded-full transform -translate-x-1/2 border-4 border-white shadow-lg z-10">
                                </div>

                                <!-- Year badge -->
                                <div class="flex-shrink-0 ml-16 md:ml-0 md:w-1/2"
                                    :class="index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'">
                                    <div
                                        class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full text-white font-bold text-lg shadow-lg">
                                        {{ year }}
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 md:w-1/2 ml-16 md:ml-0"
                                    :class="index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'">
                                    <div
                                        class="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                        <p class="text-gray-700 leading-relaxed">{{ $t(`about.story.milestones.${year}`)
                                            }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Choose Us - Features Grid -->
        <section class="py-20 bg-white relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-5">
                <div class="absolute inset-0"
                    style="background-image: url('/images/svg/hero-shape.svg'); background-size: cover;"></div>
            </div>

            <div class="container-custom relative z-10">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {{ $t('about.whyChoose.title') }}
                    </h2>
                    <div class="w-24 h-1.5 bg-gradient-to-r from-red-600 to-orange-600 mx-auto rounded-full"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    <!-- Feature Cards -->
                    <div v-for="(feature, index) in features" :key="index"
                        class="group bg-white rounded-2xl shadow-lg p-6 lg:p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                        <div :class="feature.bgColor"
                            class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <component :is="feature.icon" :class="feature.iconColor" class="w-8 h-8" />
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-3">{{ $t(feature.title) }}</h3>
                        <p class="text-gray-600 leading-relaxed">{{ $t(feature.description) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Flight Process -->
        <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div class="container-custom">
                <div class="max-w-4xl mx-auto">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {{ $t('about.process.title') }}
                        </h2>
                        <div class="w-24 h-1.5 bg-gradient-to-r from-red-600 to-orange-600 mx-auto rounded-full"></div>
                    </div>

                    <div class="space-y-6">
                        <div v-for="(step, index) in processSteps" :key="index"
                            class="flex items-start gap-6 bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div
                                class="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
                                {{ index + 1 }}
                            </div>
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">
                                    {{ $t(`about.process.step${index + 1}.title`) }}
                                </h3>
                                <p class="text-gray-700 leading-relaxed">
                                    {{ $t(`about.process.step${index + 1}.description`) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section
            class="py-20 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white relative overflow-hidden">
            <!-- Decorative Elements -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2">
                </div>
                <div class="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3">
                </div>
            </div>

            <div class="container-custom text-center relative z-10">
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    {{ $t('about.whyChoose.cta.title') }}
                </h2>
                <p class="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
                    {{ $t('about.whyChoose.cta.description') }}
                </p>
                <button @click="localizedNavigateTo('/booking')"
                    class="px-10 py-4 bg-white text-red-600 font-bold text-lg rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ $t('buttons.book') }}
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const processSteps = [1, 2, 3, 4, 5]
const router = useRouter()
const { locale } = useI18n()

// Feature icons as functional components
const ShieldIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
])

const UsersIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

const StarIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
])

const CameraIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z' })
])

const CurrencyIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const LanguageIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' })
])

const features = [
    { icon: ShieldIcon, title: 'about.features.safety.title', description: 'about.features.safety.description', bgColor: 'bg-gradient-to-br from-red-500 to-red-600', iconColor: 'text-white' },
    { icon: UsersIcon, title: 'about.features.expertTeam.title', description: 'about.features.expertTeam.description', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600', iconColor: 'text-white' },
    { icon: StarIcon, title: 'about.features.bestExperience.title', description: 'about.features.bestExperience.description', bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600', iconColor: 'text-white' },
    { icon: CameraIcon, title: 'about.features.professionalPhoto.title', description: 'about.features.professionalPhoto.description', bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500', iconColor: 'text-white' },
    { icon: CurrencyIcon, title: 'about.features.bestValue.title', description: 'about.features.bestValue.description', bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600', iconColor: 'text-white' },
    { icon: LanguageIcon, title: 'about.features.multiLanguage.title', description: 'about.features.multiLanguage.description', bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600', iconColor: 'text-white' },
]

const localizedNavigateTo = (path: string) => {
    const currentLocale = locale.value || 'vi'
    const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`
    router.push(fullPath)
}

// SEO
useHead({
    title: 'About Us - Sapa Paragliding',
    meta: [
        { name: 'description', content: 'Learn about Sapa Paragliding - your trusted partner for unforgettable flying experiences in Sapa, Vietnam' }
    ]
})
</script>

<style scoped>
/* Animation keyframes */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fade-in-up-delay {
    animation: fadeInUp 0.8s ease-out 0.2s forwards;
    opacity: 0;
}

.animate-fade-in-up-delay-2 {
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
    opacity: 0;
}

.animate-fade-in-up-delay-3 {
    animation: fadeInUp 0.8s ease-out 0.6s forwards;
    opacity: 0;
}
</style>
