<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <TheNavbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tienda</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {{ store.total }} productos disponibles
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">

        <!-- ── SIDEBAR FILTERS ─────────────────────────────────── -->
        <aside class="lg:w-60 flex-shrink-0">
          <div class="card p-5 sticky top-20 space-y-5">
            <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Filtros</h3>

            <!-- Search -->
            <div>
              <label class="label">Buscar</label>
              <div class="relative">
                <input
                  v-model="filters.search"
                  @input="debouncedFetch"
                  type="text"
                  placeholder="Buscar productos..."
                  class="input input-sm pl-9"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <!-- Categories -->
            <div>
              <label class="label">Categoría</label>
              <div class="space-y-0.5">
                <button
                  @click="setCategory(null)"
                  :class="['w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    !filters.category
                      ? 'bg-primary-500 text-white font-semibold shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100']"
                >
                  🏪 Todas
                </button>
                <button
                  v-for="cat in store.categories"
                  :key="cat._id"
                  @click="setCategory(cat._id)"
                  :class="['w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    filters.category === cat._id
                      ? 'bg-primary-500 text-white font-semibold shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100']"
                >
                  {{ cat.icon }} {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Price -->
            <div>
              <label class="label">Precio máximo</label>
              <input v-model="filters.maxPrice" @change="applyFilters" type="range"
                min="0" max="50000" step="1000"
                class="w-full accent-primary-500 mt-1" />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                <span>$0</span>
                <span class="font-semibold text-primary-500">
                  {{ filters.maxPrice ? '$' + Number(filters.maxPrice).toLocaleString('es-CO') : 'Todos' }}
                </span>
              </div>
            </div>

            <!-- Featured toggle -->
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <div class="relative">
                <input v-model="filters.featured" @change="applyFilters" type="checkbox" class="sr-only peer" />
                <div class="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full
                  peer-checked:bg-primary-500 transition-colors duration-200"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                  transition-transform duration-200 peer-checked:translate-x-4"></div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Solo destacados</span>
            </label>

            <!-- Clear -->
            <button @click="clearFilters"
              class="w-full btn-ghost btn-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20">
              Limpiar filtros
            </button>
          </div>
        </aside>

        <!-- ── PRODUCTS GRID ────────────────────────────────────── -->
        <div class="flex-1 min-w-0">
          <!-- Sort bar -->
          <div class="flex items-center justify-between mb-5 h-8">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Mostrando
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ store.products.length }}</span>
              de
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ store.total }}</span>
              productos
            </p>
          </div>

          <!-- Skeletons -->
          <div v-if="store.loading" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="n in 8" :key="n"
              class="bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl h-64 animate-pulse"></div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!store.products.length"
            class="text-center py-20 px-4">
            <div class="text-5xl mb-4 opacity-40">🔍</div>
            <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Sin resultados</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
              No encontramos productos con esos filtros
            </p>
            <button @click="clearFilters" class="btn-primary">Ver todos los productos</button>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
            <ProductCard v-for="p in store.products" :key="p._id" :product="p" />
          </div>

          <!-- Pagination -->
          <div v-if="store.pages > 1" class="flex justify-center gap-1.5 mt-10">
            <button
              v-for="page in store.pages"
              :key="page"
              @click="goToPage(page)"
              :class="['w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-150',
                currentPage === page
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700']"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheNavbar  from '../components/TheNavbar.vue'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/products'

const store       = useProductStore()
const route       = useRoute()
const currentPage = ref(1)

const filters = ref({
  search: '',
  category: route.query.category || null,
  featured: false,
  maxPrice: null,
})

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(applyFilters, 400)
}

async function applyFilters() {
  currentPage.value = 1
  await store.fetchProducts({
    search:   filters.value.search   || undefined,
    category: filters.value.category || undefined,
    featured: filters.value.featured || undefined,
    maxPrice: filters.value.maxPrice || undefined,
    page:     currentPage.value,
    limit:    20,
  })
}

function setCategory(id) {
  filters.value.category = id
  applyFilters()
}

function clearFilters() {
  filters.value = { search: '', category: null, featured: false, maxPrice: null }
  applyFilters()
}

async function goToPage(page) {
  currentPage.value = page
  await store.fetchProducts({ ...filters.value, page, limit: 20 })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await Promise.all([store.fetchCategories(), applyFilters()])
})

watch(() => route.query.category, (v) => {
  filters.value.category = v || null
  applyFilters()
})
</script>
