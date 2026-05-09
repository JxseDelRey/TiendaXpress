import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-loaded views
const HomeView      = () => import('../views/HomeView.vue')
const CatalogView   = () => import('../views/CatalogView.vue')
const ProductView   = () => import('../views/ProductView.vue')
const CartView      = () => import('../views/CartView.vue')
const UserProfileView = () => import('../views/UserProfileView.vue')
const LoginView     = () => import('../views/LoginView.vue')

// Admin views
const AdminLayout        = () => import('../views/admin/AdminLayout.vue')
const DashboardView      = () => import('../views/admin/DashboardView.vue')
const AdminProductsView  = () => import('../views/admin/AdminProductsView.vue')
const AdminInventoryView = () => import('../views/admin/AdminInventoryView.vue')
const AdminOrdersView    = () => import('../views/admin/AdminOrdersView.vue')
const AdminCategoriesView= () => import('../views/admin/AdminCategoriesView.vue')

const routes = [
  // Public
  { path: '/',           name: 'home',    component: HomeView },
  { path: '/tienda',     name: 'catalog', component: CatalogView },
  { path: '/producto/:id', name: 'product', component: ProductView },
  { path: '/carrito',    name: 'cart',    component: CartView },
  { path: '/perfil',     name: 'profile', component: UserProfileView },
  { path: '/login',      name: 'login',   component: LoginView },

  // Admin (protected)
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '',           name: 'dashboard',       component: DashboardView },
      { path: 'productos',  name: 'admin-products',  component: AdminProductsView },
      { path: 'inventario', name: 'admin-inventory', component: AdminInventoryView },
      { path: 'pedidos',    name: 'admin-orders',    component: AdminOrdersView },
      { path: 'categorias', name: 'admin-categories',component: AdminCategoriesView },
    ],
  },
  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
  }
  next()
})

export default router
