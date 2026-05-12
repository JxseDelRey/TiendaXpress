<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div>
        <p class="text-gray-500 text-sm">{{ store.total }} productos registrados</p>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2">
        <span class="text-lg">+</span> Nuevo producto
      </button>
    </div>

    <!-- Search bar -->
    <div class="card p-4 flex flex-col sm:flex-row gap-3">
      <input v-model="search" @input="debouncedFetch" type="text"
        placeholder="Buscar por nombre..." class="input input-sm flex-1" />
      <select v-model="filterCat" @change="fetchData" class="input input-sm sm:w-48">
        <option value="">Todas las categorías</option>
        <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="store.loading" class="p-8 flex justify-center">
        <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="table-head">Producto</th>
              <th class="table-head">Categoría</th>
              <th class="table-head text-right">Precio</th>
              <th class="table-head text-center">Stock</th>
              <th class="table-head text-center">Estado</th>
              <th class="table-head text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in store.products" :key="p._id" class="table-row">
              <!-- Product -->
              <td class="table-cell">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img v-if="p.images?.[0]" :src="p.images[0]" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-lg">{{ p.category?.icon || '📦' }}</div>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800 text-sm">{{ p.name }}</p>
                    <p v-if="p.discountPercent > 0" class="text-xs text-red-500">-{{ p.discountPercent }}% desc.</p>
                  </div>
                </div>
              </td>
              <td class="table-cell text-gray-500 text-sm">{{ p.category?.icon }} {{ p.category?.name }}</td>
              <td class="table-cell text-right font-bold">${{ p.price?.toLocaleString('es-CO') }}</td>
              <!-- Stock with color -->
              <td class="table-cell text-center">
                <span :class="['badge', p.stock === 0 ? 'badge-danger' : p.stock <= p.lowStockAlert ? 'badge-warning' : 'badge-success']">
                  {{ p.stock }} ud.
                </span>
              </td>
              <td class="table-cell text-center">
                <span :class="['badge', p.isFeatured ? 'badge-primary' : 'badge-gray']">
                  {{ p.isFeatured ? '⭐ Dest.' : 'Normal' }}
                </span>
              </td>
              <td class="table-cell text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openEdit(p)" class="btn-ghost btn-sm text-indigo-600">✏️</button>
                  <button @click="confirmDelete(p)" class="btn-ghost btn-sm text-red-500">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: Create/Edit -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <div class="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-bold">{{ editingProduct ? '✏️ Editar producto' : '➕ Nuevo producto' }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="label">Nombre del producto *</label>
              <input v-model="form.name" type="text" required class="input" placeholder="Ej: Coca-Cola 600ml" />
            </div>
            <div class="sm:col-span-2">
              <label class="label">Descripción *</label>
              <textarea v-model="form.description" required rows="2" class="input resize-none" placeholder="Describe el producto..."></textarea>
            </div>
            <div>
              <label class="label">Precio ($) *</label>
              <input v-model.number="form.price" type="number" required min="0" step="100" class="input" />
            </div>
            <div>
              <label class="label">Precio de costo ($)</label>
              <input v-model.number="form.costPrice" type="number" min="0" step="100" class="input" />
            </div>
            <div>
              <label class="label">Categoría *</label>
              <select v-model="form.category" required class="input">
                <option value="">Seleccionar...</option>
                <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Unidad</label>
              <select v-model="form.unit" class="input">
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="paquete">Paquete</option>
                <option value="racimo">Racimo</option>
              </select>
            </div>
            <div>
              <label class="label">Stock inicial *</label>
              <input v-model.number="form.stock" type="number" required min="0" class="input" />
            </div>
            <div>
              <label class="label">Alerta bajo stock</label>
              <input v-model.number="form.lowStockAlert" type="number" min="0" class="input" />
            </div>
            <div>
              <label class="label">Descuento (%)</label>
              <input v-model.number="form.discountPercent" type="number" min="0" max="100" class="input" />
            </div>
            <div class="flex items-center gap-3 pt-2">
              <input v-model="form.isFeatured" type="checkbox" id="featured" class="w-4 h-4 accent-primary-500" />
              <label for="featured" class="label mb-0 cursor-pointer">⭐ Producto destacado</label>
            </div>
            <div class="sm:col-span-2">
              <label class="label">Imágenes (URL o Archivo local)</label>
              <div class="flex gap-2">
                <input v-model="imgUrl" type="url" class="input flex-1" placeholder="https://..." />
                <button type="button" @click="addImage" class="btn-secondary whitespace-nowrap">Añadir URL</button>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <input type="file" @change="uploadLocalImage" accept="image/*" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                <span v-if="uploadLoading" class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
              <div class="flex gap-2 mt-3 flex-wrap">
                <div v-for="(img, i) in form.images" :key="i" class="relative w-14 h-14">
                  <img :src="img" class="w-full h-full object-cover rounded-lg border" />
                  <button type="button" @click="form.images.splice(i, 1)"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                </div>
              </div>
            </div>
            <p v-if="formError" class="sm:col-span-2 text-red-500 text-sm">{{ formError }}</p>
            <div class="sm:col-span-2 flex gap-3 justify-end pt-2">
              <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
              <button type="submit" :disabled="formLoading" class="btn-primary flex items-center gap-2">
                <span v-if="formLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ editingProduct ? 'Guardar cambios' : 'Crear producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- DELETE CONFIRM -->
    <Transition name="modal">
      <div v-if="showDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="card max-w-sm w-full p-7 text-center animate-slide-up">
          <div class="text-5xl mb-3">🗑️</div>
          <h3 class="font-bold text-gray-800 mb-1">¿Eliminar producto?</h3>
          <p class="text-gray-500 text-sm mb-5">
            "<strong>{{ deletingProduct?.name }}</strong>" será desactivado del catálogo.
          </p>
          <div class="flex gap-3">
            <button @click="showDelete = false" class="btn-secondary flex-1">Cancelar</button>
            <button @click="handleDelete" :disabled="formLoading" class="btn-danger flex-1">
              <span v-if="formLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../../stores/products'
import { categoriesApi, uploadsApi } from '../../services/api'

const store = useProductStore()
const categories = ref([])
const search = ref('')
const filterCat = ref('')
const showModal = ref(false)
const showDelete = ref(false)
const editingProduct = ref(null)
const deletingProduct = ref(null)
const formLoading = ref(false)
const formError = ref(null)
const imgUrl = ref('')
const uploadLoading = ref(false)

const defaultForm = () => ({
  name: '', description: '', price: 0, costPrice: 0, category: '',
  stock: 0, lowStockAlert: 5, discountPercent: 0, isFeatured: false,
  images: [], unit: 'unidad',
})
const form = ref(defaultForm())

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchData, 400)
}

async function fetchData() {
  await store.fetchProducts({ search: search.value || undefined, category: filterCat.value || undefined, limit: 50 })
}

function addImage() {
  if (imgUrl.value) { form.value.images.push(imgUrl.value); imgUrl.value = '' }
}

async function uploadLocalImage(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadLoading.value = true
  try {
    const { data } = await uploadsApi.uploadImage(file)
    // Cloudinary devuelve la URL completa directamente, no hay que concatenar nada
    form.value.images.push(data.url)
  } catch (error) {
    alert('Error al subir imagen')
  } finally {
    uploadLoading.value = false
    event.target.value = '' // reset input
  }
}

function openCreate() {
  editingProduct.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(p) {
  editingProduct.value = p
  form.value = {
    name: p.name, description: p.description, price: p.price,
    costPrice: p.costPrice || 0, category: p.category?._id || p.category,
    stock: p.stock, lowStockAlert: p.lowStockAlert || 5,
    discountPercent: p.discountPercent || 0, isFeatured: p.isFeatured || false,
    images: [...(p.images || [])], unit: p.unit || 'unidad',
  }
  showModal.value = true
}

function confirmDelete(p) { deletingProduct.value = p; showDelete.value = true }
function closeModal() { showModal.value = false; editingProduct.value = null; formError.value = null }

async function handleSubmit() {
  formLoading.value = true; formError.value = null
  try {
    if (editingProduct.value) {
      await store.updateProduct(editingProduct.value._id, form.value)
    } else {
      await store.createProduct(form.value)
    }
    closeModal()
    fetchData()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error al guardar'
  } finally {
    formLoading.value = false
  }
}

async function handleDelete() {
  formLoading.value = true
  try {
    await store.deleteProduct(deletingProduct.value._id)
    showDelete.value = false
    fetchData()
  } finally {
    formLoading.value = false
  }
}

onMounted(async () => {
  const { data } = await categoriesApi.getAll()
  categories.value = data
  fetchData()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
