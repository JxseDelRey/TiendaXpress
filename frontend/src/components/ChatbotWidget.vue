<template>
  <!-- FAB flotante -->
  <div class="chatbot-root">
    <!-- Botón de apertura -->
    <Transition name="fab-scale">
      <button
        v-if="!isOpen"
        id="chatbot-fab"
        class="chatbot-fab"
        aria-label="Abrir asistente de compras"
        @click="openChat"
      >
        <span class="chatbot-fab__icon">🛒</span>
        <!-- Badge con número de items en carrito -->
        <span v-if="cartCount > 0" class="chatbot-fab__badge">
          {{ cartCount > 9 ? '9+' : cartCount }}
        </span>
        <!-- Pulso animado -->
        <span class="chatbot-fab__pulse"></span>
      </button>
    </Transition>

    <!-- Panel del chat -->
    <Transition name="chat-slide">
      <div v-if="isOpen" id="chatbot-panel" class="chatbot-panel" role="dialog" aria-label="Chat de TiendaXpress">

        <!-- Cabecera -->
        <header class="chatbot-header">
          <div class="chatbot-header__avatar">🤖</div>
          <div class="chatbot-header__info">
            <p class="chatbot-header__name">Asistente TiendaXpress</p>
            <p class="chatbot-header__status">
              <span class="chatbot-header__dot"></span> En línea
            </p>
          </div>
          <div class="chatbot-header__actions">
            <!-- Carrito rápido -->
            <button
              v-if="cartCount > 0"
              class="chatbot-header__cart-btn"
              title="Ver carrito"
              @click="handleQuickReply({ id: 'cart', label: '🛍️ Mi carrito' })"
            >
              🛍️ <span class="chatbot-header__cart-count">{{ cartCount }}</span>
            </button>
            <!-- Reiniciar -->
            <button class="chatbot-header__icon-btn" title="Reiniciar chat" @click="resetChatbot">
              🔄
            </button>
            <!-- Cerrar -->
            <button
              id="chatbot-close"
              class="chatbot-header__icon-btn chatbot-header__close"
              title="Cerrar chat"
              aria-label="Cerrar chat"
              @click="closeChat"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- Área de mensajes -->
        <div ref="messagesRef" class="chatbot-messages" id="chatbot-messages" aria-live="polite">
          <!-- Burbuja de bienvenida si no hay mensajes -->
          <div v-if="messages.length === 0 && !isTyping" class="chatbot-empty">
            <span class="chatbot-empty__icon">💬</span>
            <p>Iniciando conversación...</p>
          </div>

          <!-- Mensajes -->
          <TransitionGroup name="msg" tag="div">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="chatbot-msg"
              :class="msg.from === 'bot' ? 'chatbot-msg--bot' : 'chatbot-msg--user'"
            >
              <div v-if="msg.from === 'bot'" class="chatbot-msg__avatar">🤖</div>
              <div class="chatbot-msg__bubble" v-html="renderText(msg.text)"></div>
            </div>
          </TransitionGroup>

          <!-- Indicador de escritura -->
          <Transition name="msg">
            <div v-if="isTyping" class="chatbot-msg chatbot-msg--bot chatbot-typing">
              <div class="chatbot-msg__avatar">🤖</div>
              <div class="chatbot-msg__bubble chatbot-msg__bubble--typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Quick Replies -->
        <Transition name="replies-fade">
          <div v-if="quickReplies.length > 0" class="chatbot-quick-replies" id="chatbot-quick-replies">
            <button
              v-for="option in quickReplies"
              :key="option.id"
              class="chatbot-chip"
              @click="handleQuickReply(option)"
            >
              {{ option.label }}
            </button>
          </div>
        </Transition>

        <!-- Input -->
        <!-- Hint extra cuando se solicita email -->
        <Transition name="replies-fade">
          <p v-if="step === STEPS.COLLECT_EMAIL"
            class="chatbot-email-hint">
            📩 Ingresa tu correo para recibir la confirmación del pedido
          </p>
        </Transition>

        <form class="chatbot-input-row" @submit.prevent="submitText" id="chatbot-form">
          <input
            id="chatbot-input"
            ref="inputRef"
            v-model="inputText"
            class="chatbot-input"
            :type="inputType"
            :placeholder="inputPlaceholder"
            :disabled="isTyping"
            maxlength="254"
            :autocomplete="step === STEPS.COLLECT_EMAIL ? 'email' : 'off'"
            aria-label="Escribe tu mensaje"
            @keydown.enter.prevent="submitText"
          />
          <button
            id="chatbot-send"
            type="submit"
            class="chatbot-send-btn"
            :disabled="!inputText.trim() || isTyping"
            aria-label="Enviar mensaje"
          >
            ➤
          </button>
        </form>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useChatbot } from '../chatbot/useChatbot'
import { STEPS } from '../chatbot/chatbotFlow'

const {
  isOpen, isTyping, messages, step, quickReplies,
  cartItems, cartTotal, cartCount,
  openChat, closeChat, handleTextInput, handleQuickReply, resetChatbot,
} = useChatbot()

const inputText  = ref('')
const messagesRef = ref(null)
const inputRef    = ref(null)

// Placeholder dinámico según el paso actual
const inputPlaceholder = computed(() => {
  switch (step.value) {
    case STEPS.COLLECT_NAME:    return 'Tu nombre completo...'
    case STEPS.COLLECT_PHONE:   return 'Tu teléfono (10 dígitos)...'
    case STEPS.COLLECT_ADDRESS: return 'Tu dirección completa...'
    case STEPS.COLLECT_EMAIL:   return 'Tu correo electrónico (ej: tu@correo.com)'
    case STEPS.PRODUCT_QTY:     return 'Cantidad deseada...'
    default:                    return 'Escribe un mensaje...'
  }
})

// Tipo de input dinámico — email cuando corresponda
const inputType = computed(() =>
  step.value === STEPS.COLLECT_EMAIL ? 'email' : 'text'
)

// Scroll automático al fondo cuando llegan mensajes o typing cambia
watch([messages, isTyping], async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}, { deep: true })

// Focus en input cuando abre el chat
watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  }
})

function submitText() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return
  inputText.value = ''
  handleTextInput(text)
}

/**
 * Transforma el texto del bot (Markdown simple) a HTML seguro.
 * Solo permite **negrita** y saltos de línea.
 */
function renderText(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   VARIABLES
═══════════════════════════════════════════════════════ */
.chatbot-root {
  --cb-primary:     #6d28d9;
  --cb-primary-dark:#5b21b6;
  --cb-primary-light:#ede9fe;
  --cb-bot-bg:      #f3f4f6;
  --cb-bot-text:    #111827;
  --cb-user-bg:     #6d28d9;
  --cb-user-text:   #ffffff;
  --cb-panel-bg:    #ffffff;
  --cb-header-bg:   linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
  --cb-border:      #e5e7eb;
  --cb-shadow:      0 20px 60px rgba(109,40,217,.25), 0 4px 20px rgba(0,0,0,.15);
  --cb-radius:      20px;
  --cb-chip-bg:     #ede9fe;
  --cb-chip-text:   #5b21b6;
  --cb-chip-hover:  #ddd6fe;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}

/* Dark mode */
.dark .chatbot-root {
  --cb-bot-bg:    #374151;
  --cb-bot-text:  #f9fafb;
  --cb-panel-bg:  #1f2937;
  --cb-border:    #374151;
  --cb-chip-bg:   #4c1d95;
  --cb-chip-text: #ddd6fe;
  --cb-chip-hover:#5b21b6;
}

/* ═══════════════════════════════════════════════════════
   FAB
═══════════════════════════════════════════════════════ */
.chatbot-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9998;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(109,40,217,.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.chatbot-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(109,40,217,.55);
}
.chatbot-fab:active { transform: scale(0.96); }

.chatbot-fab__icon { font-size: 26px; line-height: 1; }

.chatbot-fab__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.chatbot-fab__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #6d28d9;
  animation: pulse-ring 2s ease-out infinite;
  opacity: 0;
}

@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* ═══════════════════════════════════════════════════════
   PANEL
═══════════════════════════════════════════════════════ */
.chatbot-panel {
  position: fixed;
  bottom: 32px;
  right: 28px;
  z-index: 9999;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 580px;
  max-height: calc(100vh - 80px);
  background: var(--cb-panel-bg);
  border-radius: var(--cb-radius);
  box-shadow: var(--cb-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--cb-border);
}

/* ═══════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════ */
.chatbot-header {
  background: var(--cb-header-bg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.chatbot-header__avatar {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chatbot-header__info { flex: 1; min-width: 0; }
.chatbot-header__name {
  font-weight: 700;
  color: #fff;
  font-size: 15px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chatbot-header__status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255,255,255,.8);
  font-size: 12px;
  margin: 0;
}
.chatbot-header__dot {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  flex-shrink: 0;
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.chatbot-header__actions { display: flex; align-items: center; gap: 4px; }

.chatbot-header__cart-btn {
  background: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.3);
  color: #fff;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}
.chatbot-header__cart-btn:hover { background: rgba(255,255,255,.3); }
.chatbot-header__cart-count {
  background: #ef4444;
  border-radius: 999px;
  color: #fff;
  padding: 0 5px;
  font-size: 10px;
}

.chatbot-header__icon-btn {
  background: rgba(255,255,255,.15);
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.chatbot-header__icon-btn:hover { background: rgba(255,255,255,.28); }
.chatbot-header__close { font-size: 13px; font-weight: 700; }

/* ═══════════════════════════════════════════════════════
   MENSAJES
═══════════════════════════════════════════════════════ */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}
.chatbot-messages::-webkit-scrollbar { width: 4px; }
.chatbot-messages::-webkit-scrollbar-track { background: transparent; }
.chatbot-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

.chatbot-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
  gap: 8px;
}
.chatbot-empty__icon { font-size: 36px; opacity: 0.5; }

.chatbot-msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
}
.chatbot-msg--user {
  flex-direction: row-reverse;
}

.chatbot-msg__avatar {
  font-size: 20px;
  width: 32px;
  height: 32px;
  background: #ede9fe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chatbot-msg__bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
}
.chatbot-msg--bot .chatbot-msg__bubble {
  background: var(--cb-bot-bg);
  color: var(--cb-bot-text);
  border-bottom-left-radius: 4px;
}
.chatbot-msg--user .chatbot-msg__bubble {
  background: var(--cb-user-bg);
  color: var(--cb-user-text);
  border-bottom-right-radius: 4px;
}

/* Typing dots */
.chatbot-msg__bubble--typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
  min-width: 56px;
}
.chatbot-msg__bubble--typing span {
  width: 7px;
  height: 7px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing-dot 1.2s ease-in-out infinite;
}
.chatbot-msg__bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
.chatbot-msg__bubble--typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30%           { transform: translateY(-6px); opacity: 1; }
}

/* ═══════════════════════════════════════════════════════
   QUICK REPLIES
═══════════════════════════════════════════════════════ */
.chatbot-quick-replies {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid var(--cb-border);
  max-height: 130px;
  overflow-y: auto;
  flex-shrink: 0;
}
.chatbot-quick-replies::-webkit-scrollbar { width: 3px; }
.chatbot-quick-replies::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

.chatbot-chip {
  background: var(--cb-chip-bg);
  color: var(--cb-chip-text);
  border: 1px solid var(--cb-chip-hover);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chatbot-chip:hover {
  background: var(--cb-chip-hover);
  transform: translateY(-1px);
}
.chatbot-chip:active { transform: scale(0.96); }

/* Email collection hint banner */
.chatbot-email-hint {
  margin: 0;
  padding: 8px 14px;
  font-size: 11.5px;
  color: #6d28d9;
  background: #ede9fe;
  border-top: 1px solid #ddd6fe;
  text-align: center;
  flex-shrink: 0;
}
.dark .chatbot-root .chatbot-email-hint {
  background: #2e1065;
  color: #c4b5fd;
  border-top-color: #4c1d95;
}

/* ═══════════════════════════════════════════════════════
   INPUT
═══════════════════════════════════════════════════════ */
.chatbot-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--cb-border);
  flex-shrink: 0;
  background: var(--cb-panel-bg);
}

.chatbot-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--cb-border);
  border-radius: 12px;
  font-size: 13.5px;
  outline: none;
  background: transparent;
  color: inherit;
  transition: border-color 0.2s;
}
.chatbot-input:focus { border-color: var(--cb-primary); }
.chatbot-input::placeholder { color: #9ca3af; }
.chatbot-input:disabled { opacity: 0.6; cursor: not-allowed; }

.chatbot-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.1s;
}
.chatbot-send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.05); }
.chatbot-send-btn:active:not(:disabled){ transform: scale(0.92); }
.chatbot-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══════════════════════════════════════════════════════
   TRANSICIONES
═══════════════════════════════════════════════════════ */
.fab-scale-enter-active, .fab-scale-leave-active { transition: all 0.25s cubic-bezier(.34,1.56,.64,1); }
.fab-scale-enter-from, .fab-scale-leave-to       { opacity: 0; transform: scale(0.5); }

.chat-slide-enter-active { transition: all 0.35s cubic-bezier(.34,1.3,.64,1); }
.chat-slide-leave-active { transition: all 0.25s ease; }
.chat-slide-enter-from   { opacity: 0; transform: translateY(24px) scale(0.97); }
.chat-slide-leave-to     { opacity: 0; transform: translateY(16px) scale(0.97); }

.msg-enter-active { transition: all 0.28s ease; }
.msg-leave-active { transition: all 0.18s ease; }
.msg-enter-from   { opacity: 0; transform: translateY(10px); }
.msg-leave-to     { opacity: 0; transform: translateY(-6px); }

.replies-fade-enter-active, .replies-fade-leave-active { transition: all 0.2s ease; }
.replies-fade-enter-from, .replies-fade-leave-to       { opacity: 0; transform: translateY(6px); }

/* ═══════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .chatbot-panel {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }
  .chatbot-fab {
    bottom: 20px;
    right: 16px;
  }
}
</style>
