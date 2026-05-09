<template>
  <div class="space-y-6 animate-fade-in">
    <!-- KPI CARDS ROW -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="stat-card">
        <div class="stat-icon" :style="{ background: kpi.bg }">{{ kpi.icon }}</div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ kpi.label }}</p>
          <p class="text-xl font-black text-gray-900 truncate">{{ kpi.value }}</p>
          <p v-if="kpi.sub" class="text-xs text-gray-400 mt-0.5">{{ kpi.sub }}</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- SALES CHART -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-800">Ventas de los últimos 7 días</h2>
          <span class="badge-primary">Esta semana</span>
        </div>

        <div v-if="chartLoading" class="h-48 flex items-center justify-center">
          <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div v-else class="space-y-3">
          <div v-for="day in chartData" :key="day.date" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-24 flex-shrink-0">{{ day.date }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div class="h-full gradient-primary rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                :style="{ width: barWidth(day.revenue) }">
                <span v-if="day.revenue > 0" class="text-white text-xs font-bold leading-none">
                  ${{ (day.revenue / 1000).toFixed(0) }}k
                </span>
              </div>
            </div>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">{{ day.orders }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-400 pt-1">
            <span>Ingresos</span>
            <span>Pedidos →</span>
          </div>
        </div>
      </div>

      <!-- LOW STOCK ALERTS -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-800">⚠️ Stock bajo</h2>
          <span v-if="lowStock.length" class="badge-danger">{{ lowStock.length }}</span>
        </div>
        <div v-if="!lowStock.length" class="text-center py-8 text-gray-400">
          <div class="text-3xl mb-2">✅</div>
          <p class="text-sm">Todo en orden</p>
        </div>
        <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <div v-for="p in lowStock" :key="p._id"
            class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-500">{{ p.category?.name }}</p>
            </div>
            <span :class="['badge flex-shrink-0 ml-2', p.stock === 0 ? 'badge-danger' : 'badge-warning']">
              {{ p.stock === 0 ? 'Agotado' : p.stock + ' ud.' }}
            </span>
          </div>
        </div>
        <RouterLink to="/admin/inventario" class="block text-center text-xs text-primary-500 hover:underline mt-3">
          Ver inventario →
        </RouterLink>
      </div>
    </div>

    <!-- TOP PRODUCTS -->
    <div class="card p-6">
      <h2 class="font-bold text-gray-800 mb-4">🏆 Productos más vendidos</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="table-head">#</th>
              <th class="table-head">Producto</th>
              <th class="table-head">Categoría</th>
              <th class="table-head text-right">Precio</th>
              <th class="table-head text-right">Vendidos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in topProducts" :key="p._id" class="table-row">
              <td class="table-cell">
                <span :class="['font-black text-lg', i===0?'text-yellow-500':i===1?'text-gray-400':i===2?'text-amber-600':'text-gray-500']">
                  {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}` }}
                </span>
              </td>
              <td class="table-cell font-semibold">{{ p.name }}</td>
              <td class="table-cell text-gray-500">{{ p.category?.icon }} {{ p.category?.name }}</td>
              <td class="table-cell text-right font-bold text-gray-800">${{ p.price?.toLocaleString('es-CO') }}</td>
              <td class="table-cell text-right">
                <span class="badge-success">{{ p.soldCount }} ud.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { dashboardApi, inventoryApi } from '../../services/api'

const metrics    = ref(null)
const chartData  = ref([])
const topProducts= ref([])
const lowStock   = ref([])
const chartLoading = ref(true)

const maxRevenue = computed(() =>
  Math.max(...chartData.value.map(d => d.revenue), 1)
)
const barWidth = (revenue) =>
  revenue === 0 ? '4px' : `${Math.max(4, (revenue / maxRevenue.value) * 100)}%`

const fmt = (n) => n >= 1000000
  ? `$${(n / 1000000).toFixed(1)}M`
  : n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`

const kpis = computed(() => {
  if (!metrics.value) return []
  return [
    { icon: '💰', label: 'Ventas hoy',       value: fmt(metrics.value.today.revenue),  sub: `${metrics.value.today.orders} pedidos`, bg: 'rgba(255,107,53,0.15)' },
    { icon: '📅', label: 'Esta semana',      value: fmt(metrics.value.week.revenue),   sub: `${metrics.value.week.orders} pedidos`, bg: 'rgba(99,102,241,0.15)' },
    { icon: '📆', label: 'Este mes',         value: fmt(metrics.value.month.revenue),  sub: `${metrics.value.month.orders} pedidos`, bg: 'rgba(16,185,129,0.15)' },
    { icon: '📦', label: 'Productos activos', value: metrics.value.inventory.totalProducts, sub: `${metrics.value.inventory.lowStockCount} con stock bajo`, bg: 'rgba(245,158,11,0.15)' },
  ]
})

onMounted(async () => {
  const [metricsRes, chartRes, topRes, lowRes] = await Promise.all([
    dashboardApi.getMetrics(),
    dashboardApi.getSalesChart(7),
    dashboardApi.getTopProducts(5),
    inventoryApi.getLowStock(),
  ])
  metrics.value     = metricsRes.data
  chartData.value   = chartRes.data
  topProducts.value = topRes.data
  lowStock.value    = lowRes.data
  chartLoading.value = false
})
</script>
