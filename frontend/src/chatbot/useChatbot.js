/**
 * useChatbot.js
 * Composable principal del chatbot. Gestiona estado, flujo y lógica de negocio.
 * Importado y usado exclusivamente por ChatbotWidget.vue
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ordersApi } from '../services/api'
import {
  STEPS,
  MAIN_MENU_OPTIONS,
  QTY_OPTIONS,
  CART_OPTIONS,
  CONFIRM_OPTIONS,
  SUCCESS_OPTIONS,
  buildGreeting,
  formatPrice,
} from './chatbotFlow'
import {
  loadProducts,
  buildProductOptions,
  effectivePrice,
} from './chatbotProducts'

const SESSION_KEY = 'txp_chat_session'

export function useChatbot() {
  const auth = useAuthStore()

  // ─── Estado principal ────────────────────────────────────────────────────────
  const isOpen      = ref(false)
  const isTyping    = ref(false)
  const messages    = ref([])
  const step        = ref(STEPS.GREETING)
  const quickReplies = ref([])

  // Estado de navegación de productos
  const allProducts      = ref([])
  const productPage      = ref(1)
  const productPages     = ref(1)
  const selectedProduct  = ref(null)

  // Carrito interno del chatbot
  const cartItems = ref([])

  // Datos del cliente
  const customerData = ref({ name: '', phone: '', address: '', email: '' })

  // Para manejo de cantidad personalizada
  const awaitingCustomQty = ref(false)

  // ID del pedido creado
  const lastOrderId = ref(null)

  // ─── Computados ─────────────────────────────────────────────────────────────
  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  )

  const cartCount = computed(() =>
    cartItems.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  // ─── Helpers de mensajes ────────────────────────────────────────────────────
  function pushBot(text, delayMs = 600) {
    return new Promise(resolve => {
      isTyping.value = true
      setTimeout(() => {
        isTyping.value = false
        messages.value.push({ id: Date.now() + Math.random(), from: 'bot', text })
        resolve()
      }, delayMs)
    })
  }

  function pushUser(text) {
    messages.value.push({ id: Date.now() + Math.random(), from: 'user', text })
  }

  function setQuickReplies(options) {
    quickReplies.value = options
  }

  function clearQuickReplies() {
    quickReplies.value = []
  }

  // ─── Persistir / restaurar sesión ───────────────────────────────────────────
  function saveSession() {
    try {
      const session = {
        messages: messages.value,
        step: step.value,
        cartItems: cartItems.value,
        customerData: customerData.value,
        productPage: productPage.value,
        productPages: productPages.value,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {}
  }

  function restoreSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return false
      const s = JSON.parse(raw)
      messages.value     = s.messages     || []
      step.value         = s.step         || STEPS.GREETING
      cartItems.value    = s.cartItems    || []
      customerData.value = s.customerData || { name: '', phone: '', address: '', email: '' }
      productPage.value  = s.productPage  || 1
      productPages.value = s.productPages || 1
      return messages.value.length > 0
    } catch {
      return false
    }
  }

  // ─── Flujo: GREETING ───────────────────────────────────────────────────────
  async function startGreeting() {
    step.value = STEPS.GREETING
    const userName = auth.isAuthenticated ? auth.user?.name?.split(' ')[0] : null
    await pushBot(buildGreeting(userName), 800)
    await pushBot('¿Qué deseas hacer?', 400)
    setQuickReplies(MAIN_MENU_OPTIONS)
    step.value = STEPS.MENU
    saveSession()
  }

  // ─── Flujo: MENU ──────────────────────────────────────────────────────────
  async function handleMenuOption(optionId) {
    clearQuickReplies()
    switch (optionId) {
      case 'browse':
        await startBrowsing()
        break
      case 'cart':
        await showCart()
        break
      case 'confirm':
        if (cartItems.value.length === 0) {
          await pushBot('🛒 Tu carrito está vacío. Primero agrega algunos productos.')
          setQuickReplies(MAIN_MENU_OPTIONS)
        } else {
          await startCheckout()
        }
        break
      case 'restart':
        resetChatbot()
        break
      default:
        await pushFallback()
    }
    saveSession()
  }

  // ─── Flujo: BROWSING ──────────────────────────────────────────────────────
  async function startBrowsing(page = 1) {
    step.value = STEPS.BROWSING
    productPage.value = page
    await pushBot(page === 1 ? '🛒 Cargando productos...' : '📦 Mostrando más productos...', 300)
    isTyping.value = true

    const { products, pages } = await loadProducts(page)
    allProducts.value  = products
    productPages.value = pages
    isTyping.value = false

    if (products.length === 0) {
      await pushBot('😕 No encontré productos disponibles en este momento.')
      setQuickReplies(MAIN_MENU_OPTIONS)
      step.value = STEPS.MENU
      return
    }

    await pushBot(`Tenemos ${products.length} producto(s) disponibles. ¡Elige el que quieras!`)

    const productOpts = buildProductOptions(products)
    const navOpts = []
    if (page < pages) navOpts.push({ id: 'next_page', label: '➡️ Ver más' })
    if (page > 1)     navOpts.push({ id: 'prev_page', label: '⬅️ Anterior' })
    navOpts.push({ id: 'menu', label: '🔙 Menú principal' })

    setQuickReplies([...productOpts, ...navOpts])
    saveSession()
  }

  // ─── Flujo: Selección de producto ────────────────────────────────────────
  async function handleProductSelected(option) {
    clearQuickReplies()
    selectedProduct.value = option.product
    step.value = STEPS.PRODUCT_QTY
    awaitingCustomQty.value = false

    const p = option.product
    const price = effectivePrice(p)
    const discountLine = p.discountPercent ? ` (descuento ${p.discountPercent}%)` : ''
    const stockLine = p.stock > 0 ? `📦 Stock disponible: ${p.stock}` : '⚠️ Stock limitado'

    await pushBot(
      `Has seleccionado **${p.name}**\n💰 Precio: ${formatPrice(price)}${discountLine}\n${stockLine}\n\n¿Cuántas unidades deseas agregar?`
    )
    setQuickReplies(QTY_OPTIONS)
    saveSession()
  }

  // ─── Flujo: Cantidad ──────────────────────────────────────────────────────
  async function handleQuantity(rawInput) {
    clearQuickReplies()
    const product = selectedProduct.value
    if (!product) { await pushFallback(); return }

    if (rawInput === 'custom') {
      awaitingCustomQty.value = true
      await pushBot('✏️ Escribe la cantidad que deseas (número):')
      return
    }

    const qty = parseInt(rawInput, 10)
    if (!qty || qty <= 0) {
      await pushBot('⚠️ Por favor ingresa una cantidad válida (número mayor a 0).')
      setQuickReplies(QTY_OPTIONS)
      return
    }

    const maxQty = product.stock || 99
    const finalQty = Math.min(qty, maxQty)

    if (qty > maxQty) {
      await pushBot(`⚠️ Solo hay ${maxQty} unidades disponibles. Se agregarán ${maxQty}.`)
    }

    addToCart(product, finalQty)
    const price = effectivePrice(product)

    await pushBot(
      `✅ Agregado: **${product.name}** × ${finalQty} = ${formatPrice(price * finalQty)}\n\n¿Qué deseas hacer ahora?`
    )
    setQuickReplies([
      { id: 'browse',    label: '🛒 Seguir comprando' },
      { id: 'cart',      label: '🛍️ Ver carrito'      },
      { id: 'checkout',  label: '✅ Confirmar pedido'  },
    ])
    step.value = STEPS.MENU
    awaitingCustomQty.value = false
    saveSession()
  }

  // ─── Carrito interno ──────────────────────────────────────────────────────
  function addToCart(product, quantity) {
    const existing = cartItems.value.find(i => i.productId === product._id)
    const unitPrice = effectivePrice(product)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock || 99)
    } else {
      cartItems.value.push({
        productId:   product._id,
        name:        product.name,
        unitPrice,
        quantity,
        stock:       product.stock || 99,
        image:       product.images?.[0] || '',
      })
    }
  }

  function removeFromCart(productId) {
    cartItems.value = cartItems.value.filter(i => i.productId !== productId)
  }

  function clearCart() {
    cartItems.value = []
  }

  // ─── Flujo: Ver carrito ───────────────────────────────────────────────────
  async function showCart() {
    step.value = STEPS.CART_VIEW
    clearQuickReplies()

    if (cartItems.value.length === 0) {
      await pushBot('🛒 Tu carrito está vacío. ¡Agrega productos primero!')
      setQuickReplies([
        { id: 'browse', label: '🛒 Ver productos' },
        { id: 'menu',   label: '🏠 Menú principal' },
      ])
      step.value = STEPS.MENU
      return
    }

    const lines = cartItems.value.map(
      i => `• ${i.name} × ${i.quantity} = ${formatPrice(i.unitPrice * i.quantity)}`
    ).join('\n')

    await pushBot(`🛍️ **Tu carrito:**\n\n${lines}\n\n💰 **Total: ${formatPrice(cartTotal.value)}**`)
    setQuickReplies(CART_OPTIONS)
    saveSession()
  }

  // ─── Flujo: Checkout ─────────────────────────────────────────────────────
  async function startCheckout() {
    clearQuickReplies()

    // Pre-llenar datos si el usuario está autenticado
    if (auth.isAuthenticated && auth.user) {
      customerData.value.name  = auth.user.name  || ''
      customerData.value.email = auth.user.email || ''
      customerData.value.phone = auth.user.phone || ''
    }

    if (!customerData.value.name) {
      step.value = STEPS.COLLECT_NAME
      await pushBot('📝 Para procesar tu pedido necesito algunos datos.\n\n¿Cuál es tu nombre completo?')
    } else {
      step.value = STEPS.COLLECT_PHONE
      await pushBot(`✅ Hola ${customerData.value.name}!\n\n¿Cuál es tu número de teléfono? (Ej: 3001234567)`)
    }
    saveSession()
  }

  // ─── Flujo: Captura de datos ──────────────────────────────────────────────
  async function handleCollectName(input) {
    const name = input.trim()
    if (!name || name.length < 2) {
      await pushBot('⚠️ Por favor ingresa tu nombre completo (mínimo 2 caracteres).')
      return
    }
    customerData.value.name = name
    step.value = STEPS.COLLECT_PHONE
    await pushBot(`¡Hola, ${name}! 😊\n\n¿Cuál es tu número de teléfono? (10 dígitos, Ej: 3001234567)`)
    saveSession()
  }

  async function handleCollectPhone(input) {
    const phone = input.trim().replace(/\s+/g, '')
    const phoneRegex = /^[0-9]{7,15}$/
    if (!phoneRegex.test(phone)) {
      await pushBot('⚠️ El teléfono no parece válido. Ingresa solo números (7-15 dígitos), por ejemplo: 3001234567')
      return
    }
    customerData.value.phone = phone
    step.value = STEPS.COLLECT_ADDRESS
    await pushBot('📍 ¿Cuál es tu dirección de entrega? (Calle, número, barrio, ciudad)')
    saveSession()
  }

  async function handleCollectAddress(input) {
    const address = input.trim()
    if (!address || address.length < 5) {
      await pushBot('⚠️ Por favor ingresa una dirección más completa (mínimo 5 caracteres).')
      return
    }
    customerData.value.address = address
    step.value = STEPS.COLLECT_EMAIL
    // Pre-fill email if authenticated
    if (auth.isAuthenticated && auth.user?.email && !customerData.value.email) {
      customerData.value.email = auth.user.email
    }
    if (customerData.value.email) {
      step.value = STEPS.CONFIRM_ORDER
      await showOrderSummary()
    } else {
      await pushBot('📧 Por último, ¿cuál es tu correo electrónico para enviarte la confirmación del pedido?')
    }
    saveSession()
  }

  async function handleCollectEmail(input) {
    const email = input.trim().toLowerCase()
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      await pushBot('⚠️ El correo es obligatorio. ¿Cuál es tu correo electrónico?')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      await pushBot('⚠️ El correo no parece válido. Ingresa un correo como: nombre@dominio.com')
      return
    }
    customerData.value.email = email
    step.value = STEPS.CONFIRM_ORDER
    await showOrderSummary()
    saveSession()
  }

  // ─── Flujo: Resumen y confirmación ───────────────────────────────────────
  async function showOrderSummary() {
    const lines = cartItems.value.map(
      i => `• ${i.name} × ${i.quantity} — ${formatPrice(i.unitPrice * i.quantity)}`
    ).join('\n')
    const cd = customerData.value

    const summary =
      `📋 **Resumen de tu pedido:**\n\n` +
      `${lines}\n\n` +
      `💰 **Total: ${formatPrice(cartTotal.value)}**\n\n` +
      `👤 Nombre: ${cd.name}\n` +
      `📱 Teléfono: ${cd.phone}\n` +
      `📍 Dirección: ${cd.address}` +
      (cd.email ? `\n📧 Email: ${cd.email}` : '')

    await pushBot(summary)
    await pushBot('¿Confirmas tu pedido?', 400)
    setQuickReplies(CONFIRM_OPTIONS)
  }

  // ─── Flujo: Crear pedido ──────────────────────────────────────────────────
  async function placeOrder() {
    clearQuickReplies()
    isTyping.value = true

    const payload = {
      items: cartItems.value.map(i => ({
        product:  i.productId,
        quantity: i.quantity,
      })),
      customerName:  customerData.value.name,
      customerPhone: customerData.value.phone,
      notes:         `Dirección: ${customerData.value.address}` +
                     ` | 📧 Email: ${customerData.value.email}` +
                     ' | Pedido vía chatbot',
      paymentMethod: 'efectivo',
    }

    try {
      const { data } = await ordersApi.create(payload)
      lastOrderId.value = data._id || data.id || 'N/A'
      isTyping.value = false
      step.value = STEPS.ORDER_SUCCESS

      await pushBot(
        `🎉 **¡Pedido registrado con éxito!**\n\n` +
        `📦 Pedido: #${String(lastOrderId.value).slice(-6).toUpperCase()}\n` +
        `⏱️ Tiempo estimado: 20-40 minutos\n\n` +
        `Te contactaremos al ${customerData.value.phone} para confirmar.\n` +
        `💚 ¡Gracias por comprar en TiendaXpress!`
      )
    } catch (err) {
      isTyping.value = false
      const msg = err.response?.data?.message || 'Error desconocido'
      await pushBot(
        `😕 Hubo un error al registrar tu pedido: ${msg}\n\nPor favor intenta de nuevo o contáctanos.`
      )
      step.value = STEPS.CONFIRM_ORDER
      setQuickReplies(CONFIRM_OPTIONS)
      return
    }

    setQuickReplies(SUCCESS_OPTIONS)
    clearCart()
    saveSession()
  }

  // ─── Flujo: Post-éxito ────────────────────────────────────────────────────
  async function handleSuccessOption(optionId) {
    clearQuickReplies()
    if (optionId === 'new_order') {
      customerData.value = { name: '', phone: '', address: '', email: '' }
      await startBrowsing()
    } else {
      await startGreeting()
    }
  }

  // ─── Fallback ────────────────────────────────────────────────────────────
  async function pushFallback() {
    await pushBot('🤔 No entendí eso. Por favor elige una de las opciones o escribe tu respuesta claramente.')
    // Volver a mostrar opciones del paso actual
    if (step.value === STEPS.MENU || step.value === STEPS.GREETING) {
      setQuickReplies(MAIN_MENU_OPTIONS)
      step.value = STEPS.MENU
    }
  }

  // ─── Reset total ─────────────────────────────────────────────────────────
  function resetChatbot() {
    messages.value          = []
    step.value              = STEPS.GREETING
    quickReplies.value      = []
    cartItems.value         = []
    customerData.value      = { name: '', phone: '', address: '', email: '' }
    selectedProduct.value   = null
    allProducts.value       = []
    productPage.value       = 1
    productPages.value      = 1
    awaitingCustomQty.value = false
    lastOrderId.value       = null
    sessionStorage.removeItem(SESSION_KEY)
    startGreeting()
  }

  // ─── Entrada de texto libre ──────────────────────────────────────────────
  async function handleTextInput(text) {
    if (!text.trim()) return
    pushUser(text)
    clearQuickReplies()

    switch (step.value) {
      case STEPS.COLLECT_NAME:
        await handleCollectName(text)
        break
      case STEPS.COLLECT_PHONE:
        await handleCollectPhone(text)
        break
      case STEPS.COLLECT_ADDRESS:
        await handleCollectAddress(text)
        break
      case STEPS.COLLECT_EMAIL:
        await handleCollectEmail(text)
        break
      case STEPS.PRODUCT_QTY:
        // Cantidad personalizada escrita manualmente
        await handleQuantity(text)
        break
      case STEPS.BROWSING:
      case STEPS.MENU:
        // Intentar interpretación de texto libre en menú
        await pushFallback()
        break
      default:
        await pushFallback()
    }
    saveSession()
  }

  // ─── Quick reply handler ─────────────────────────────────────────────────
  async function handleQuickReply(option) {
    pushUser(option.label)
    clearQuickReplies()

    // Navegación de productos
    if (option.id === 'next_page') { await startBrowsing(productPage.value + 1); return }
    if (option.id === 'prev_page') { await startBrowsing(productPage.value - 1); return }

    // Menú principal
    if (option.id === 'menu')    { await startGreeting(); return }
    if (option.id === 'browse')  { await startBrowsing(); return }
    if (option.id === 'cart')    { await showCart(); return }
    if (option.id === 'checkout') {
      if (cartItems.value.length === 0) {
        await pushBot('🛒 Tu carrito está vacío. Agrega productos primero.')
        setQuickReplies(MAIN_MENU_OPTIONS)
        step.value = STEPS.MENU
        return
      }
      await startCheckout()
      return
    }

    // Vaciar carrito
    if (option.id === 'clear') {
      clearCart()
      await pushBot('🗑️ Carrito vaciado. ¿Qué deseas hacer ahora?')
      setQuickReplies(MAIN_MENU_OPTIONS)
      step.value = STEPS.MENU
      return
    }

    // Confirmación de pedido
    if (step.value === STEPS.CONFIRM_ORDER) {
      if (option.id === 'yes') { await placeOrder(); return }
      if (option.id === 'no') {
        await pushBot('❌ Pedido cancelado. Tu carrito se conserva por si cambias de opinión.')
        setQuickReplies(MAIN_MENU_OPTIONS)
        step.value = STEPS.MENU
        return
      }
    }

    // Post éxito
    if (step.value === STEPS.ORDER_SUCCESS) {
      await handleSuccessOption(option.id)
      return
    }

    // Selección de producto (BROWSING)
    if (step.value === STEPS.BROWSING && option.product) {
      await handleProductSelected(option)
      return
    }

    // Cantidad (PRODUCT_QTY)
    if (step.value === STEPS.PRODUCT_QTY) {
      await handleQuantity(option.id)
      return
    }

    // Opciones del menú principal
    if (step.value === STEPS.MENU || step.value === STEPS.GREETING) {
      await handleMenuOption(option.id)
      return
    }

    await pushFallback()
    saveSession()
  }

  // ─── Abrir/cerrar chatbot ────────────────────────────────────────────────
  async function openChat() {
    isOpen.value = true
    const restored = restoreSession()
    if (!restored) {
      await startGreeting()
    } else {
      // Restaurar quick replies según el paso actual
      restoreQuickRepliesForStep()
    }
  }

  function closeChat() {
    isOpen.value = false
    saveSession()
  }

  function restoreQuickRepliesForStep() {
    switch (step.value) {
      case STEPS.MENU:
      case STEPS.GREETING:
        setQuickReplies(MAIN_MENU_OPTIONS)
        break
      case STEPS.CONFIRM_ORDER:
        setQuickReplies(CONFIRM_OPTIONS)
        break
      case STEPS.PRODUCT_QTY:
        setQuickReplies(QTY_OPTIONS)
        break
      case STEPS.CART_VIEW:
        setQuickReplies(CART_OPTIONS)
        break
      case STEPS.ORDER_SUCCESS:
        setQuickReplies(SUCCESS_OPTIONS)
        break
      default:
        break
    }
  }

  return {
    // Estado
    isOpen,
    isTyping,
    messages,
    step,
    quickReplies,
    cartItems,
    cartTotal,
    cartCount,
    customerData,
    selectedProduct,
    allProducts,

    // Acciones
    openChat,
    closeChat,
    handleTextInput,
    handleQuickReply,
    resetChatbot,
    removeFromCart,
  }
}
