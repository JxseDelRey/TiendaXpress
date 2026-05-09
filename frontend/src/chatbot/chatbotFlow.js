/**
 * chatbotFlow.js
 * Definición de todos los pasos (estados) del flujo conversacional.
 * Para modificar mensajes del bot, edita los campos `botText` de cada paso.
 */

export const STEPS = {
  GREETING:        'GREETING',
  MENU:            'MENU',
  BROWSING:        'BROWSING',
  PRODUCT_DETAIL:  'PRODUCT_DETAIL',
  PRODUCT_QTY:     'PRODUCT_QTY',
  CART_VIEW:       'CART_VIEW',
  COLLECT_NAME:    'COLLECT_NAME',
  COLLECT_PHONE:   'COLLECT_PHONE',
  COLLECT_ADDRESS: 'COLLECT_ADDRESS',
  COLLECT_EMAIL:   'COLLECT_EMAIL',
  CONFIRM_ORDER:   'CONFIRM_ORDER',
  ORDER_SUCCESS:   'ORDER_SUCCESS',
  FALLBACK:        'FALLBACK',
}

/** Opciones del menú principal */
export const MAIN_MENU_OPTIONS = [
  { id: 'browse',  label: '🛒 Ver productos'    },
  { id: 'cart',    label: '🛍️ Mi carrito'       },
  { id: 'confirm', label: '✅ Confirmar pedido'  },
  { id: 'restart', label: '🔄 Reiniciar'         },
]

/** Opciones rápidas de cantidad */
export const QTY_OPTIONS = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '5', label: '5' },
  { id: 'custom', label: '✏️ Otra' },
]

/** Opciones al ver el carrito */
export const CART_OPTIONS = [
  { id: 'checkout', label: '✅ Confirmar pedido' },
  { id: 'browse',   label: '🛒 Agregar más'      },
  { id: 'clear',    label: '🗑️ Vaciar carrito'   },
  { id: 'menu',     label: '🔙 Menú principal'   },
]

/** Opciones de confirmación final */
export const CONFIRM_OPTIONS = [
  { id: 'yes', label: '✅ Sí, confirmar' },
  { id: 'no',  label: '❌ Cancelar'     },
]

/** Opciones post-éxito */
export const SUCCESS_OPTIONS = [
  { id: 'new_order', label: '🛒 Hacer otro pedido' },
  { id: 'menu',      label: '🏠 Menú principal'    },
]

/**
 * Genera el saludo inicial según si el usuario está autenticado.
 * @param {string|null} userName
 * @returns {string}
 */
export function buildGreeting(userName) {
  const hour = new Date().getHours()
  let timeGreet = 'Hola'
  if (hour >= 5  && hour < 12) timeGreet = '¡Buenos días'
  if (hour >= 12 && hour < 18) timeGreet = '¡Buenas tardes'
  if (hour >= 18 || hour < 5)  timeGreet = '¡Buenas noches'

  if (userName) {
    return `${timeGreet}, ${userName}! 👋 Bienvenido de nuevo a TiendaXpress.\n¿En qué te puedo ayudar hoy?`
  }
  return `${timeGreet}! 👋 Bienvenido a TiendaXpress, tu tienda de barrio favorita.\n¿En qué te puedo ayudar hoy?`
}

/** Formatea un precio en COP */
export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}
