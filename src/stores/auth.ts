import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type { User, LoginRequest, RegisterRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const clearError = () => {
    error.value = null
  }

  const setUser = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
  }

  const clearUser = () => {
    user.value = null
    token.value = null
  }

  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.login(credentials)
      
      if (response.success) {
        setUser(response.data.user, response.data.token)
        return response.data
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err: any) {
      error.value = err.details || err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.register(userData)
      
      if (response.success) {
        setUser(response.data.user, response.data.token)
        return response.data
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (err: any) {
      error.value = err.details || err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    apiService.logout()
    clearUser()
  }

  const fetchProfile = async () => {
    if (!token.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.getProfile()
      
      if (response.success) {
        user.value = response.data
        return response.data
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (err: any) {
      error.value = err.details || err.message || 'Failed to fetch profile'
      // If profile fetch fails, likely token is invalid
      logout()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const initializeAuth = async () => {
    // Check if user is already authenticated (token in localStorage)
    if (apiService.isAuthenticated()) {
      try {
        await fetchProfile()
      } catch {
        // Token is invalid, clear it
        logout()
      }
    }
  }

  // Reset store
  const $reset = () => {
    user.value = null
    token.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    isAdmin,
    
    // Actions
    clearError,
    setUser,
    clearUser,
    login,
    register,
    logout,
    fetchProfile,
    initializeAuth,
    $reset
  }
})