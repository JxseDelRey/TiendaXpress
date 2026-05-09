/**
 * chatbotProducts.js
 * Carga y formateo de productos para el chatbot.
 * Modifica FALLBACK_PRODUCTS para cambiar el catálogo de respaldo.
 */

import { productsApi } from '../services/api'
import { formatPrice } from './chatbotFlow'

const PAGE_SIZE = 6

/** Catálogo de respaldo si la API no responde */
export const FALLBACK_PRODUCTS = [
  { _id: 'f1', name: 'Agua 500ml',        price: 1500,  stock: 50, category: { name: 'Bebidas'  }, images: [] },
  { _id: 'f2', name: 'Pan tajado',        price: 4500,  stock: 30, category: { name: 'Panadería'}, images: [] },
  { _id: 'f3', name: 'Leche entera 1L',   price: 3200,  stock: 40, category: { name: 'Lácteos'  }, images: [] },
  { _id: 'f4', name: 'Arroz Diana 500g',  price: 2800,  stock: 60, category: { name: 'Granos'   }, images: [] },
  { _id: 'f5', name: 'Aceite 500ml',      price: 8900,  stock: 25, category: { name: 'Aceites'  }, images: [] },
  { _id: 'f6', name: 'Sal 500g',          price: 1800,  stock: 80, category: { name: 'Condimentos'}, images: [] },
]

/**
 * Carga los productos desde la API con soporte de paginación.
 * Si falla, devuelve el catálogo de respaldo.
 * @returns {Promise<{products: Array, total: number}>}
 */
export async function loadProducts(page = 1, limit = PAGE_SIZE) {
  try {
    const { data } = await productsApi.getAll({ page, limit, active: true })
    const products = data.products ?? data ?? []
    const total    = data.total ?? products.length
    return { products, total, pages: Math.ceil(total / limit) }
  } catch {
    const start = (page - 1) * limit
    const slice = FALLBACK_PRODUCTS.slice(start, start + limit)
    return {
      products: slice,
      total: FALLBACK_PRODUCTS.length,
      pages: Math.ceil(FALLBACK_PRODUCTS.length / limit),
    }
  }
}

/**
 * Construye la lista de quick-reply options para los productos.
 * @param {Array} products
 * @returns {Array<{id: string, label: string, product: Object}>}
 */
export function buildProductOptions(products) {
  return products.map(p => {
    const price = p.discountPercent
      ? p.price * (1 - p.discountPercent / 100)
      : p.price
    const badge = p.discountPercent ? ` 🔥-${p.discountPercent}%` : ''
    return {
      id:      p._id,
      label:   `${p.name} — ${formatPrice(price)}${badge}`,
      product: p,
    }
  })
}

/** Calcula el precio efectivo de un producto (aplicando descuento si aplica) */
export function effectivePrice(product) {
  return product.price * (1 - (product.discountPercent || 0) / 100)
}
