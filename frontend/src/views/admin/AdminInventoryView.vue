<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Control de Inventario</h2>
        <p class="text-gray-500 text-sm">Registra entradas y salidas de stock</p>
      </div>
      <button @click="showMovementModal = true" class="btn-primary flex items-center gap-2">
        <span class="text-xl">±</span> Nuevo Movimiento
      </button>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Low Stock Alerts -->
      <div class="card p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <span class="text-yellow-500">⚠️</span> Alertas de Stock
        </h3>
        <div v-if="loadingLowStock" class="flex justify-center p-4">
           <div class="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div v-else-if="!lowStock.length" class="text-center text-gray-500 p-4 bg-gray-50 rounded-xl">
           <p>No hay productos con stock bajo.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in lowStock" :key="p._id" class="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
             <div class="min-w-0 pr-2">
                <p class="font-semibold text-sm truncate">{{ p.name }}</p>
                <p class="text-xs text-gray-500">Mínimo sugerido: {{ p.lowStockAlert }}</p>
             </div>
             <span :class="['font-bold text-lg', p.stock === 0 ? 'text-red-500' : 'text-yellow-500']">{{ p.stock }}</span>
          </div>
        </div>
      </div>

      <!-- Movement History -->
      <div class="lg:col-span-2 card p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <span class="text-blue-500">📋</span> Historial de Movimientos
        </h3>

        <!-- Search Product filter -->
        <div class="mb-4">
            <input v-model="search" @input="debouncedFetch" type="text" placeholder="Filtrar historial por nombre de producto..." class="input input-sm w-full" />
        </div>

        <div v-if="loadingMovements" class="flex justify-center p-8">
           <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div v-else-if="!movements.length" class="text-center text-gray-500 py-10">
           <p>No hay movimientos registrados.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-3 text-left font-semibold text-gray-600">Fecha</th>
                <th class="p-3 text-left font-semibold text-gray-600">Producto</th>
                <th class="p-3 text-center font-semibold text-gray-600">Tipo</th>
                <th class="p-3 text-right font-semibold text-gray-600">Cant.</th>
                <th class="p-3 text-right font-semibold text-gray-600">Stock Queda</th>
                <th class="p-3 text-left font-semibold text-gray-600 hidden md:table-cell">Motivo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="m in movements" :key="m._id" class="hover:bg-gray-50 transition-colors">
                <td class="p-3 whitespace-nowrap text-gray-500">{{ new Date(m.createdAt).toLocaleString('es-CO') }}</td>
                <td class="p-3 font-medium text-gray-800">{{ m.productName }}</td>
                <td class="p-3 text-center">
                   <span :class="['px-2 py-1 rounded text-xs font-bold',
                      m.type === 'entrada' ? 'bg-green-100 text-green-700' :
                      m.type === 'salida' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700']">
                      {{ m.type.toUpperCase() }}
                   </span>
                </td>
                <td class="p-3 text-right font-bold">{{ m.quantity }}</td>
                <td class="p-3 text-right text-gray-600">{{ m.newStock }}</td>
                <td class="p-3 text-gray-500 hidden md:table-cell max-w-[150px] truncate" :title="m.reason">{{ m.reason || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Movement Modal -->
    <Transition name="modal">
       <div v-if="showMovementModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
         <div class="card max-w-lg w-full">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 class="font-bold text-lg">Registrar Movimiento</h3>
               <button @click="showMovementModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form @submit.prevent="submitMovement" class="p-6 space-y-4">
               <div>
                  <label class="label">Producto *</label>
                  <select v-model="form.product" required class="input">
                     <option value="" disabled>Seleccione un producto...</option>
                     <option v-for="p in allProducts" :key="p._id" :value="p._id">
                        {{ p.name }} (Stock: {{ p.stock }})
                     </option>
                  </select>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div>
                     <label class="label">Tipo de Movimiento *</label>
                     <select v-model="form.type" required class="input">
                        <option value="entrada">Entrada (+)</option>
                        <option value="salida">Salida (-)</option>
                        <option value="ajuste">Ajuste Directo (=)</option>
                     </select>
                  </div>
                  <div>
                     <label class="label">Cantidad *</label>
                     <input v-model.number="form.quantity" type="number" required min="0" class="input" />
                  </div>
               </div>
               <div>
                  <label class="label">Motivo (Opcional)</label>
                  <input v-model="form.reason" type="text" placeholder="Ej: Compra a proveedor, Merma..." class="input" />
               </div>

               <p v-if="modalError" class="text-red-500 text-sm">{{ modalError }}</p>

               <div class="flex justify-end gap-3 pt-4">
                  <button type="button" @click="showMovementModal = false" class="btn-secondary">Cancelar</button>
                  <button type="submit" :disabled="submitting" class="btn-primary flex items-center gap-2">
                     <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                     Guardar
                  </button>
               </div>
            </form>
         </div>
       </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { inventoryApi, productsApi } from '../../services/api'

const lowStock = ref([])
const movements = ref([])
const allProducts = ref([])
const loadingLowStock = ref(true)
const loadingMovements = ref(true)
const search = ref('')

const showMovementModal = ref(false)
const submitting = ref(false)
const modalError = ref(null)

const form = ref({
   product: '',
   type: 'entrada',
   quantity: 0,
   reason: ''
})

let debounceTimer = null
function debouncedFetch() {
   clearTimeout(debounceTimer)
   // Basic client-side filtering for simplicity, ideally backend handles product name search in inventory
   debounceTimer = setTimeout(() => { fetchMovements() }, 400)
}

async function loadData() {
   loadingLowStock.value = true
   try {
      const rs = await inventoryApi.getLowStock()
      lowStock.value = rs.data
   } finally { loadingLowStock.value = false }

   await fetchMovements()

   // Load products for select
   const prOpt = await productsApi.getAll({ limit: 1000 })
   allProducts.value = prOpt.data.products
}

async function fetchMovements() {
   loadingMovements.value = true
   try {
      // Find productId if searching by name (rudimentary approach)
      let targetProductId = undefined;
      if (search.value && search.value.length > 2) {
         const p = allProducts.value.find(prod => prod.name.toLowerCase().includes(search.value.toLowerCase()))
         if(p) targetProductId = p._id;
      }
      const mv = await inventoryApi.getAll(targetProductId)
      movements.value = mv.data
   } finally { loadingMovements.value = false }
}

async function submitMovement() {
   submitting.value = true; modalError.value = null;
   try {
      await inventoryApi.createMovement(form.value)
      showMovementModal.value = false
      form.value = { product: '', type: 'entrada', quantity: 0, reason: '' }
      await loadData() // Refresh
   } catch(e) {
      modalError.value = e.response?.data?.message || 'Error al registrar movimiento'
   } finally {
      submitting.value = false
   }
}

onMounted(() => {
   loadData()
})
</script>
