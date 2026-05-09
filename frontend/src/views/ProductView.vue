<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <TheNavbar />

    <!-- Loading state -->
    <div v-if="store.loading" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      <div class="w-10 h-10 border-[3px] border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
    </div>

    <!-- Product detail -->
    <div v-else-if="store.currentProduct"
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-8">
        <RouterLink to="/" class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Inicio</RouterLink>
        <span>/</span>
        <RouterLink to="/tienda" class="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Tienda</RouterLink>
        <span>/</span>
        <span class="text-gray-700 dark:text-gray-300 font-medium truncate">{{ store.currentProduct.name }}</span>
      </nav>

      <div class="grid md:grid-cols-2 gap-10 lg:gap-14">

        <!-- ── IMAGES ──────────────────────────────────────────── -->
        <div class="space-y-3">
          <div class="card overflow-hidden aspect-square bg-gray-50 dark:bg-gray-800">
            <img
              v-if="store.currentProduct.images?.[0]"
              :src="activeImage || store.currentProduct.images[0]"
              :alt="store.currentProduct.name"
              class="w-full h-full object-cover transition-opacity duration-200"
              :key="activeImage"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-[96px] select-none">
              {{ store.currentProduct.category?.icon || '📦' }}
            </div>
          </div>

          <!-- Thumbnails -->
          <div v-if="store.currentProduct.images?.length > 1" class="flex gap-2">
            <button
              v-for="(img, i) in store.currentProduct.images"
              :key="i"
              @click="activeImage = img"
              :class="['w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150',
                activeImage === img || (!activeImage && i === 0)
                  ? 'border-primary-500 shadow-sm'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600']"
            >
              <img :src="img" :alt="`Vista ${i+1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- ── INFO ───────────────────────────────────────────── -->
        <div class="space-y-5">
          <!-- Category + badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge badge-primary">
              {{ store.currentProduct.category?.icon }} {{ store.currentProduct.category?.name }}
            </span>
            <span v-if="store.currentProduct.isFeatured" class="badge badge-warning">⭐ Destacado</span>
            <span v-if="store.currentProduct.discountPercent > 0" class="badge badge-danger">
              −{{ store.currentProduct.discountPercent }}% OFF
            </span>
          </div>

          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            {{ store.currentProduct.name }}
          </h1>

          <p v-if="store.currentProduct.description"
            class="text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ store.currentProduct.description }}
          </p>

          <!-- Price block -->
          <div class="flex items-end gap-4 p-5 bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800 rounded-2xl">
            <div>
              <p class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                ${{ Math.round(store.currentProduct.price * (1 - (store.currentProduct.discountPercent || 0) / 100)).toLocaleString('es-CO') }}
              </p>
              <p v-if="store.currentProduct.discountPercent > 0"
                class="text-base text-gray-400 line-through mt-0.5">
                ${{ store.currentProduct.price.toLocaleString('es-CO') }}
              </p>
            </div>
            <span class="text-sm text-gray-400 dark:text-gray-500 pb-1">
              / {{ store.currentProduct.unit || 'unidad' }}
            </span>
          </div>

          <!-- Stock -->
          <div :class="['flex items-center gap-2 text-sm font-medium',
            store.currentProduct.stock === 0
              ? 'text-red-500 dark:text-red-400'
              : store.currentProduct.stock <= (store.currentProduct.lowStockAlert || 5)
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400']"
          >
            <span v-if="store.currentProduct.stock === 0">❌ Agotado — no disponible</span>
            <span v-else-if="store.currentProduct.stock <= (store.currentProduct.lowStockAlert || 5)">
              ⚠️ Solo quedan {{ store.currentProduct.stock }} unidades
            </span>
            <span v-else>✅ En stock · {{ store.currentProduct.stock }} disponibles</span>
          </div>

          <!-- Quantity + Add to cart -->
          <div v-if="store.currentProduct.stock > 0" class="flex items-center gap-3">
            <!-- Qty controls -->
            <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <button
                @click="qty > 1 && qty--"
                class="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-lg disabled:opacity-40"
                :disabled="qty <= 1"
              >−</button>
              <span class="w-10 text-center font-bold text-gray-900 dark:text-white text-sm select-none">{{ qty }}</span>
              <button
                @click="qty < store.currentProduct.stock && qty++"
                class="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold text-lg disabled:opacity-40"
                :disabled="qty >= store.currentProduct.stock"
              >+</button>
            </div>

            <!-- Add button -->
            <button
              @click="handleAddToCart"
              :disabled="added"
              :class="['flex-1 btn-primary gap-2 text-base py-3 transition-all',
                added ? '!from-emerald-500 !to-emerald-600 !shadow-none' : '']"
            >
              <Transition name="check" mode="out-in">
                <span v-if="added" key="added">✅ Agregado al carrito</span>
                <span v-else key="add">🛒 Agregar al carrito</span>
              </Transition>
            </button>
          </div>

          <div v-else>
            <button disabled class="btn-primary w-full opacity-40 cursor-not-allowed">Producto agotado</button>
          </div>

          <!-- Tags -->
          <div v-if="store.currentProduct.tags?.length" class="flex flex-wrap gap-1.5">
            <span v-for="tag in store.currentProduct.tags" :key="tag" class="badge badge-gray">#{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- ── RELATED ──────────────────────────────────────────── -->
      <section v-if="store.related.length" class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
        <h2 class="section-title mb-6">También te puede gustar</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ProductCard v-for="p in store.related" :key="p._id" :product="p" />
        </div>
      </section>
    </div>

    <!-- 404 -->
    <div v-else class="text-center py-24 px-4">
      <div class="text-5xl mb-4 opacity-40">😕</div>
      <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-5">Producto no encontrado</h2>
      <RouterLink to="/tienda" class="btn-primary">Volver a la tienda</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import TheNavbar   from '../components/TheNavbar.vue'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/products'
import { useCartStore }    from '../stores/cart'

const store       = useProductStore()
const cart        = useCartStore()
const route       = useRoute()
const qty         = ref(1)
const added       = ref(false)
const activeImage = ref(null)

async function load() {
  qty.value = 1
  added.value = false
  activeImage.value = null
  await store.fetchProduct(route.params.id)
}

function handleAddToCart() {
  cart.addItem(store.currentProduct, qty.value)
  added.value = true
  setTimeout(() => { added.value = false }, 2500)
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<style scoped>
.check-enter-active, .check-leave-active { transition: all 0.18s ease; }
.check-enter-from { opacity: 0; transform: scale(0.85); }
.check-leave-to   { opacity: 0; transform: scale(0.85); }
</style>
