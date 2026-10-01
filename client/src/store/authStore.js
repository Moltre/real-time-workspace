import { create } from 'zustand'
import { authApi } from '../api/auth'

const TOKEN_KEY = 'rtcw_token'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoading: false,
  isInitialised: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────
  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.register(data)
      const { user, token } = res.data
      localStorage.setItem(TOKEN_KEY, token)
      set({ user, token, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.login(data)
      const { user, token } = res.data
      localStorage.setItem(TOKEN_KEY, token)
      set({ user, token, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, error: null })
  },

  initAuth: async () => {
    const token = get().token
    if (!token) return set({ isInitialised: true })
    set({ isLoading: true })
    try {
      const res = await authApi.getMe()
      set({ user: res.data.user, isLoading: false, isInitialised: true })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, isLoading: false, isInitialised: true })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
