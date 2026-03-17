<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1 class="register-title">Create Account</h1>
          <p class="register-subtitle">
            Join the production order management system
          </p>
        </div>

        <form 
          @submit.prevent="handleRegister"
          class="register-form"
          novalidate
          aria-labelledby="register-title"
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
              placeholder="Choose a username"
              required
              autocomplete="username"
              aria-describedby="username-help username-error"
              @blur="validateField('username')"
              @input="clearFieldError('username')"
            >
            <div id="username-help" class="form-help">
              3-50 characters, letters, numbers, and underscores only
            </div>
            <div 
              v-if="formErrors.username"
              id="username-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.username }}
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label required">
              Email Address
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'error': formErrors.email }"
              placeholder="Enter your email address"
              required
              autocomplete="email"
              aria-describedby="email-error"
              @blur="validateField('email')"
              @input="clearFieldError('email')"
            >
            <div 
              v-if="formErrors.email"
              id="email-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.email }}
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
                placeholder="Create a secure password"
                required
                autocomplete="new-password"
                aria-describedby="password-help password-error"
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
            <div id="password-help" class="form-help">
              At least 6 characters with letters and numbers
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

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirm-password" class="form-label required">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': formErrors.confirmPassword }"
              placeholder="Confirm your password"
              required
              autocomplete="new-password"
              aria-describedby="confirm-password-error"
              @blur="validateField('confirmPassword')"
              @input="clearFieldError('confirmPassword')"
            >
            <div 
              v-if="formErrors.confirmPassword"
              id="confirm-password-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.confirmPassword }}
            </div>
          </div>

          <!-- Role Field -->
          <div class="form-group">
            <label for="role" class="form-label">
              Role
            </label>
            <select
              id="role"
              v-model="formData.role"
              class="form-select"
              aria-describedby="role-help"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
            <div id="role-help" class="form-help">
              Select your role in the organization
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-lg register-btn"
            :disabled="authStore.isLoading || !isFormValid"
            :aria-label="authStore.isLoading ? 'Creating account...' : 'Create account'"
          >
            <span v-if="authStore.isLoading" class="loading" aria-hidden="true"></span>
            <span v-else aria-hidden="true">🚀</span>
            {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <!-- Form Error -->
          <div 
            v-if="authStore.error"
            class="alert alert-error"
            role="alert"
            aria-live="assertive"
          >
            <strong>Registration failed:</strong> {{ authStore.error }}
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

        <div class="register-footer">
          <p class="login-link">
            Already have an account? 
            <router-link to="/login" class="link">
              Sign in here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

const confirmPassword = ref('')

// Form validation errors
const formErrors = reactive<Record<string, string>>({})

// UI state
const showPassword = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    formData.username.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    Object.keys(formErrors).length === 0
  )
})

// Methods
const validateField = (field: string) => {
  switch (field) {
    case 'username':
      if (!formData.username.trim()) {
        formErrors.username = 'Username is required'
      } else if (formData.username.length < 3) {
        formErrors.username = 'Username must be at least 3 characters'
      } else if (formData.username.length > 50) {
        formErrors.username = 'Username must be less than 50 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        formErrors.username = 'Username can only contain letters, numbers, and underscores'
      } else {
        delete formErrors.username
      }
      break
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email.trim()) {
        formErrors.email = 'Email address is required'
      } else if (!emailRegex.test(formData.email)) {
        formErrors.email = 'Please enter a valid email address'
      } else {
        delete formErrors.email
      }
      break
      
    case 'password':
      if (!formData.password.trim()) {
        formErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        formErrors.password = 'Password must be at least 6 characters'
      } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
        formErrors.password = 'Password must contain both letters and numbers'
      } else {
        delete formErrors.password
      }
      
      // Re-validate confirm password if it has been entered
      if (confirmPassword.value) {
        validateField('confirmPassword')
      }
      break
      
    case 'confirmPassword':
      if (!confirmPassword.value.trim()) {
        formErrors.confirmPassword = 'Please confirm your password'
      } else if (confirmPassword.value !== formData.password) {
        formErrors.confirmPassword = 'Passwords do not match'
      } else {
        delete formErrors.confirmPassword
      }
      break
  }
}

const validateForm = () => {
  validateField('username')
  validateField('email')
  validateField('password')
  validateField('confirmPassword')
  return Object.keys(formErrors).length === 0
}

const clearFieldError = (field: string) => {
  delete formErrors[field]
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role
    })

    // Redirect to dashboard on successful registration
    router.push('/')

  } catch (error) {
    console.error('Registration failed:', error)
    // Error is handled by the store and displayed in the template
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.register-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.register-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.register-form {
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

.register-btn {
  width: 100%;
  margin-top: 1rem;
}

.register-footer {
  padding: 1.5rem 2rem 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.login-link {
  text-align: center;
  margin: 0;
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

@media (max-width: 480px) {
  .register-page {
    padding: 1rem;
  }
  
  .register-header,
  .register-form,
  .register-footer {
    padding: 1.5rem;
  }
  
  .register-title {
    font-size: 1.75rem;
  }
}

/* Focus management */
.form-input:focus,
.form-select:focus {
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
  .register-card {
    border: 2px solid #000;
  }
  
  .form-input,
  .form-select {
    border-width: 2px;
  }
}
</style>