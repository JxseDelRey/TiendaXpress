<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside :class="['fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <!-- Logo -->
      <div class="flex items-center gap-3 p-6 border-b border-gray-100">
        <div class="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md">
          <span class="text-white font-black">TX</span>
        </div>
        <div>
          <p class="font-black text-gray-800">TiendaXpress</p>
          <p class="text-xs text-gray-400">Panel Admin</p>
        </div>
        <button @click="sidebarOpen = false" class="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <RouterLink v-for="item in navItems" :key="item.to"
          :to="item.to" :end="item.exact"
          class="sidebar-item"
          active-class="active"
          @click="sidebarOpen = false">
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User + logout -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 px-3 py-2 mb-2">
          <div class="w-9 h-9 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-sm">{{ auth.user?.name?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-primary-500">Administrador</p>
          </div>
        </div>
        <RouterLink to="/" class="sidebar-item text-sm">
          <span>🏠</span> Ver tienda
        </RouterLink>
        <button @click="handleLogout" class="sidebar-item w-full text-sm text-red-500 hover:!bg-red-50 hover:!text-red-600">
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false"
      class="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"></div>

    <!-- Main content -->
    <div class="flex-1 lg:ml-64 min-h-screen flex flex-col">
      <!-- Topbar -->
      <header class="sticky top-0 z-20 flex items-center gap-4 px-4 md:px-8 h-16 bg-white border-b border-gray-100">
        <button @click="sidebarOpen = true" class="lg:hidden p-2 rounded-xl hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h1 class="font-bold text-gray-800 text-lg">{{ currentTitle }}</h1>
        <div class="ml-auto text-sm text-gray-400">{{ currentDate }}</div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 md:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route  = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin',           label: 'Dashboard',   icon: '📊', exact: true },
  { to: '/admin/productos', label: 'Productos',    icon: '📦' },
  { to: '/admin/inventario',label: 'Inventario',   icon: '📋' },
  { to: '/admin/pedidos',   label: 'Pedidos',      icon: '🛒' },
  { to: '/admin/categorias',label: 'Categorías',   icon: '🏷️' },
]

const routeTitles = {
  'dashboard':       '📊 Dashboard',
  'admin-products':  '📦 Gestión de Productos',
  'admin-inventory': '📋 Control de Inventario',
  'admin-orders':    '🛒 Pedidos',
  'admin-categories':'🏷️ Categorías',
}
const currentTitle = computed(() => routeTitles[route.name] || 'Admin')
const currentDate  = computed(() => new Date().toLocaleDateString('es-CO', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}))

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
