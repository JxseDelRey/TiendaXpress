<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <TheNavbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="auth.isAuthenticated" class="space-y-6 animate-fade-in">

        <!-- ── USER CARD ──────────────────────────────────────── -->
        <div class="card p-6 flex flex-col sm:flex-row items-center gap-6">
          <div class="w-20 h-20 gradient-primary rounded-full flex items-center justify-center
            text-2xl text-white font-extrabold shadow-lg flex-shrink-0">
            {{ auth.user.name?.[0]?.toUpperCase() }}
          </div>
          <div class="text-center sm:text-left flex-1">
            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {{ auth.user.name }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{{ auth.user.email }}</p>
            <div class="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span class="badge badge-success">✓ Cuenta activa</span>
              <span v-if="auth.isAdmin" class="badge badge-primary">Admin</span>
            </div>
          </div>
          <div class="flex-shrink-0">
            <RouterLink to="/tienda" class="btn-secondary btn-sm">🛒 Ir a comprar</RouterLink>
          </div>
        </div>

        <!-- ── ORDERS ─────────────────────────────────────────── -->
        <div>
          <h2 class="section-title mb-5">Historial de compras</h2>

          <!-- Loading -->
          <div v-if="loadingOrders" class="flex justify-center py-12">
            <div class="w-8 h-8 border-[3px] border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
          </div>

          <!-- Empty orders -->
          <div v-else-if="Object.keys(groupedOrders).length === 0"
            class="card p-10 text-center">
            <div class="text-5xl mb-4 opacity-30">🛍️</div>
            <p class="text-gray-500 dark:text-gray-400 mb-5">Aún no has realizado ninguna compra.</p>
            <RouterLink to="/tienda" class="btn-primary">Explorar la tienda</RouterLink>
          </div>

          <!-- Orders grouped by date -->
          <div v-else class="space-y-7">
            <div v-for="(ordersList, date) in groupedOrders" :key="date">
              <!-- Date separator -->
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  📅 {{ date }}
                </span>
                <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>

              <!-- Order cards -->
              <div class="space-y-3">
                <div
                  v-for="order in ordersList"
                  :key="order._id"
                  class="card p-4"
                >
                  <div class="flex items-start justify-between mb-3 gap-4">
                    <div>
                      <span class="font-mono text-xs text-gray-400 dark:text-gray-500">
                        #{{ order._id.slice(-8).toUpperCase() }}
                      </span>
                      <p class="font-semibold text-gray-900 dark:text-white mt-0.5">
                        ${{ order.total?.toLocaleString('es-CO') }}
                      </p>
                    </div>
                    <span :class="['badge', getStatusBadge(order.status)]">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>

                  <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-1.5">
                    <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                      Productos
                    </p>
                    <div
                      v-for="(item, idx) in order.items"
                      :key="idx"
                      class="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span>
                        {{ item.productName }}
                        <span class="text-gray-400 dark:text-gray-500"> ×{{ item.quantity }}</span>
                      </span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        ${{ item.subtotal?.toLocaleString('es-CO') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Not authenticated fallback -->
      <div v-else class="text-center py-24">
        <div class="text-5xl mb-4 opacity-30">🔒</div>
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-5">Inicia sesión para ver tu perfil</h2>
        <RouterLink to="/login" class="btn-primary">Iniciar sesión</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import TheNavbar from '../components/TheNavbar.vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const auth          = useAuthStore()
const router        = useRouter()
const orders        = ref([])
const loadingOrders = ref(true)

const groupedOrders = computed(() => {
  const groups = {}
  orders.value.forEach(order => {
    const d = new Date(order.createdAt)
    const dateStr = d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(order)
  })
  return groups
})

function getStatusText(status) {
  const map = { pending: 'En espera', processing: 'En proceso', completed: 'Completada', cancelled: 'Cancelada' }
  return map[status] || status
}

function getStatusBadge(status) {
  if (status === 'completed')  return 'badge-success'
  if (status === 'cancelled')  return 'badge-danger'
  if (status === 'processing') return 'badge-primary'
  return 'badge-warning'
}

onMounted(async () => {
  if (!auth.isAuthenticated) { router.push('/login'); return }
  try {
    const { data } = await api.get('/orders/my-orders')
    orders.value = data
  } catch (err) {
    console.error('Error loading orders', err)
  } finally {
    loadingOrders.value = false
  }
})
</script>
