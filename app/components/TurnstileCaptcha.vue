<template>
    <div class="turnstile-container">
        <div ref="turnstileRef" class="cf-turnstile"></div>
        <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    siteKey?: string
}>()

const emit = defineEmits<{
    (e: 'verify', token: string): void
    (e: 'expire'): void
    (e: 'error', error: string): void
}>()

const turnstileRef = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)
const error = ref<string | null>(null)
const config = useRuntimeConfig()

// Use environment variable or prop for site key
const siteKey = computed(() => props.siteKey || config.public.turnstileSiteKey)

const loadTurnstileScript = () => {
    return new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).turnstile) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
        script.async = true
        script.defer = true

        ;(window as any).onTurnstileLoad = () => {
            resolve()
        }

        script.onerror = () => {
            reject(new Error('Failed to load Turnstile script'))
        }

        document.head.appendChild(script)
    })
}

const renderWidget = () => {
    if (!turnstileRef.value || !(window as any).turnstile) return

    // Remove existing widget if any
    if (widgetId.value) {
        try {
            ;(window as any).turnstile.remove(widgetId.value)
        } catch (e) {
            // Widget might not exist
        }
    }

    widgetId.value = (window as any).turnstile.render(turnstileRef.value, {
        sitekey: siteKey.value,
        callback: (token: string) => {
            error.value = null
            emit('verify', token)
        },
        'expired-callback': () => {
            emit('expire')
        },
        'error-callback': (err: string) => {
            error.value = 'Verification failed. Please try again.'
            emit('error', err)
        },
        theme: 'light',
        language: 'auto'
    })
}

// Reset the widget (useful after form submission)
const reset = () => {
    if (widgetId.value && (window as any).turnstile) {
        ;(window as any).turnstile.reset(widgetId.value)
    }
}

// Expose reset method to parent
defineExpose({ reset })

onMounted(async () => {
    try {
        await loadTurnstileScript()
        renderWidget()
    } catch (e) {
        console.error('Turnstile load error:', e)
        error.value = 'Failed to load verification widget'
        emit('error', 'script_load_failed')
    }
})

onBeforeUnmount(() => {
    if (widgetId.value && typeof window !== 'undefined' && (window as any).turnstile) {
        try {
            ;(window as any).turnstile.remove(widgetId.value)
        } catch (e) {
            // Widget might not exist
        }
    }
})
</script>

<style scoped>
.turnstile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cf-turnstile {
    margin: 0 auto;
}
</style>
