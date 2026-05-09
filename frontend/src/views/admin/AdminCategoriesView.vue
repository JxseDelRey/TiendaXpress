<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex justify-between items-center">
       <h2 class="text-xl font-bold text-gray-800">Categorías de Productos</h2>
       <button @click="openCreate" class="btn-primary flex items-center gap-2 text-sm">
          <span>+</span> Nueva Categoría
       </button>
    </div>

    <div class="card overflow-hidden">
       <div v-if="loading" class="p-10 flex justify-center">
          <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
       </div>
       <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 p-4 gap-4">
          <div v-for="c in categories" :key="c._id" class="border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow">
             <div class="text-4xl mb-2">{{ c.icon }}</div>
             <p class="font-bold text-gray-800 text-center">{{ c.name }}</p>
             <p class="text-xs text-gray-500 text-center mt-1 limit-lines-2">{{ c.description }}</p>
             
             <!-- Hover Actions -->
             <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(c)" class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200">✏️</button>
                <button @click="confirmDelete(c)" class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200">🗑️</button>
             </div>
          </div>
       </div>
    </div>

    <!-- Category Modal -->
    <Transition name="modal">
       <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div class="card max-w-sm w-full">
             <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 class="font-bold text-lg">{{ editingCategory ? 'Editar' : 'Nueva' }} Categoría</h3>
                <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
             </div>
             <form @submit.prevent="submitCategoriy" class="p-5 space-y-4">
                <div>
                   <label class="label">Nombre *</label>
                   <input v-model="form.name" type="text" required class="input" placeholder="Ej: Lácteos" />
                </div>
                <div>
                   <label class="label">Icono (Emoji)</label>
                   <input v-model="form.icon" type="text" class="input" placeholder="Ej: 🥛" maxlength="2" />
                </div>
                <div>
                   <label class="label">Color (Hex)</label>
                   <div class="flex gap-2">
                       <input v-model="form.color" type="color" class="h-10 w-10 rounded border" />
                       <input v-model="form.color" type="text" class="input flex-1" placeholder="#000000" />
                   </div>
                </div>
                <div>
                   <label class="label">Descripción</label>
                   <textarea v-model="form.description" class="input resize-none" rows="2"></textarea>
                </div>
                
                <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>

                <div class="flex justify-end gap-3 pt-2">
                   <button type="button" @click="showModal = false" class="btn-secondary">Cancelar</button>
                   <button type="submit" :disabled="submitting" class="btn-primary">
                      {{ submitting ? 'Guardando...' : 'Guardar' }}
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
import { categoriesApi } from '../../services/api'
import { useProductStore } from '../../stores/products'

const productStore = useProductStore()
const categories = ref([])
const loading = ref(true)

const showModal = ref(false)
const editingCategory = ref(null)
const submitting = ref(false)
const formError = ref(null)

const form = ref({ name: '', icon: '📦', color: '#FF6B35', description: '' })

async function fetchCategories() {
   loading.value = true
   try {
      const rs = await categoriesApi.getAll()
      categories.value = rs.data
      productStore.categories = rs.data // sync store
   } finally { loading.value = false }
}

function openCreate() {
   editingCategory.value = null
   form.value = { name: '', icon: '📦', color: '#FF6B35', description: '' }
   showModal.value = true
}

function openEdit(c) {
   editingCategory.value = c
   form.value = { name: c.name, icon: c.icon, color: c.color, description: c.description }
   showModal.value = true
}

async function submitCategoriy() {
   submitting.value = true; formError.value = null
   try {
      if(editingCategory.value) {
         await categoriesApi.update(editingCategory.value._id, form.value)
      } else {
         await categoriesApi.create(form.value)
      }
      showModal.value = false
      fetchCategories()
   } catch(e) {
      formError.value = 'Error al guardar categoría'
   } finally { submitting.value = false }
}

async function confirmDelete(c) {
   if(confirm(`¿Desea desactivar la categoría "${c.name}"?`)) {
      await categoriesApi.delete(c._id)
      fetchCategories()
   }
}

onMounted(() => {
   fetchCategories()
})
</script>

<style scoped>
.limit-lines-2 {
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden;
}
</style>
