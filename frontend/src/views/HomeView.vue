<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <TheNavbar />

    <!-- ── HERO ─────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-hero-gradient">
      <!-- Subtle texture layers -->
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/[0.06] rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-white/[0.06] rounded-full blur-2xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28
        flex flex-col md:flex-row items-center gap-12 lg:gap-16">

        <!-- Left: copy -->
        <div class="flex-1 text-white animate-slide-up">
          <!-- Status pill -->
          <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm
            border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></span>
            <span class="text-sm font-medium text-white/90">Abierto ahora · Entrega rápida</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
            Tu tienda de<br/>
            <span class="text-yellow-300">barrio</span> favorita
          </h1>
          <p class="text-lg text-white/80 mb-8 max-w-md leading-relaxed">
            Los mejores productos al mejor precio, siempre cerca de ti. Frescos, rápidos y con el calor de barrio.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <RouterLink to="/tienda"
              class="inline-flex items-center justify-center gap-2 bg-white text-primary-600
                font-bold px-7 py-3.5 rounded-xl shadow-lg
                hover:bg-yellow-50 hover:-translate-y-0.5 active:scale-95
                transition-all duration-200 text-base"
            >
              🛒 Ver productos
            </RouterLink>
            <RouterLink :to="auth.isAuthenticated ? '/perfil' : '/login'"
              class="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm
                border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl
                hover:bg-white/25 active:scale-95 transition-all duration-200"
            >
              👤 Mi cuenta
            </RouterLink>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-8 mt-10 pt-8 border-t border-white/20">
            <div>
              <p class="text-2xl font-extrabold text-yellow-300">+200</p>
              <p class="text-white/60 text-sm mt-0.5">Productos</p>
            </div>
            <div class="w-px h-10 bg-white/20"></div>
            <div>
              <p class="text-2xl font-extrabold text-yellow-300">8</p>
              <p class="text-white/60 text-sm mt-0.5">Categorías</p>
            </div>
            <div class="w-px h-10 bg-white/20"></div>
            <div>
              <p class="text-2xl font-extrabold text-yellow-300">⭐ 4.9</p>
              <p class="text-white/60 text-sm mt-0.5">Calificación</p>
            </div>
          </div>
        </div>

        <!-- Right: carousel -->
        <div class="flex-1 flex items-center justify-center w-full max-w-md md:max-w-none">
          <PromoCarousel />
        </div>
      </div>
    </section>

    <!-- ── CATEGORIES ──────────────────────────────────────────── -->
    <section class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title">Categorías</h2>
      </div>

      <!-- Skeleton -->
      <div v-if="store.loading && !store.categories.length" class="flex gap-3 overflow-x-auto pb-2">
        <div v-for="n in 7" :key="n" class="flex-shrink-0 w-24 h-[88px] bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl animate-pulse"></div>
      </div>

      <div v-else class="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          v-for="cat in store.categories"
          :key="cat._id"
          @click="$router.push(`/tienda?category=${cat._id}`)"
          class="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3.5
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-800
            rounded-2xl shadow-card
            hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800
            transition-all duration-250 cursor-pointer min-w-[80px] group"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform duration-200">{{ cat.icon }}</span>
          <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight whitespace-nowrap">
            {{ cat.name }}
          </span>
        </button>
      </div>
    </section>

    <!-- ── FEATURED PRODUCTS ───────────────────────────────────── -->
    <section class="py-4 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="section-title">⭐ Destacados</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Los más populares de esta semana</p>
        </div>
        <RouterLink to="/tienda" class="btn-secondary btn-sm">Ver todos →</RouterLink>
      </div>

      <!-- Skeletons -->
      <div v-if="store.loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl h-64 animate-pulse"></div>
      </div>
      <!-- Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
        <ProductCard v-for="p in store.featured" :key="p._id" :product="p" />
      </div>
    </section>

    <!-- ── PROMO BANNER ──────────────────────────────────────────── -->
    <section class="py-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="relative overflow-hidden rounded-3xl px-8 py-10 md:px-14 md:py-12"
        style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a2540 100%)">
        <!-- Decorative circles -->
        <div class="absolute right-0 top-0 w-72 h-72 bg-primary-500/5 rounded-full -translate-y-1/3 translate-x-1/4"></div>
        <div class="absolute right-32 bottom-0 w-48 h-48 bg-primary-500/5 rounded-full translate-y-1/2"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div class="text-5xl flex-shrink-0">🎁</div>
          <div class="text-center md:text-left flex-1">
            <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1.5">
              ¡Ofertas especiales cada día!
            </h2>
            <p class="text-slate-400 text-base">Descuentos de hasta el 30% en productos seleccionados</p>
          </div>
          <div class="flex-shrink-0">
            <RouterLink to="/tienda" class="btn-primary shadow-glow">Ver ofertas</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ────────────────────────────────────────────────── -->
    <footer class="bg-gray-900 dark:bg-gray-950 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex flex-col md:flex-row items-center justify-between gap-5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-extrabold text-xs">TX</span>
            </div>
            <span class="font-extrabold text-white text-lg tracking-tight">TiendaXpress</span>
          </div>
          <p class="text-sm text-gray-500">© 2024 TiendaXpress. Tu tienda de barrio de confianza 🧡</p>
          <div class="flex gap-5 text-sm text-gray-500">
            <RouterLink to="/tienda" class="hover:text-white transition-colors">Tienda</RouterLink>
            <RouterLink to="/login"  class="hover:text-white transition-colors">Mi cuenta</RouterLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import TheNavbar     from '../components/TheNavbar.vue'
import ProductCard   from '../components/ProductCard.vue'
import PromoCarousel from '../components/PromoCarousel.vue'
import { useProductStore } from '../stores/products'
import { useAuthStore }    from '../stores/auth'

const store = useProductStore()
const auth  = useAuthStore()

onMounted(async () => {
  await Promise.all([store.fetchFeatured(), store.fetchCategories()])
})
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
