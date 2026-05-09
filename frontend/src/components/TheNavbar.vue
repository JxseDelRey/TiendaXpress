<template>
  <nav class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md
    border-b border-gray-200/70 dark:border-gray-800/70 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group flex-shrink-0">
          <div class="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center
            shadow-[0_2px_8px_rgba(255,107,53,0.30)]
            group-hover:shadow-[0_4px_14px_rgba(255,107,53,0.42)]
            group-hover:scale-105 transition-all duration-300">
            <span class="text-white font-extrabold text-sm tracking-tight">TX</span>
          </div>
          <span class="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight leading-none">
            Tienda<span class="text-primary-500">Xpress</span>
          </span>
        </RouterLink>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-0.5">
          <RouterLink to="/"       class="btn-ghost text-sm" active-class="!text-primary-500 !bg-primary-50 dark:!bg-primary-900/20">Inicio</RouterLink>
          <RouterLink to="/tienda" class="btn-ghost text-sm" active-class="!text-primary-500 !bg-primary-50 dark:!bg-primary-900/20">Tienda</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="btn-ghost text-sm" active-class="!text-primary-500 !bg-primary-50 dark:!bg-primary-900/20">
            ⚙️ Admin
          </RouterLink>
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-1.5">

          <!-- Theme toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            :title="isDark ? 'Modo claro' : 'Modo oscuro'"
          >
            <!-- Moon icon -->
            <svg v-if="!isDark" class="w-4.5 h-4.5 w-[18px] h-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <!-- Sun icon -->
            <svg v-else class="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </button>

          <!-- Cart -->
          <RouterLink
            to="/carrito"
            class="relative p-2 rounded-xl text-gray-600 dark:text-gray-400
              hover:text-primary-500 dark:hover:text-primary-400
              hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-150"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <Transition name="badge-pop">
              <span
                v-if="cart.totalItems > 0"
                class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                  bg-primary-500 text-white text-[10px] font-bold rounded-full
                  flex items-center justify-center leading-none"
              >
                {{ cart.totalItems > 9 ? '9+' : cart.totalItems }}
              </span>
            </Transition>
          </RouterLink>

          <!-- User menu (authenticated) -->
          <div v-if="auth.isAuthenticated" class="relative" ref="userMenu">
            <button
              @click="menuOpen = !menuOpen"
              class="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            >
              <div class="w-7 h-7 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-xs">{{ auth.user?.name?.[0]?.toUpperCase() }}</span>
              </div>
              <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ auth.user?.name?.split(' ')[0] }}
              </span>
              <svg class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': menuOpen }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <Transition name="dropdown">
              <div
                v-if="menuOpen"
                class="absolute right-0 mt-2 w-48 card-elevated py-1.5 z-50"
              >
                <RouterLink to="/perfil"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  @click="menuOpen = false"
                >
                  <span class="text-base">👤</span> Mi Cuenta
                </RouterLink>
                <RouterLink v-if="auth.isAdmin" to="/admin"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  @click="menuOpen = false"
                >
                  <span class="text-base">⚙️</span> Panel Admin
                </RouterLink>
                <div class="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500
                    hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span class="text-base">🚪</span> Cerrar sesión
                </button>
              </div>
            </Transition>
          </div>

          <!-- Login button (guest) -->
          <RouterLink
            v-else
            to="/login"
            class="btn-primary btn-sm hidden sm:inline-flex"
          >
            Entrar
          </RouterLink>

          <!-- Mobile hamburger -->
          <button
            @click="mobileOpen = !mobileOpen"
            class="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="mobileOpen" class="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-0.5">
          <RouterLink to="/"       class="block btn-ghost w-full justify-start" @click="mobileOpen = false">🏠 Inicio</RouterLink>
          <RouterLink to="/tienda" class="block btn-ghost w-full justify-start" @click="mobileOpen = false">🛒 Tienda</RouterLink>
          <RouterLink to="/carrito" class="block btn-ghost w-full justify-start" @click="mobileOpen = false">🛍️ Carrito</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="block btn-ghost w-full justify-start" @click="mobileOpen = false">⚙️ Admin</RouterLink>
          <RouterLink v-if="!auth.isAuthenticated" to="/login" class="block btn-ghost w-full justify-start" @click="mobileOpen = false">👤 Iniciar sesión</RouterLink>
          <button v-if="auth.isAuthenticated" @click="handleLogout" class="block w-full btn-ghost justify-start text-red-500">🚪 Cerrar sesión</button>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const auth        = useAuthStore()
const cart        = useCartStore()
const router      = useRouter()
const menuOpen    = ref(false)
const mobileOpen  = ref(false)
const userMenu    = ref(null)
const isDark      = ref(localStorage.getItem('theme') === 'dark')

// Apply theme on mount
if (isDark.value || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  isDark.value = true
  document.documentElement.classList.add('dark')
} else {
  isDark.value = false
  document.documentElement.classList.remove('dark')
}

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function handleLogout() {
  auth.logout()
  menuOpen.value  = false
  mobileOpen.value = false
  router.push('/')
}

// Close dropdown on outside click
function handleOutsideClick(e) {
  if (userMenu.value && !userMenu.value.contains(e.target)) {
    menuOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-enter-from, .dropdown-leave-to       { opacity: 0; transform: translateY(-6px) scale(0.97); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.22s ease; }
.slide-down-enter-from, .slide-down-leave-to       { opacity: 0; transform: translateY(-8px); }

.badge-pop-enter-active, .badge-pop-leave-active { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.badge-pop-enter-from, .badge-pop-leave-to       { opacity: 0; transform: scale(0.5); }
</style>
