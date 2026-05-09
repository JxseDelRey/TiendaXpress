<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
    <TheNavbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="section-title mb-7">Mi Carrito</h1>

      <!-- ── EMPTY ────────────────────────────────────────────── -->
      <div v-if="!cart.items.length" class="text-center py-24">
        <div class="text-6xl mb-5 opacity-30">🛒</div>
        <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Tu carrito está vacío</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-7">¡Agrega productos desde la tienda!</p>
        <RouterLink to="/tienda" class="btn-primary">Ir a la tienda</RouterLink>
      </div>

      <!-- ── CART CONTENT ─────────────────────────────────────── -->
      <div v-else class="grid lg:grid-cols-5 gap-6">

        <!-- Items list -->
        <div class="lg:col-span-3 space-y-3">
          <TransitionGroup name="list">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="card p-4 flex items-center gap-4"
            >
              <!-- Image -->
              <div class="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-2xl">📦</div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{{ item.name }}</h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-primary-500 font-bold text-sm">
                    ${{ item.unitPrice.toLocaleString('es-CO') }}
                  </span>
                  <span v-if="item.discountPercent > 0" class="badge badge-danger text-[10px]">
                    −{{ item.discountPercent }}%
                  </span>
                </div>
              </div>

              <!-- Qty controls -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  @click="cart.updateQuantity(item.productId, item.quantity - 1)"
                  class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center
                    font-bold text-gray-600 dark:text-gray-300 transition-colors text-sm"
                >−</button>
                <span class="w-7 text-center font-bold text-gray-800 dark:text-gray-100 text-sm">
                  {{ item.quantity }}
                </span>
                <button
                  @click="cart.updateQuantity(item.productId, item.quantity + 1)"
                  :disabled="item.quantity >= item.stock"
                  class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center
                    font-bold text-gray-600 dark:text-gray-300 transition-colors text-sm
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >+</button>
              </div>

              <!-- Subtotal + remove -->
              <div class="text-right flex-shrink-0 min-w-[80px]">
                <p class="font-bold text-gray-900 dark:text-white text-sm">
                  ${{ (item.unitPrice * item.quantity).toLocaleString('es-CO') }}
                </p>
                <button
                  @click="cart.removeItem(item.productId)"
                  class="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400
                    transition-colors mt-1 inline-flex items-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </TransitionGroup>

          <button
            @click="cart.clearCart()"
            class="btn-ghost btn-sm text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️ Vaciar carrito
          </button>
        </div>

        <!-- ── ORDER SUMMARY ──────────────────────────────────── -->
        <div class="lg:col-span-2">
          <div class="card p-6 sticky top-20 space-y-5">
            <h2 class="font-bold text-gray-900 dark:text-white text-base">Resumen del pedido</h2>

            <!-- Line items -->
            <div class="space-y-2">
              <div
                v-for="item in cart.items"
                :key="item.productId"
                class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
              >
                <span class="truncate pr-2">{{ item.name }} ×{{ item.quantity }}</span>
                <span class="font-medium flex-shrink-0">${{ (item.unitPrice * item.quantity).toLocaleString('es-CO') }}</span>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-900 dark:text-white">Total</span>
                <span class="font-extrabold text-primary-500 text-lg">
                  ${{ cart.totalPrice.toLocaleString('es-CO') }}
                </span>
              </div>
            </div>

            <!-- ── CHECKOUT FORM ─────────────────────────────── -->
            <div class="space-y-3.5 border-t border-gray-100 dark:border-gray-800 pt-5">
              <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm">Datos del pedido</h3>

              <!-- Authenticated: show name -->
              <template v-if="auth.isAuthenticated">
                <div class="flex items-center gap-2.5 bg-primary-50 dark:bg-primary-900/20
                  text-primary-700 dark:text-primary-300 rounded-xl p-3 text-sm">
                  <span>👤</span>
                  <p>Comprando como <strong>{{ auth.user?.name }}</strong></p>
                </div>
              </template>

              <!-- Guest: name + document -->
              <template v-else>
                <div>
                  <label class="label">Tu nombre *</label>
                  <input
                    v-model="form.customerName"
                    type="text" placeholder="Juan García"
                    class="input input-sm"
                    :class="{ '!border-red-400': errors.name }"
                  />
                  <p v-if="errors.name" class="text-red-500 text-[11px] mt-1">{{ errors.name }}</p>
                </div>
                <div>
                  <label class="label">Cédula / Documento *</label>
                  <input
                    v-model="form.customerDocument"
                    type="text" placeholder="10203040"
                    class="input input-sm"
                    :class="{ '!border-red-400': errors.document }"
                  />
                  <p v-if="errors.document" class="text-red-500 text-[11px] mt-1">{{ errors.document }}</p>
                </div>
              </template>

              <!-- Email (all users) -->
              <div>
                <label class="label">Correo para confirmación *</label>
                <input
                  v-model="form.customerEmail"
                  type="email"
                  placeholder="tu@correo.com"
                  autocomplete="email"
                  class="input input-sm"
                  :class="{ '!border-red-400': errors.email }"
                />
                <p v-if="errors.email" class="text-red-500 text-[11px] mt-1">{{ errors.email }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="label">Teléfono (opcional)</label>
                <input
                  v-model="form.customerPhone"
                  type="tel" placeholder="3001234567"
                  class="input input-sm"
                />
              </div>

              <!-- Payment method -->
              <div>
                <label class="label">Método de pago</label>
                <select v-model="form.paymentMethod" class="input input-sm">
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="transferencia">📲 Transferencia</option>
                </select>
              </div>

              <!-- Notes -->
              <div>
                <label class="label">Notas (opcional)</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="Alguna indicación especial..."
                  class="input input-sm resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Submit -->
            <button
              @click="handleCheckout"
              :disabled="checkoutLoading"
              class="btn-primary w-full text-sm py-3"
            >
              <span v-if="checkoutLoading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
              </span>
              <span>{{ checkoutLoading ? 'Procesando...' : '✅ Confirmar pedido' }}</span>
            </button>

            <p v-if="checkoutError" class="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              {{ checkoutError }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── SUCCESS MODAL ──────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="orderSuccess"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm"
      >
        <div class="card max-w-sm w-full p-8 text-center animate-slide-up">
          <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full
            flex items-center justify-center mx-auto mb-5">
            <span class="text-3xl">🎉</span>
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            ¡Pedido confirmado!
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Tu pedido ha sido recibido con éxito.</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Número de pedido:
            <span class="font-mono font-bold text-primary-500">
              #{{ orderId?.slice(-8).toUpperCase() }}
            </span>
          </p>
          <p v-if="form.customerEmail" class="text-xs text-gray-400 dark:text-gray-500 mb-6">
            📧 Confirmación enviada a {{ form.customerEmail }}
          </p>
          <button @click="goHome" class="btn-primary w-full">Volver al inicio</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import TheNavbar from '../components/TheNavbar.vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { ordersApi }    from '../services/api'

const cart   = useCartStore()
const auth   = useAuthStore()
const router = useRouter()

const form = ref({
  customerName:     '',
  customerDocument: '',
  customerEmail:    auth.user?.email || '',
  customerPhone:    '',
  paymentMethod:    'efectivo',
  notes:            '',
})

const errors          = ref({})
const checkoutLoading = ref(false)
const checkoutError   = ref(null)
const orderSuccess    = ref(false)
const orderId         = ref(null)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const e = {}
  if (!auth.isAuthenticated) {
    if (!form.value.customerName.trim())     e.name = 'El nombre es obligatorio'
    if (!form.value.customerDocument.trim()) e.document = 'El documento es obligatorio'
  }
  if (!form.value.customerEmail.trim()) {
    e.email = 'El correo es obligatorio para enviarte la confirmación'
  } else if (!EMAIL_REGEX.test(form.value.customerEmail.trim())) {
    e.email = 'Ingresa un correo válido (ej: tu@correo.com)'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleCheckout() {
  if (!validate()) return
  checkoutLoading.value = true
  checkoutError.value   = null
  try {
    const finalName     = auth.isAuthenticated ? auth.user?.name  : form.value.customerName
    const finalDocument = auth.isAuthenticated ? ''               : form.value.customerDocument

    const payload = {
      ...cart.getCheckoutPayload(
        finalName,
        finalDocument,
        form.value.customerPhone,
        form.value.paymentMethod,
        form.value.notes,
      ),
      // Appended email info to notes so backend receives it
      notes: [form.value.notes, `📧 Email: ${form.value.customerEmail}`].filter(Boolean).join(' | '),
    }

    const { data } = await ordersApi.create(payload)
    orderId.value = data._id
    cart.clearCart()
    orderSuccess.value = true
  } catch (err) {
    checkoutError.value = err.response?.data?.message || 'Error al procesar el pedido'
  } finally {
    checkoutLoading.value = false
  }
}

function goHome() {
  orderSuccess.value = false
  router.push('/')
}
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateX(-16px); }
.list-leave-to   { opacity: 0; transform: translateX(16px); }

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
