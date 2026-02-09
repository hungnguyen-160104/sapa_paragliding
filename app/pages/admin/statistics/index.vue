<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Analytics</p>
        <h2 class="text-3xl font-semibold">Statistics</h2>
      </div>
      <div class="flex gap-3">
        <button class="btn-secondary" @click="applyQuickRange('day')">Today</button>
        <button class="btn-secondary" @click="applyQuickRange('month')">This Month</button>
        <button class="btn-secondary" @click="applyQuickRange('year')">This Year</button>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total customers" :value="overview.totalCustomers" />
      <KpiCard label="Total bookings" :value="overview.totalBookings" />
      <KpiCard label="Pending" :value="overview.pending" />
      <KpiCard label="Revenue" :value="formatCurrency(overview.revenue)" />
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div class="grid gap-4 md:grid-cols-4">
        <div>
          <label class="form-label">Granularity</label>
          <select v-model="filters.groupBy" class="input-field">
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div>
          <label class="form-label">From</label>
          <input v-model="filters.from" type="date" class="input-field" />
        </div>
        <div>
          <label class="form-label">To</label>
          <input v-model="filters.to" type="date" class="input-field" />
        </div>
        <div class="flex items-end">
          <button class="btn-primary w-full" @click="loadStats">Apply</button>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
    >
      Loading charts...
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <p class="text-sm font-semibold text-slate-500">Bookings over time</p>
        <div v-if="bookingSeries.length === 0" class="mt-4 text-center text-sm text-slate-500">No booking data</div>
        <div v-else class="mt-4 flex items-end gap-2">
          <div v-for="point in bookingSeries" :key="point.label" class="flex-1">
            <div class="rounded-t-md bg-red-500 transition-[height]" :style="{ height: `${point.height}px` }"></div>
            <p class="mt-2 text-center text-xs text-slate-500">{{ point.label }}</p>
            <p class="text-center text-xs font-semibold">{{ point.value }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <p class="text-sm font-semibold text-slate-500">Revenue trend</p>
        <div v-if="revenueSeries.length === 0" class="mt-4 text-center text-sm text-slate-500">No revenue data</div>
        <div v-else class="mt-4 flex items-end gap-2">
          <div v-for="point in revenueSeries" :key="point.label" class="flex-1">
            <div class="rounded-t-md bg-emerald-500 transition-[height]" :style="{ height: `${point.height}px` }"></div>
            <p class="mt-2 text-center text-xs text-slate-500">{{ point.label }}</p>
            <p class="text-center text-xs font-semibold">{{ formatCurrency(point.value) }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <p class="text-sm font-semibold text-slate-500">Status distribution</p>
        <div v-if="statusDistribution.length === 0" class="mt-6 text-sm text-slate-500">No status data</div>
        <div v-else class="mt-6 flex flex-col gap-3">
          <div
            v-for="segment in statusDistribution"
            :key="segment.status"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <span class="block h-3 w-3 rounded-full" :style="{ backgroundColor: segment.color }"></span>
              <span>{{ segment.status }}</span>
            </div>
            <span class="font-semibold">{{ segment.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white">
      <div class="flex flex-wrap items-center gap-4 px-6 py-4">
        <select v-model="tableFilters.status" class="input-field w-full md:w-auto">
          <option value="">All status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input v-model="tableFilters.location" class="input-field w-full md:w-auto" placeholder="Location" />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Customer</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phone</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Flight</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Price</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500">Created</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="tablePending">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">Loading table...</td>
            </tr>

            <tr v-else-if="tableRows.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500">No bookings in range</td>
            </tr>

            <tr v-for="row in tableRows" :key="row.id" class="border-b border-slate-100">
              <td class="px-4 py-4 text-sm font-medium">{{ row.customerName }}</td>
              <td class="px-4 py-4 text-sm">{{ row.phone }}</td>
              <td class="px-4 py-4 text-sm">{{ formatDate(row.flightDate) }} · {{ row.location || '—' }}</td>
              <td class="px-4 py-4 text-sm">{{ row.status }}</td>
              <td class="px-4 py-4 text-sm font-semibold">{{ formatCurrency(row.price) }}</td>
              <td class="px-4 py-4 text-sm text-slate-500">{{ formatDateTime(row.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
        <p>Showing page {{ tablePage }}</p>
        <div class="flex items-center gap-3">
          <button class="btn-secondary" :disabled="tablePage === 1" @click="changeTablePage(tablePage - 1)">Prev</button>
          <button class="btn-secondary" :disabled="!tableHasMore" @click="changeTablePage(tablePage + 1)">Next</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import KpiCard from '~~/components/admin/ui/KpiCard.vue'
import { fetchOverviewStats, fetchBookingTrends, fetchRevenueTrends, fetchStatusDistribution } from '~~/services/stats'
import { fetchBookings } from '~~/services/bookings'
import type { BookingListResponse } from '~~/services/bookings'
import type { OverviewStatsResponse, TrendResponse } from '~~/services/stats'

definePageMeta({
  layout: 'admin'
})

const today = new Date().toISOString().split('T')[0]
const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

interface BookingRow {
  id: string
  customerName: string
  phone: string
  location: string
  status: string
  price: number
  flightDate?: string
  createdAt?: string
}

const filters = reactive({
  groupBy: 'day',
  from: startOfMonth,
  to: today
})

const overview = reactive({
  totalCustomers: 0,
  totalBookings: 0,
  pending: 0,
  revenue: 0
})

const bookingSeries = ref<{ label: string; value: number; height: number }[]>([])
const revenueSeries = ref<{ label: string; value: number; height: number }[]>([])
const statusDistribution = ref<{ status: string; value: number; color: string }[]>([])
const loading = ref(false)

const tableFilters = reactive({ status: '', location: '' })
const tablePage = ref(1)
const tablePageSize = 10
const tableRows = ref<BookingRow[]>([])
const tableTotal = ref(0)
const tablePending = ref(false)

const loadTable = async () => {
  tablePending.value = true
  try {
    const response: BookingListResponse = await fetchBookings({
      status: tableFilters.status || undefined,
      location: tableFilters.location || undefined,
      from: filters.from,
      to: filters.to,
      page: tablePage.value,
      pageSize: tablePageSize
    })
    tableRows.value = response.data as BookingRow[]
    tableTotal.value = response.total
  } catch (error) {
    console.error('Failed to load statistics table', error)
    tableRows.value = []
  } finally {
    tablePending.value = false
  }
}

const loadStats = async () => {
  loading.value = true
  try {
    const [overviewRes, bookingsRes, revenueRes, statusRes]: [
      OverviewStatsResponse,
      TrendResponse,
      TrendResponse,
      TrendResponse
    ] = await Promise.all([
      fetchOverviewStats({ from: filters.from, to: filters.to }),
      fetchBookingTrends({ ...filters, groupBy: filters.groupBy as 'day' | 'month' | 'year' }),
      fetchRevenueTrends({ ...filters, groupBy: filters.groupBy as 'day' | 'month' | 'year' }),
      fetchStatusDistribution({ from: filters.from, to: filters.to })
    ])

    Object.assign(overview, overviewRes)

    const maxBookings = Math.max(...bookingsRes.values, 1)
    bookingSeries.value = bookingsRes.labels.map((label: string, index: number) => ({
      label,
      value: bookingsRes.values[index] ?? 0,
      height: Math.round(((bookingsRes.values[index] ?? 0) / maxBookings) * 120) + 20
    }))

    const maxRevenue = Math.max(...revenueRes.values, 1)
    revenueSeries.value = revenueRes.labels.map((label: string, index: number) => ({
      label,
      value: revenueRes.values[index] ?? 0,
      height: Math.round(((revenueRes.values[index] ?? 0) / maxRevenue) * 120) + 20
    }))

    const colors = ['#DC2626', '#FB923C', '#0EA5E9', '#22C55E']
    statusDistribution.value = statusRes.values.map((value: number, idx: number) => ({
      status: statusRes.labels[idx] ?? '',
      value,
      color: colors[idx % colors.length] ?? '#999'
    }))
  } catch (error) {
    console.error('Failed to load statistics', error)
  } finally {
    loading.value = false
  }

  // reset page rồi load bảng
  if (tablePage.value !== 1) {
    tablePage.value = 1
    return
  }
  await loadTable()
}

watch([() => filters.groupBy, () => filters.from, () => filters.to], () => {
  loadStats()
})

watch([() => tableFilters.status, () => tableFilters.location], () => {
  if (tablePage.value !== 1) {
    tablePage.value = 1
    return
  }
  loadTable()
})

watch(
  () => tablePage.value,
  () => {
    loadTable()
  }
)

onMounted(() => {
  loadStats()
})

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('en-US') : '—')
const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString('en-US') : '—')

const applyQuickRange = (range: 'day' | 'month' | 'year') => {
  const now = new Date()
  if (range === 'day') {
    filters.from = now.toISOString().split('T')[0]
  } else if (range === 'month') {
    filters.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  } else {
    filters.from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
  }
  filters.to = now.toISOString().split('T')[0]
}

const changeTablePage = (next: number) => {
  tablePage.value = Math.max(1, next)
}

const tableHasMore = computed(() => tablePage.value * tablePageSize < tableTotal.value)
</script>
