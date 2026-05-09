<template>
  <div class="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl group animate-slide-up bg-white/20 backdrop-blur">
    
    <div v-if="!discountedProducts.length" class="w-full h-full flex items-center justify-center text-9xl">
      🛒
    </div>
    
    <div v-else class="w-full h-full relative" @mouseenter="pause" @mouseleave="resume">
      <!-- Card Image -->
      <img v-if="currentProduct.images && currentProduct.images.length" 
           :src="currentProduct.images[0]" 
           class="w-full h-full object-cover" 
           alt="Producto en oferta" />
      <div v-else class="w-full h-full bg-gradient-to-br from-primary-50 to-orange-100 dark:from-primary-900 dark:to-orange-900 flex items-center justify-center text-8xl">
        📦
      </div>

      <!-- Backdrop overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex flex-col justify-end p-6">
        
        <!-- Discount Tag -->
        <div class="absolute top-4 right-4 bg-red-500 text-white font-black px-3 py-1 rounded-full shadow-lg text-sm flex items-center gap-1 animate-pulse">
          <span>🏷️</span> -{{ currentProduct.discountPercent }}%
        </div>

        <h3 class="text-white font-black text-xl md:text-2xl mb-1 drop-shadow-md leading-tight line-clamp-2">
          {{ currentProduct.name }}
        </h3>
        
        <div class="flex items-end gap-3 mt-1">
          <span class="text-3xl font-black text-yellow-300 drop-shadow-md">
            ${{ getDiscountedPrice(currentProduct).toLocaleString('es-CO') }}
          </span>
          <span class="text-lg text-gray-300 font-semibold line-through mb-1 drop-shadow-sm">
            ${{ currentProduct.price.toLocaleString('es-CO') }}
          </span>
        </div>
      </div>

      <!-- Arrow Controls -->
      <button v-if="discountedProducts.length > 1" @click.stop="prev" class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button v-if="discountedProducts.length > 1" @click.stop="next" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      <!-- Progress dots -->
      <div v-if="discountedProducts.length > 1" class="absolute bottom-2 left-0 w-full flex justify-center gap-1.5 z-10">
        <button v-for="(_, idx) in discountedProducts" :key="idx" 
          @click="currentIndex = idx"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'">
        </button>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '../stores/products'

const store = useProductStore()
const currentIndex = ref(0)
let timer = null

const discountedProducts = computed(() => {
  return store.products.filter(p => p.discountPercent > 0)
})

const currentProduct = computed(() => {
  if (!discountedProducts.value.length) return null
  if (currentIndex.value >= discountedProducts.value.length) currentIndex.value = 0
  return discountedProducts.value[currentIndex.value]
})

function getDiscountedPrice(p) {
  return Math.round(p.price * (1 - (p.discountPercent || 0) / 100))
}

function next() {
  if (discountedProducts.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % discountedProducts.value.length
}

function prev() {
  if (discountedProducts.value.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + discountedProducts.value.length) % discountedProducts.value.length
}

function pause() {
  clearInterval(timer)
}

function resume() {
  clearInterval(timer)
  timer = setInterval(next, 10000)
}

onMounted(async () => {
  if (store.products.length === 0) {
    await store.fetchProducts()
  }
  resume()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
