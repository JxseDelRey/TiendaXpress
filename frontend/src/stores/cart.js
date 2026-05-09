import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // Persistir carrito en localStorage
  const items = ref(JSON.parse(localStorage.getItem('txp_cart') || '[]'))

  const totalItems  = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice  = computed(() => items.value.reduce((s, i) => s + i.unitPrice * i.quantity, 0))
  const itemCount   = computed(() => items.value.length)

  function persist() {
    localStorage.setItem('txp_cart', JSON.stringify(items.value))
  }

  function addItem(product, quantity = 1) {
    const existing = items.value.find(i => i.productId === product._id)
    const unitPrice = product.price * (1 - (product.discountPercent || 0) / 100)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock)
    } else {
      items.value.push({
        productId: product._id,
        name: product.name,
        unitPrice,
        originalPrice: product.price,
        discountPercent: product.discountPercent || 0,
        image: product.images?.[0] || '',
        quantity,
        stock: product.stock,
      })
    }
    persist()
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.productId !== productId)
    persist()
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    if (quantity <= 0) { removeItem(productId); return }
    item.quantity = Math.min(quantity, item.stock)
    persist()
  }

  function clearCart() {
    items.value = []
    localStorage.removeItem('txp_cart')
  }

  function getCheckoutPayload(customerName, customerDocument, customerPhone, paymentMethod, notes) {
    return {
      items: items.value.map(i => ({ product: i.productId, quantity: i.quantity })),
      customerName,
      customerDocument,
      customerPhone,
      paymentMethod,
      notes,
    }
  }

  return {
    items, totalItems, totalPrice, itemCount,
    addItem, removeItem, updateQuantity, clearCart, getCheckoutPayload,
  }
})
