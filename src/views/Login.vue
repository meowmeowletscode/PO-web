<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Sign In</h1>
          <p class="login-subtitle">
            Access your production order dashboard
          </p>
        </div>

        <form 
          @submit.prevent="handleLogin"
          class="login-form"
          novalidate
          aria-labelledby="login-title"
        >
          <!-- Username Field -->
          <div class="form-group">
            <label for="username" class="form-label required">
              Username
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :class="{ 'error': formErrors.username }"
              placeholder="Enter your username"
              required
              autocomplete="username"
              aria-describedby="username-error"
              @blur="validateField('username')"
              @input="clearFieldError('username')"
            >
            <div 
              v-if="formErrors.username"
              id="username-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.username }}
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label required">
              Password
            </label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': formErrors.password }"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
                aria-describedby="password-error"
                @blur="validateField('password')"
                @input="clearFieldError('password')"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <div 
              v-if="formErrors.password"
              id="password-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.password }}
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-lg login-btn"
            :disabled="authStore.isLoading || !isFormValid"
            :aria-label="authStore.isLoading ? 'Signing in...' : 'Sign in to dashboard'"
          >
            <span v-if="authStore.isLoading" class="loading" aria-hidden="true"></span>
            <span v-else aria-hidden="true">🔑</span>
            {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
          </button>

          <!-- Form Error -->
          <div 
            v-if="authStore.error"
            class="alert alert-error"
            role="alert"
            aria-live="assertive"
          >
            <strong>Sign in failed:</strong> {{ authStore.error }}
            <button 
              @click="authStore.clearError()"
              class="btn btn-sm btn-outline"
              type="button"
              aria-label="Dismiss error message"
              style="margin-left: 1rem;"
            >
              Dismiss
            </button>
          </div>
        </form>

        <div class="login-footer">
          <p class="register-link">
            Don't have an account? 
            <router-link to="/register" class="link">
              Sign up here
            </router-link>
          </p>
          
          <div class="demo-info">
            <h3 class="demo-title">Demo Credentials</h3>
            <div class="demo-credentials">
              <button 
                @click="fillDemoCredentials"
                class="btn btn-outline btn-sm"
                type="button"
                aria-label="Fill form with demo credentials"
              >
                Use Demo Account
              </button>
            </div>
            <p class="demo-note">
              <small>
                Username: <code>admin</code> | Password: <code>Admin123</code>
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  username: '',
  password: ''
})

// Form validation errors
const formErrors = reactive<Record<string, string>>({})

// UI state
const showPassword = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    formData.username.trim() !== '' &&
    formData.password.trim() !== '' &&
    Object.keys(formErrors).length === 0
  )
})

// Methods
const validateField = (field: keyof typeof formData) => {
  switch (field) {
    case 'username':
      if (!formData.username.trim()) {
        formErrors.username = 'Username is required'
      } else {
        delete formErrors.username
      }
      break
      
    case 'password':
      if (!formData.password.trim()) {
        formErrors.password = 'Password is required'
      } else if (formData.password.length < 3) {
        formErrors.password = 'Password must be at least 3 characters'
      } else {
        delete formErrors.password
      }
      break
  }
}

const validateForm = () => {
  validateField('username')
  validateField('password')
  return Object.keys(formErrors).length === 0
}

const clearFieldError = (field: string) => {
  delete formErrors[field]
}

const fillDemoCredentials = () => {
  formData.username = 'admin'
  formData.password = 'Admin123'
  // Clear any existing errors
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.login({
      username: formData.username.trim(),
      password: formData.password
    })

    // Redirect to intended page or dashboard
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)

  } catch (error) {
    console.error('Login failed:', error)
    // Error is handled by the store and displayed in the template
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.login-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.login-form {
  padding: 2rem;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1;
  transition: color 0.15s ease-in-out;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.login-btn {
  width: 100%;
  margin-top: 1rem;
}

.login-footer {
  padding: 1.5rem 2rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.register-link {
  text-align: center;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.demo-info {
  text-align: center;
}

.demo-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.demo-credentials {
  margin-bottom: 0.75rem;
}

.demo-note {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.demo-note code {
  background: #e5e7eb;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-header,
  .login-form,
  .login-footer {
    padding: 1.5rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
}

/* Focus management */
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .login-card {
    border: 2px solid #000;
  }
  
  .form-input {
    border-width: 2px;
  }
}
</style>