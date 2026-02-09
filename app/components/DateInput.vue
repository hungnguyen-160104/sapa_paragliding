<template>
    <input ref="inputRef" :type="inputType" :value="displayValue" @input="handleInput" @focus="onFocus" @blur="onBlur"
        @click="onClick" class="input-field" :min="min" :max="max" :required="required" placeholder="dd/mm/yyyy"
        :lang="currentLocale" />
</template>

<script setup lang="ts">
const { locale } = useI18n()
const currentLocale = computed(() => {
    // Map our locale codes to standard locale codes for date picker
    const localeMap: Record<string, string> = {
        'vi': 'vi-VN',
        'en': 'en-US',
        'fr': 'fr-FR',
        'ru': 'ru-RU'
    }
    return localeMap[locale.value] || 'en-US'
})
const props = defineProps<{
    modelValue: string | number
    min?: string
    max?: string
    required?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const inputRef = ref<HTMLInputElement | null>(null)
const inputType = ref('text')
const isFocused = ref(false)

const displayValue = computed(() => {
    if (isFocused.value || inputType.value === 'date') {
        return props.modelValue
    }
    if (!props.modelValue) return ''
    // Format YYYY-MM-DD to DD/MM/YYYY for display
    const strVal = String(props.modelValue)
    const [y, m, d] = strVal.split('-')
    if (!y || !m || !d) return strVal
    return `${d}/${m}/${y}`
})

const onFocus = () => {
    isFocused.value = true
    inputType.value = 'date'
}

const onBlur = () => {
    isFocused.value = false
    if (!props.modelValue) {
        inputType.value = 'text'
    } else {
        // Keep as date if invalid format? No, switch to text to show formatted
        inputType.value = 'text'
    }
}

// Mobile specific: sometimes click is needed to trigger date picker on text input
const onClick = () => {
    if (inputType.value === 'text') {
        inputType.value = 'date'
        isFocused.value = true
        nextTick(() => {
            inputRef.value?.showPicker?.() || inputRef.value?.focus()
        })
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}
</script>
