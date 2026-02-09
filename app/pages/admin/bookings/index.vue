<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Bookings</p>
        <h2 class="text-3xl font-semibold">Manage Bookings</h2>
      </div>
      <button class="btn-secondary" @click="refreshList">Refresh</button>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total" :value="total" />
      <KpiCard label="Pending" :value="statusCount('PENDING')" />
      <KpiCard label="Confirmed" :value="statusCount('CONFIRMED')" />
      <KpiCard label="Completed" :value="statusCount('COMPLETED')" />
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div class="grid gap-4 md:grid-cols-4">
        <div>
          <label class="form-label">Search</label>
          <input v-model="filters.search" class="input-field" placeholder="Name, phone, email" />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.status" class="input-field">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label class="form-label">Location</label>
          <input v-model="filters.location" class="input-field" placeholder="Any" />
        </div>
        <div>
          <label class="form-label">Sort</label>
          <select v-model="filters.sort" class="input-field">
            <option value="flightDate_desc">Flight date ↓</option>
            <option value="flightDate_asc">Flight date ↑</option>
          </select>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Customer</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Contact</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Flight</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Price</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">Loading...</td>
            </tr>
            <tr v-else-if="bookings.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">No bookings found</td>
            </tr>
            <tr v-for="booking in bookings" :key="booking.id" class="border-b border-slate-100">
              <td class="px-4 py-4">
                <p class="font-medium">{{ booking.customerName }}</p>
                <p class="text-xs text-slate-500">{{ formatDateTime(booking.createdAt) }}</p>
              </td>
              <td class="px-4 py-4 text-sm">
                <p>{{ booking.phone }}</p>
                <p class="text-slate-500">{{ booking.email || 'N/A' }}</p>
              </td>
              <td class="px-4 py-4 text-sm">
                <p>{{ formatDate(booking.flightDate) }}</p>
                <p class="text-slate-500">{{ booking.location }}</p>
              </td>
              <td class="px-4 py-4 space-y-2">
                <StatusBadge :tone="statusTone(booking.status)">{{ booking.status }}</StatusBadge>
                <StatusBadge :tone="booking.contactStatus === 'CONTACTED' ? 'success' : 'warning'">
                  {{ booking.contactStatus || 'NOT_CONTACTED' }}
                </StatusBadge>
              </td>
              <td class="px-4 py-4 text-sm font-semibold text-slate-800">
                {{ formatCurrency(booking.price) }}
              </td>
              <td class="px-4 py-4 text-right text-sm">
                <div class="flex flex-wrap justify-end gap-2">
                  <button class="btn-chip" @click="markStatus(booking, 'CONFIRMED')">Mark Confirmed</button>
                  <button class="btn-chip" @click="markStatus(booking, 'COMPLETED')">Mark Completed</button>
                  <button class="btn-chip" @click="toggleContact(booking)">
                    {{ booking.contactStatus === 'CONTACTED' ? 'Mark Not Contacted' : 'Mark Contacted' }}
                  </button>
                  <button class="btn-chip text-red-600" @click="askDelete(booking)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
        <p>Showing {{ bookings.length }} of {{ total }}</p>
        <div class="flex items-center gap-3">
          <button class="btn-secondary" :disabled="page === 1" @click="changePage(page - 1)">Prev</button>
          <button class="btn-secondary" :disabled="!hasMore" @click="changePage(page + 1)">Next</button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="Boolean(bookingToDelete)"
      title="Delete booking"
      description="This booking will be permanently removed."
      @cancel="bookingToDelete = null"
      @confirm="performDelete"
    >
      <p class="text-sm text-slate-600">Delete booking for <strong>{{ bookingToDelete?.customerName }}</strong>?</p>
    </ConfirmModal>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import ConfirmModal from '~~/components/admin/ui/ConfirmModal.vue'
import KpiCard from '~~/components/admin/ui/KpiCard.vue'
import StatusBadge from '~~/components/admin/ui/StatusBadge.vue'
import { fetchBookings, updateBookingContact, updateBookingStatus, deleteBooking } from '~~/services/bookings'
import type { BookingListResponse, BookingFilters } from '~~/services/bookings'

definePageMeta({
  layout: 'admin'
})

const filters = reactive<BookingFilters>({
  search: '',
  status: '',
  location: '',
  sort: 'flightDate_desc'
})

const page = ref(1)
const pageSize = 10
const bookingToDelete = ref<any | null>(null)

// ✅ Nuxt auto-import: không import useAsyncData từ '#app'
// ✅ Bỏ top-level await để hết lỗi TS
const { data, refresh, pending } = useAsyncData<BookingListResponse>(
  'admin-bookings',
  () =>
    fetchBookings({
      ...filters,
      page: page.value,
      pageSize
    }),
  { server: false }
)

const refreshList = () => refresh()

watch([() => filters.search, () => filters.status, () => filters.location, () => filters.sort, () => page.value], () => {
  refresh()
})

const bookings = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const hasMore = computed(() => page.value * pageSize < total.value)

const changePage = (next: number) => {
  page.value = Math.max(1, next)
}

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const statusCount = (status: string) => bookings.value.filter((b: any) => b.status === status).length

const statusTone = (status: string) =>
  ({
    PENDING: 'warning',
    CONFIRMED: 'info',
    COMPLETED: 'success'
  } as const)[status] || 'info'

const markStatus = async (booking: any, status: 'CONFIRMED' | 'COMPLETED') => {
  await updateBookingStatus(booking.id, status)
  refresh()
}

const toggleContact = async (booking: any) => {
  const nextStatus = booking.contactStatus === 'CONTACTED' ? 'NOT_CONTACTED' : 'CONTACTED'
  await updateBookingContact(booking.id, nextStatus)
  refresh()
}

const askDelete = (booking: any) => {
  bookingToDelete.value = booking
}

const performDelete = async () => {
  if (!bookingToDelete.value) return
  await deleteBooking(bookingToDelete.value.id)
  bookingToDelete.value = null
  refresh()
}
</script>

<style scoped>
.btn-chip {
  @apply rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300;
}
</style>
