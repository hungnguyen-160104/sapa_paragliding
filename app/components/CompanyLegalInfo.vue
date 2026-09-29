<template>
  <!-- Khối thông tin pháp nhân bắt buộc (NĐ 52/2013, sửa bởi NĐ 85/2021).
       Dữ liệu lấy từ shared/legal.ts — chủ chỉ sửa ở đó.
       Trường còn "[CẦN ĐIỀN: ...]": bản build ẩn đi, bản dev hiện tô vàng. -->
  <div :class="['space-y-1 leading-relaxed', variant === 'dark' ? 'text-white/90' : 'text-gray-700']">
    <p :class="['font-bold', variant === 'dark' ? 'text-white' : 'text-gray-900']">
      {{ COMPANY.name }}
      <template v-if="show(COMPANY.nameEn)">
        <br /><span :class="['font-medium', mark(COMPANY.nameEn)]">{{ COMPANY.nameEn }}</span>
      </template>
      <template v-if="show(COMPANY.shortName)">
        <span class="font-medium"> ({{ COMPANY.shortName }})</span>
      </template>
    </p>

    <p v-if="show(COMPANY.taxCode)">
      {{ $t('legal.company.taxCode') }}: <span :class="mark(COMPANY.taxCode)">{{ COMPANY.taxCode }}</span>
      <template v-if="show(COMPANY.firstRegisteredDate)">
        – {{ $t('legal.company.firstRegistered') }}
        <span :class="mark(COMPANY.firstRegisteredDate)">{{ COMPANY.firstRegisteredDate }}</span>
      </template>
      <template v-if="show(COMPANY.latestChange)">; {{ COMPANY.latestChange }}</template>
      <template v-if="show(COMPANY.issuedBy)">
        – {{ $t('legal.company.issuedBy') }}: <span :class="mark(COMPANY.issuedBy)">{{ COMPANY.issuedBy }}</span>
      </template>
    </p>

    <p v-if="show(COMPANY.headOffice)">
      {{ $t('legal.company.headOffice') }}: <span :class="mark(COMPANY.headOffice)">{{ COMPANY.headOffice }}</span>
    </p>

    <p v-if="show(COMPANY.phone) || show(COMPANY.email)">
      <template v-if="show(COMPANY.phone)">
        {{ $t('legal.company.phone') }}:
        <a v-if="isLegalValueFilled(COMPANY.phone)" :href="`tel:${COMPANY.phone.replace(/\s+/g, '')}`" class="hover:underline">{{ COMPANY.phone }}</a>
        <span v-else :class="mark(COMPANY.phone)">{{ COMPANY.phone }}</span>
      </template>
      <template v-if="show(COMPANY.phone) && show(COMPANY.email)"> – </template>
      <template v-if="show(COMPANY.email)">
        {{ $t('legal.company.email') }}:
        <a v-if="isLegalValueFilled(COMPANY.email)" :href="`mailto:${COMPANY.email}`" class="break-words hover:underline">{{ COMPANY.email }}</a>
        <span v-else :class="mark(COMPANY.email)">{{ COMPANY.email }}</span>
      </template>
    </p>

    <p v-if="show(COMPANY.representative)">
      {{ $t('legal.company.representative') }}:
      <span :class="mark(COMPANY.representative)">{{ COMPANY.representative }}</span>
      <template v-if="show(COMPANY.representativeTitle)">
        – <span :class="mark(COMPANY.representativeTitle)">{{ COMPANY.representativeTitle }}</span>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { COMPANY, isLegalValueFilled } from '~~/shared/legal'

withDefaults(defineProps<{ variant?: 'dark' | 'light' }>(), { variant: 'dark' })

/** Trường đã điền thì luôn hiện; còn giữ chỗ thì chỉ hiện khi chạy dev. */
const show = (value: string) => isLegalValueFilled(value) || (import.meta.dev && Boolean(value))

/** Tô vàng chữ giữ chỗ (chỉ thấy ở dev) để chủ biết chỗ nào còn phải điền. */
const mark = (value: string) => (isLegalValueFilled(value) ? '' : 'bg-yellow-300 px-1 text-gray-900')
</script>
