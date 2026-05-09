<template>
  <div class="min-h-screen bg-hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background blobs -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.07] rounded-full blur-3xl"></div>
      <div class="absolute -bottom-16 -left-16 w-72 h-72 bg-white/[0.07] rounded-full blur-2xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-[420px] animate-slide-up">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2.5 group">
          <div class="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl
            group-hover:scale-105 transition-transform duration-200">
            <span class="text-primary-500 font-extrabold text-lg">TX</span>
          </div>
          <span class="font-extrabold text-2xl text-white tracking-tight">TiendaXpress</span>
        </RouterLink>
        <p class="text-white/65 text-sm mt-2">Tu tienda de barrio favorita</p>
      </div>

      <!-- Card -->
      <div class="card p-7">
        <!-- Mode tabs -->
        <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button
            @click="mode = 'login'"
            :class="['flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-all duration-200',
              mode === 'login'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']"
          >
            Iniciar sesión
          </button>
          <button
            @click="mode = 'register'"
            :class="['flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-all duration-200',
              mode === 'register'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200']"
          >
            Registrarme
          </button>
        </div>

        <Transition name="fade-tab" mode="out-in">
          <!-- Login form -->
          <form v-if="mode === 'login'" key="login" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="label">Correo electrónico</label>
              <input
                v-model="form.email"
                type="email" required
                placeholder="tu@correo.com"
                class="input"
                autocomplete="email"
              />
            </div>
            <div>
              <label class="label">Contraseña</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  required placeholder="••••••••"
                  class="input pr-11"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="showPass = !showPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  :aria-label="showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <span class="text-lg leading-none">{{ showPass ? '🙈' : '👁️' }}</span>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div v-if="auth.error" class="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
              text-red-600 dark:text-red-400 text-sm rounded-xl p-3.5 border border-red-100 dark:border-red-800/50">
              <span class="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{{ auth.error }}</span>
            </div>

            <button type="submit" :disabled="auth.loading" class="btn-primary w-full text-base py-3">
              <span v-if="auth.loading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
              </span>
              <span>{{ auth.loading ? 'Verificando...' : 'Iniciar sesión' }}</span>
            </button>
          </form>

          <!-- Register form -->
          <form v-else key="register" @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="label">Nombre completo</label>
              <input v-model="form.name" type="text" required placeholder="Juan García" class="input" autocomplete="name" />
            </div>
            <div>
              <label class="label">Correo electrónico</label>
              <input v-model="form.email" type="email" required placeholder="tu@correo.com" class="input" autocomplete="email" />
            </div>
            <div>
              <label class="label">Contraseña</label>
              <input v-model="form.password" type="password" required minlength="6"
                placeholder="Mínimo 6 caracteres" class="input" autocomplete="new-password" />
            </div>

            <!-- Error -->
            <div v-if="auth.error" class="flex items-start gap-2 bg-red-50 dark:bg-red-900/20
              text-red-600 dark:text-red-400 text-sm rounded-xl p-3.5 border border-red-100 dark:border-red-800/50">
              <span class="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{{ auth.error }}</span>
            </div>

            <button type="submit" :disabled="auth.loading" class="btn-primary w-full text-base py-3">
              <span v-if="auth.loading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin">
              </span>
              <span>{{ auth.loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
            </button>
          </form>
        </Transition>
      </div>

      <!-- Back link -->
      <p class="text-center text-white/60 text-sm mt-5">
        <RouterLink to="/" class="hover:text-white/90 transition-colors">← Volver al inicio</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const route    = useRoute()
const mode     = ref('login')
const showPass = ref(false)
const form     = ref({ email: '', password: '', name: '' })

async function handleLogin() {
  try {
    await auth.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || (auth.isAdmin ? '/admin' : '/')
    router.push(redirect)
  } catch {}
}

async function handleRegister() {
  try {
    await auth.register(form.value.name, form.value.email, form.value.password)
    router.push('/')
  } catch {}
}
</script>

<style scoped>
.fade-tab-enter-active, .fade-tab-leave-active { transition: all 0.18s ease; }
.fade-tab-enter-from { opacity: 0; transform: translateX(8px); }
.fade-tab-leave-to   { opacity: 0; transform: translateX(-8px); }
</style>
