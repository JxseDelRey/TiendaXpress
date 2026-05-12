import axios from 'axios'

const api = axios.create({
  // 1. Agregamos https:// 
  // 2. Agregamos /api al final (asegúrate que tu backend lo use)
  baseURL: import.meta.env.VITE_API_URL || 'https://tiendaxpress-production.up.railway.app/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Adjuntar token JWT automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('txp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejar errores globalmente
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('txp_token')
      localStorage.removeItem('txp_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll:      (params) => api.get('/products', { params }),
  getFeatured: ()       => api.get('/products/featured'),
  getById:     (id)     => api.get(`/products/${id}`),
  getRelated:  (id)     => api.get(`/products/${id}/related`),
  getLowStock: ()       => api.get('/products/low-stock'),
  getTopSelling: (limit)=> api.get('/products/top-selling', { params: { limit } }),
  create:      (data)   => api.post('/products', data),
  update:      (id, d)  => api.put(`/products/${id}`, d),
  delete:      (id)     => api.delete(`/products/${id}`),
}

// ─── Uploads ──────────────────────────────────────────────────────────────────
export const uploadsApi = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  ()       => api.get('/categories'),
  create:  (data)   => api.post('/categories', data),
  update:  (id, d)  => api.put(`/categories/${id}`, d),
  delete:  (id)     => api.delete(`/categories/${id}`),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  create:       (data)     => api.post('/orders', data),
  getAll:       (params)   => api.get('/orders', { params }),
  getById:      (id)       => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventoryApi = {
  getAll:         (productId) => api.get('/inventory', { params: { product: productId } }),
  getLowStock:    ()          => api.get('/inventory/low-stock'),
  createMovement: (data)      => api.post('/inventory/movement', data),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getMetrics:    ()      => api.get('/dashboard/metrics'),
  getSalesChart: (days)  => api.get('/dashboard/sales-chart', { params: { days } }),
  getTopProducts:(limit) => api.get('/dashboard/top-products', { params: { limit } }),
}

// ─── Promotions ───────────────────────────────────────────────────────────────
export const promotionsApi = {
  getAll:   (active) => api.get('/promotions', { params: { active } }),
  create:   (data)   => api.post('/promotions', data),
  update:   (id, d)  => api.put(`/promotions/${id}`, d),
  delete:   (id)     => api.delete(`/promotions/${id}`),
}

export default api
