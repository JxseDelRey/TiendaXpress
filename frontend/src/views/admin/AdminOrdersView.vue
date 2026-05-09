<template>
  <div class="space-y-4 animate-fade-in">
     <!-- Filter Options -->
     <div class="card p-4 flex flex-wrap gap-4 items-end">
        <div>
           <label class="label text-xs">Estado del pedido</label>
           <select v-model="filterStatus" @change="fetchOrders" class="input input-sm w-48">
              <option value="">Todos los pedidos</option>
              <option value="pending">🟡 Pendientes</option>
              <option value="preparing">🟠 En preparación</option>
              <option value="completed">🟢 Completados</option>
              <option value="cancelled">🔴 Cancelados</option>
           </select>
        </div>
        <button @click="fetchOrders" class="btn-secondary btn-sm h-[38px]">↻ Refrescar</button>
     </div>

     <!-- Orders List -->
     <div class="card overflow-hidden">
        <div v-if="loading" class="p-10 flex justify-center">
           <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div v-else-if="!orders.length" class="text-center py-12 text-gray-500">
           No hay pedidos que coincidan con el filtro.
        </div>
        <div v-else class="overflow-x-auto">
           <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th class="table-head">ID / Fecha</th>
                    <th class="table-head">Cliente</th>
                    <th class="table-head text-center">Artículos</th>
                    <th class="table-head text-right">Total</th>
                    <th class="table-head text-center">Estado</th>
                    <th class="table-head text-center">Acciones</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                 <tr v-for="o in orders" :key="o._id" class="hover:bg-gray-50">
                    <td class="p-4">
                       <span class="font-mono text-xs text-primary-600 block font-bold">#{{ o._id.slice(-6).toUpperCase() }}</span>
                       <span class="text-xs text-gray-500">{{ new Date(o.createdAt).toLocaleString('es-CO') }}</span>
                    </td>
                    <td class="p-4">
                       <p class="font-semibold text-gray-800">{{ o.customerName || 'Cliente General' }}</p>
                       <p class="text-xs text-gray-500">{{ o.customerPhone || 'Sin teléfono' }}</p>
                    </td>
                    <td class="p-4 text-center text-gray-600">
                       {{ o.items.length }} 📦
                    </td>
                    <td class="p-4 text-right font-bold text-gray-900">
                       ${{ o.total.toLocaleString('es-CO') }}
                    </td>
                    <td class="p-4 text-center">
                        <select :value="o.status" @change="updateStatus(o._id, $event.target.value)"
                           :class="['text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer',
                              o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              o.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                              o.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700']">
                           <option value="pending">Pendiente</option>
                           <option value="preparing">Preparando</option>
                           <option value="completed">Completado</option>
                           <option value="cancelled">Cancelado</option>
                        </select>
                    </td>
                    <td class="p-4 text-center">
                       <button @click="viewOrder(o)" class="text-primary-500 hover:text-primary-700 border border-primary-200 bg-primary-50 px-3 py-1 rounded text-xs font-semibold">
                          Detalles
                       </button>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>
     </div>

     <!-- Order Details Modal -->
     <Transition name="modal">
         <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div class="card max-w-lg w-full max-h-[90vh] flex flex-col">
               <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                  <div>
                     <h3 class="font-bold text-lg">Detalle Pedido #{{ selectedOrder._id.slice(-6).toUpperCase() }}</h3>
                     <p class="text-xs text-gray-500">{{ new Date(selectedOrder.createdAt).toLocaleString('es-CO') }}</p>
                  </div>
                  <button @click="selectedOrder = null" class="text-gray-400 hover:text-gray-600">✕</button>
               </div>
               
               <div class="p-5 overflow-y-auto flex-1 space-y-4">
                  <!-- Customer Info -->
                  <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm">
                     <p><strong>👤 Cliente:</strong> {{ selectedOrder.customerName }}</p>
                     <p v-if="selectedOrder.customerPhone"><strong>📞 Tel:</strong> {{ selectedOrder.customerPhone }}</p>
                     <p><strong>💳 Pago:</strong> {{ selectedOrder.paymentMethod.toUpperCase() }}</p>
                     <p v-if="selectedOrder.notes"><strong>📝 Notas:</strong> {{ selectedOrder.notes }}</p>
                  </div>

                  <h4 class="font-bold text-gray-800 text-sm border-b pb-2">Artículos ({{ selectedOrder.items.length }})</h4>
                  <div class="space-y-3">
                     <div v-for="(item, i) in selectedOrder.items" :key="i" class="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                        <div class="text-sm">
                           <span class="font-semibold text-gray-800">{{ item.quantity }}x</span>
                           <span class="text-gray-600 ml-2">{{ item.productName }}</span>
                        </div>
                        <span class="font-medium text-gray-800">${{ item.subtotal.toLocaleString('es-CO') }}</span>
                     </div>
                  </div>
               </div>

               <div class="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <div class="flex justify-between items-center text-lg font-black text-gray-900">
                     <span>TOTAL</span>
                     <span class="text-primary-600">${{ selectedOrder.total.toLocaleString('es-CO') }}</span>
                  </div>
               </div>
            </div>
         </div>
     </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ordersApi } from '../../services/api'

const orders = ref([])
const loading = ref(true)
const filterStatus = ref('')
const selectedOrder = ref(null)

async function fetchOrders() {
   loading.value = true
   try {
      const rs = await ordersApi.getAll({ status: filterStatus.value || undefined })
      orders.value = rs.data
   } finally { loading.value = false }
}

async function updateStatus(id, newStatus) {
   try {
      await ordersApi.updateStatus(id, newStatus)
      // fetchOrders() can be called to refresh, but local update is faster visually
   } catch(e) {
      alert('Error updating status')
      fetchOrders() // revert
   }
}

function viewOrder(o) {
   selectedOrder.value = o
}

onMounted(() => {
   fetchOrders()
})
</script>
