import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('txp_user') || 'null'))
  const token = ref(localStorage.getItem('txp_token') || null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    loading.value = true; error.value = null
    try {
      const { data } = await authApi.login({ email, password })
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('txp_token', data.token)
      localStorage.setItem('txp_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(name, email, password) {
    loading.value = true; error.value = null
    try {
      const { data } = await authApi.register({ name, email, password })
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('txp_token', data.token)
      localStorage.setItem('txp_user', JSON.stringify(data.user))
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrarse'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null; user.value = null
    localStorage.removeItem('txp_token')
    localStorage.removeItem('txp_user')
  }

  return { user, token, loading, error, isAuthenticated, isAdmin, login, register, logout }
})
