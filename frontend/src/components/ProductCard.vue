<template>
  <article
    class="group relative card overflow-hidden cursor-pointer"
    :class="{ 'opacity-60': product.stock === 0 }"
    style="transition: box-shadow 0.25s ease, transform 0.25s ease;"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="$router.push(`/producto/${product._id}`)"
  >
    <!-- ── IMAGE ───────────────────────────────────────────────── -->
    <div class="relative overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-square">
      <img
        v-if="product.images?.[0]"
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 ease-out"
        :class="hovered ? 'scale-105' : 'scale-100'"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-5xl select-none transition-transform duration-500 ease-out"
        :class="hovered ? 'scale-110' : 'scale-100'"
      >
        {{ product.category?.icon || '📦' }}
      </div>

      <!-- Badges top-left -->
      <div class="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
        <span
          v-if="product.discountPercent > 0"
          class="badge bg-red-500 text-white text-[11px] font-bold shadow-sm"
        >
          −{{ product.discountPercent }}%
        </span>
        <span
          v-if="product.isFeatured"
          class="badge bg-white/90 dark:bg-gray-900/80 text-amber-500 text-[11px] shadow-sm backdrop-blur-sm"
        >
          ⭐
        </span>
      </div>

      <!-- Low stock warning -->
      <div
        v-if="product.stock > 0 && product.stock <= (product.lowStockAlert || 5)"
        class="absolute top-2.5 right-2.5 z-10"
      >
        <span class="badge bg-amber-400 text-white text-[11px] shadow-sm">¡Últimas!</span>
      </div>

      <!-- Out of stock overlay -->
      <div
        v-if="product.stock === 0"
        class="absolute inset-0 bg-gray-900/55 backdrop-blur-[1px] flex items-center justify-center z-20"
      >
        <span class="text-white font-bold text-sm bg-gray-900/70 px-3 py-1.5 rounded-full">
          Agotado
        </span>
      </div>

      <!-- Quick Add button (slides up on hover) -->
      <button
        v-if="product.stock > 0"
        @click.stop="handleAdd"
        class="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full
          bg-gradient-to-br from-primary-500 to-primary-600
          text-white shadow-md
          flex items-center justify-center
          transition-all duration-300"
        :class="hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'"
        aria-label="Agregar al carrito"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- ── INFO ─────────────────────────────────────────────────── -->
    <div class="p-3.5">
      <p class="text-[11px] font-semibold text-primary-500 dark:text-primary-400 mb-0.5 uppercase tracking-wide truncate">
        {{ product.category?.name || 'General' }}
      </p>
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug mb-2.5 line-clamp-2 min-h-[2.75rem]">
        {{ product.name }}
      </h3>

      <div class="flex items-end justify-between gap-2">
        <div class="leading-none">
          <p class="text-base font-bold text-gray-900 dark:text-white">
            ${{ effectivePrice.toLocaleString('es-CO') }}
          </p>
          <p v-if="product.discountPercent > 0" class="text-[11px] text-gray-400 line-through mt-0.5">
            ${{ product.price.toLocaleString('es-CO') }}
          </p>
        </div>
        <span class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          {{ product.unit || 'und' }}
        </span>
      </div>
    </div>

    <!-- ── ADDED TOAST ──────────────────────────────────────────── -->
    <Transition name="toast">
      <div
        v-if="added"
        class="absolute inset-0 z-30 flex items-center justify-center
          bg-emerald-500/10 dark:bg-emerald-500/15 backdrop-blur-[1px] rounded-2xl"
      >
        <span class="bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg animate-scale-in">
          ✓ Agregado
        </span>
      </div>
    </Transition>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'

const props = defineProps({ product: { type: Object, required: true } })
const cart  = useCartStore()
const hovered = ref(false)
const added   = ref(false)

const effectivePrice = computed(() =>
  Math.round(props.product.price * (1 - (props.product.discountPercent || 0) / 100))
)

function handleAdd() {
  cart.addItem(props.product, 1)
  added.value = true
  setTimeout(() => { added.value = false }, 1800)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card hover lift (scoped, so it can reference the article selector) */
article:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.11), 0 2px 8px rgba(0, 0, 0, 0.06);
}
article:active {
  transform: translateY(-1px);
}

/* Added toast transition */
.toast-enter-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.18s ease; }
.toast-enter-from   { opacity: 0; transform: scale(0.95); }
.toast-leave-to     { opacity: 0; transform: scale(0.98); }

@keyframes scale-in {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
