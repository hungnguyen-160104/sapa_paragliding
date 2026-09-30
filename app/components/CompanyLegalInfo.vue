<template>
  <!-- Khối thông tin pháp nhân bắt buộc (NĐ 52/2013 Đ29, sửa bởi NĐ 85/2021;
       TT 47/2014): tên, MST/ĐKDN (số, ngày cấp, nơi cấp), trụ sở, ĐT, email,
       người đại diện, số hai giấy phép. Dữ liệu ở shared/legal.ts.
       Dùng ở cuối các trang /policies (đầy đủ). Footer chỉ hiện 3 dòng rút gọn
       theo định dạng chủ chốt — xem Footer.vue. Hai giấy phép không hiện ngày;
       GCN ĐKDN giữ ngày cấp + nơi cấp vì luật yêu cầu công bố.
       Trường còn "[CẦN ĐIỀN: ...]": bản build ẩn đi, bản dev hiện tô vàng. -->
  <div :class="['space-y-0.5 text-xs leading-relaxed', variant === 'dark' ? 'text-gray-400' : 'text-gray-600']">
    <p>
      <span :class="['font-semibold', variant === 'dark' ? 'text-gray-200' : 'text-gray-800']">{{ COMPANY.name }}</span>
      <template v-if="show(COMPANY.nameEn)"> · <span :class="mark(COMPANY.nameEn)">{{ COMPANY.nameEn }}</span></template>
      <template v-if="show(COMPANY.shortName)"> ({{ COMPANY.shortName }})</template>
    </p>

    <p v-if="show(COMPANY.taxCode)">
      {{ $t('legal.company.taxCode') }}: <span :class="mark(COMPANY.taxCode)">{{ COMPANY.taxCode }}</span>
      <template v-if="show(COMPANY.firstRegisteredDate)">
        – {{ $t('legal.company.firstRegistered') }} <span :class="mark(COMPANY.firstRegisteredDate)">{{ COMPANY.firstRegisteredDate }}</span>
      </template>
      <template v-if="show(COMPANY.issuedBy)">
        {{ ' ' + $t('legal.company.issuedBy') }} <span :class="mark(COMPANY.issuedBy)">{{ COMPANY.issuedBy }}</span>
      </template>
      <template v-if="show(COMPANY.latestChange)">; {{ COMPANY.latestChange }}</template>
    </p>

    <p>
      <template v-for="(item, i) in contactItems" :key="item.key">
        <template v-if="i > 0"> · </template>
        {{ $t(`legal.company.${item.key}`) }}:
        <a v-if="item.href" :href="item.href" class="break-words hover:underline">{{ item.value }}</a>
        <span v-else :class="mark(item.value)">{{ item.value }}</span>
      </template>
    </p>

    <p v-if="showLicenses">
      {{ $t('footer.legal.flightPermit') }} · {{ $t('footer.legal.sportLicense') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { COMPANY, isLegalValueFilled } from '~~/shared/legal'

withDefaults(defineProps<{ variant?: 'dark' | 'light'; showLicenses?: boolean }>(), {
  variant: 'dark',
  showLicenses: true
})

/** Trường đã điền thì luôn hiện; còn giữ chỗ thì chỉ hiện khi chạy dev. */
const show = (value: string) => isLegalValueFilled(value) || (import.meta.dev && Boolean(value))

/** Tô vàng chữ giữ chỗ (chỉ thấy ở dev) để chủ biết chỗ nào còn phải điền. */
const mark = (value: string) => (isLegalValueFilled(value) ? '' : 'bg-yellow-300 px-1 text-gray-900')

/** Trụ sở · ĐT · Email · Đại diện — gộp một dòng. */
const contactItems = computed(() => {
  const rep = isLegalValueFilled(COMPANY.representativeTitle)
    ? `${COMPANY.representative} (${COMPANY.representativeTitle})`
    : COMPANY.representative
  return [
    { key: 'headOffice', value: COMPANY.headOffice, href: '' },
    {
      key: 'phone',
      value: COMPANY.phone,
      href: isLegalValueFilled(COMPANY.phone) ? `tel:${COMPANY.phone.replace(/\s+/g, '')}` : ''
    },
    {
      key: 'email',
      value: COMPANY.email,
      href: isLegalValueFilled(COMPANY.email) ? `mailto:${COMPANY.email}` : ''
    },
    { key: 'representative', value: rep, href: '' }
  ].filter((item) => show(item.value))
})
</script>
