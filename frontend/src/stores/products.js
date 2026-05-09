import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsApi, categoriesApi } from '../services/api'

export const useProductStore = defineStore('products', () => {
  const products  = ref([])
  const featured  = ref([])
  const categories= ref([])
  const total     = ref(0)
  const pages     = ref(1)
  const loading   = ref(false)
  const error     = ref(null)
  const currentProduct = ref(null)
  const related   = ref([])

  async function fetchProducts(params = {}) {
    loading.value = true; error.value = null
    try {
      const { data } = await productsApi.getAll(params)
      products.value = data.products
      total.value    = data.total
      pages.value    = data.pages
    } catch (err) {
      error.value = 'Error al cargar productos'
    } finally {
      loading.value = false
    }
  }

  async function fetchFeatured() {
    try {
      const { data } = await productsApi.getFeatured()
      featured.value = data
    } catch {}
  }

  async function fetchProduct(id) {
    loading.value = true; error.value = null
    try {
      const [productRes, relatedRes] = await Promise.all([
        productsApi.getById(id),
        productsApi.getRelated(id),
      ])
      currentProduct.value = productRes.data
      related.value = relatedRes.data
    } catch {
      error.value = 'Producto no encontrado'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await categoriesApi.getAll()
      categories.value = data
    } catch {}
  }

  // Admin CRUD
  async function createProduct(data) {
    const res = await productsApi.create(data)
    return res.data
  }

  async function updateProduct(id, data) {
    const res = await productsApi.update(id, data)
    return res.data
  }

  async function deleteProduct(id) {
    await productsApi.delete(id)
    products.value = products.value.filter(p => p._id !== id)
  }

  return {
    products, featured, categories, total, pages, loading, error,
    currentProduct, related,
    fetchProducts, fetchFeatured, fetchProduct, fetchCategories,
    createProduct, updateProduct, deleteProduct,
  }
})
