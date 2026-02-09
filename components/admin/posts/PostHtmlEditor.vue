<template>
  <div class="rounded-xl border border-slate-200 bg-white">
    <div class="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 text-sm">
      <button v-for="action in actions" :key="action.label" class="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-100"
        type="button" @click="applyAction(action.type)">
        {{ action.label }}
      </button>
    </div>
    <div class="grid gap-0 lg:grid-cols-2">
      <textarea
        v-model="localValue"
        class="min-h-[320px] w-full resize-y rounded-bl-xl border-0 border-r border-slate-200 bg-slate-50 p-4 font-mono text-sm outline-none"
        placeholder="Write raw HTML content here..."
      />
      <div class="min-h-[320px] rounded-br-xl bg-white p-4">
        <p class="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Live preview</p>
        <div class="prose max-w-none" v-html="sanitized"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '~~/utils/sanitizeHtml'

const modelValue = defineModel<string>({ required: true })

const actions = [
  { label: 'Bold', type: 'strong' },
  { label: 'Italic', type: 'em' },
  { label: 'Underline', type: 'u' },
  { label: 'H1', type: 'h1' },
  { label: 'H2', type: 'h2' },
  { label: 'H3', type: 'h3' },
  { label: 'Bullet', type: 'ul' },
  { label: 'Numbered', type: 'ol' },
  { label: 'Link', type: 'link' },
  { label: 'Image', type: 'image' }
] as const

type ActionType = typeof actions[number]['type']

const localValue = computed({
  get: () => modelValue.value,
  set: (val: string) => {
    modelValue.value = val
  }
})

const sanitized = computed(() => sanitizeHtml(localValue.value))

const wrapSelection = (tag: string, attrs = '') => {
  const textarea = document.querySelector<HTMLTextAreaElement>('textarea')
  if (!textarea) {
    return
  }
  const start = textarea.selectionStart || 0
  const end = textarea.selectionEnd || 0
  const before = localValue.value.slice(0, start)
  const after = localValue.value.slice(end)
  const selected = localValue.value.slice(start, end) || 'Your text'
  const inserted = `<${tag}${attrs ? ' ' + attrs : ''}>${selected}</${tag}>`
  localValue.value = `${before}${inserted}${after}`
}

const applyAction = (type: ActionType) => {
  switch (type) {
    case 'strong':
    case 'em':
    case 'u':
    case 'h1':
    case 'h2':
    case 'h3':
      wrapSelection(type)
      break
    case 'ul':
      wrapSelection('ul', '')
      break
    case 'ol':
      wrapSelection('ol', '')
      break
    case 'link':
      {
        const url = prompt('Enter URL (Cloudinary or https://)') || 'https://example.com'
        wrapSelection('a', `href="${url}"`)
      }
      break
    case 'image':
      {
        const src = prompt('Enter Cloudinary image URL') || ''
        if (!src) return
        const tag = `<img src="${src}" alt="" />`
        localValue.value = `${localValue.value}\n${tag}`
      }
      break
  }
}
</script>
