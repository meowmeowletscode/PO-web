<template>
  <div class="edit-user-page">
    <div class="edit-user-container">
      <div class="edit-user-card">
        <div class="edit-user-header">
          <button
            @click="goBack"
            class="back-button"
            type="button"
            aria-label="Go back to users list"
          >
            ← Back
          </button>
          <h1 class="edit-user-title">Edit User</h1>
          <p class="edit-user-subtitle">
            Update user information
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingUser" class="loading-state">
          <div class="loading" aria-hidden="true"></div>
          <p>Loading user details...</p>
        </div>

        <!-- Form -->
        <form 
          v-else-if="!loadError"
          @submit.prevent="handleUpdateUser"
          class="edit-user-form"
          novalidate
          aria-labelledby="edit-user-title"
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
              placeholder="Enter email address"
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

          <!-- Role Field -->
          <div class="form-group">
            <label for="role" class="form-label required">
              Role
            </label>
            <select
              id="role"
              v-model="formData.role"
              class="form-select"
              :class="{ 'error': formErrors.role }"
              required
              aria-describedby="role-help role-error"
              @blur="validateField('role')"
              @change="clearFieldError('role')"
            >
              <option value="">Select a role</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
            <div id="role-help" class="form-help">
              Select the user's role in the system
            </div>
            <div 
              v-if="formErrors.role"
              id="role-error"
              class="form-error"
              role="alert"
            >
              {{ formErrors.role }}
            </div>
          </div>

          <!-- Password Field (Optional) -->
          <div class="form-group">
            <label for="password" class="form-label">
              New Password
              <span class="optional-label">(Optional)</span>
            </label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': formErrors.password }"
                placeholder="Leave blank to keep current password"
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
              Leave blank to keep current password. If changing, must be at least 6 characters with letters and numbers
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

          <!-- Confirm Password Field (Only if password is being changed) -->
          <div v-if="formData.password" class="form-group">
            <label for="confirm-password" class="form-label required">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': formErrors.confirmPassword }"
              placeholder="Confirm new password"
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

          <!-- User Info -->
          <div class="user-info-box">
            <div class="info-row">
              <span class="info-label">User ID:</span>
              <span class="info-value">{{ userId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDate(originalUser?.created_at) }}</span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              @click="goBack"
              class="btn btn-outline btn-lg"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              :disabled="isSubmitting || !isFormValid || !hasChanges"
              :aria-label="isSubmitting ? 'Updating user...' : 'Update user'"
            >
              <span v-if="isSubmitting" class="loading" aria-hidden="true"></span>
              <span v-else aria-hidden="true">💾</span>
              {{ isSubmitting ? 'Updating User...' : 'Update User' }}
            </button>
          </div>

          <!-- Form Error -->
          <div 
            v-if="submitError"
            class="alert alert-error"
            role="alert"
            aria-live="assertive"
          >
            <strong>Failed to update user:</strong> {{ submitError }}
            <button 
              @click="submitError = null"
              class="btn btn-sm btn-outline"
              type="button"
              aria-label="Dismiss error message"
              style="margin-left: 1rem;"
            >
              Dismiss
            </button>
          </div>

          <!-- Success Message -->
          <div 
            v-if="successMessage"
            class="alert alert-success"
            role="alert"
            aria-live="polite"
          >
            <strong>Success!</strong> {{ successMessage }}
          </div>
        </form>

        <!-- Load Error -->
        <div v-else class="error-state">
          <div class="error-icon" aria-hidden="true">⚠️</div>
          <h3>Failed to Load User</h3>
          <p>{{ loadError }}</p>
          <button
            @click="goBack"
            class="btn btn-primary"
            type="button"
          >
            Back to Users
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'
import apiService from '@/services/api'
import type { User } from '@/types'

const router = useRouter()
const route = useRoute()

const userId = computed(() => parseInt(route.params.id as string))

// State
const originalUser = ref<User | null>(null)
const isLoadingUser = ref(true)
const loadError = ref<string | null>(null)

// Form data
const formData = reactive({
  username: '',
  email: '',
  password: '',
  role: ''
})

const confirmPassword = ref('')

// Form validation errors
const formErrors = reactive<Record<string, string>>({})

// UI state
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  if (!formData.username.trim() || !formData.email.trim() || !formData.role.trim()) {
    return false
  }
  
  if (formData.password && !confirmPassword.value) {
    return false
  }
  
  return Object.keys(formErrors).length === 0
})

const hasChanges = computed(() => {
  if (!originalUser.value) return false
  
  return (
    formData.username !== originalUser.value.username ||
    formData.email !== originalUser.value.email ||
    formData.role !== originalUser.value.role ||
    formData.password !== ''
  )
})

// Methods
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
  } catch {
    return dateString
  }
}

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
      if (formData.password && formData.password.length > 0) {
        if (formData.password.length < 6) {
          formErrors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
          formErrors.password = 'Password must contain both letters and numbers'
        } else {
          delete formErrors.password
        }
        
        if (confirmPassword.value) {
          validateField('confirmPassword')
        }
      } else {
        delete formErrors.password
      }
      break
      
    case 'confirmPassword':
      if (formData.password) {
        if (!confirmPassword.value.trim()) {
          formErrors.confirmPassword = 'Please confirm the new password'
        } else if (confirmPassword.value !== formData.password) {
          formErrors.confirmPassword = 'Passwords do not match'
        } else {
          delete formErrors.confirmPassword
        }
      } else {
        delete formErrors.confirmPassword
      }
      break

    case 'role':
      if (!formData.role.trim()) {
        formErrors.role = 'Role is required'
      } else {
        delete formErrors.role
      }
      break
  }
}

const validateForm = () => {
  validateField('username')
  validateField('email')
  validateField('role')
  
  if (formData.password) {
    validateField('password')
    validateField('confirmPassword')
  }
  
  return Object.keys(formErrors).length === 0
}

const clearFieldError = (field: string) => {
  delete formErrors[field]
}

const loadUser = async () => {
  isLoadingUser.value = true
  loadError.value = null
  
  try {
    const response = await apiService.getUser(userId.value)
    originalUser.value = response.data
    
    formData.username = response.data.username
    formData.email = response.data.email
    formData.role = response.data.role
    formData.password = ''
    
  } catch (error: any) {
    loadError.value = error.details || error.error || 'Failed to load user details'
    console.error('Failed to load user:', error)
  } finally {
    isLoadingUser.value = false
  }
}

const handleUpdateUser = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = null
  successMessage.value = null

  try {
    const updates: any = {}
    
    if (formData.username !== originalUser.value?.username) {
      updates.username = formData.username.trim()
    }
    
    if (formData.email !== originalUser.value?.email) {
      updates.email = formData.email.trim()
    }
    
    if (formData.role !== originalUser.value?.role) {
      updates.role = formData.role
    }
    
    if (formData.password) {
      updates.password = formData.password
    }

    await apiService.updateUser(userId.value, updates)

    successMessage.value = `User "${formData.username}" updated successfully!`

    setTimeout(() => {
      router.push('/users')
    }, 1500)

  } catch (error: any) {
    submitError.value = error.details || error.error || 'Failed to update user'
    console.error('User update failed:', error)
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/users')
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.edit-user-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.edit-user-container {
  width: 100%;
  max-width: 500px;
}

.edit-user-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.edit-user-header {
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.back-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  transition: color 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.back-button:hover {
  color: #374151;
}

.back-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.edit-user-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.edit-user-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.edit-user-form {
  padding: 2rem;
}

.loading-state,
.error-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.error-state {
  color: #dc2626;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
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

.optional-label {
  font-size: 0.75rem;
  font-weight: 400;
  color: #9ca3af;
  margin-left: 0.25rem;
}

.user-info-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions .btn {
  flex: 1;
}

.alert {
  margin-top: 1rem;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .edit-user-page {
    padding: 1rem;
  }
  
  .edit-user-header,
  .edit-user-form {
    padding: 1.5rem;
  }
  
  .edit-user-title {
    font-size: 1.75rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Focus management */
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error:focus,
.form-select.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .edit-user-card {
    border: 2px solid #000;
  }
  
  .form-input,
  .form-select {
    border-width: 2px;
  }
}
</style>
