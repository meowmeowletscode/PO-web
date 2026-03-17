<template>
  <div class="order-form-container">
    <form 
      @submit.prevent="handleSubmit"
      class="order-form"
      novalidate
      aria-labelledby="form-title"
    >
      <div class="form-header">
        <h2 id="form-title" class="form-title">Create New Production Order</h2>
        <p class="form-description">
          Add a new production order with product details, quantity, and due date.
        </p>
      </div>

      <!-- Product Name Field -->
      <div class="form-group">
        <label 
          for="product-name"
          class="form-label required"
        >
          Product Name
        </label>
        <input
          id="product-name"
          v-model="formData.product_name"
          type="text"
          class="form-input"
          :class="{ 'error': formErrors.product_name }"
          placeholder="Enter product name (e.g., Widget A, Component B)"
          maxlength="255"
          required
          aria-describedby="product-name-help product-name-error"
          @blur="validateField('product_name')"
          @input="clearFieldError('product_name')"
        >
        <div id="product-name-help" class="form-help">
          Enter a descriptive name for the product (1-255 characters)
        </div>
        <div 
          v-if="formErrors.product_name"
          id="product-name-error"
          class="form-error"
          role="alert"
          aria-live="polite"
        >
          {{ formErrors.product_name }}
        </div>
      </div>

      <!-- Quantity Field -->
      <div class="form-group">
        <label 
          for="quantity"
          class="form-label required"
        >
          Quantity
        </label>
        <input
          id="quantity"
          v-model.number="formData.quantity"
          type="number"
          class="form-input"
          :class="{ 'error': formErrors.quantity }"
          placeholder="Enter quantity"
          min="1"
          max="1000000"
          step="1"
          required
          aria-describedby="quantity-help quantity-error"
          @blur="validateField('quantity')"
          @input="clearFieldError('quantity')"
        >
        <div id="quantity-help" class="form-help">
          Enter the number of units to produce (1 - 1,000,000)
        </div>
        <div 
          v-if="formErrors.quantity"
          id="quantity-error"
          class="form-error"
          role="alert"
          aria-live="polite"
        >
          {{ formErrors.quantity }}
        </div>
      </div>

      <!-- Due Date Field -->
      <div class="form-group">
        <label 
          for="due-date"
          class="form-label required"
        >
          Due Date
        </label>
        <input
          id="due-date"
          v-model="formData.due_date"
          type="date"
          class="form-input"
          :class="{ 'error': formErrors.due_date }"
          :min="minDate"
          required
          aria-describedby="due-date-help due-date-error"
          @blur="validateField('due_date')"
          @input="clearFieldError('due_date')"
        >
        <div id="due-date-help" class="form-help">
          Select a future date when the order should be completed
        </div>
        <div 
          v-if="formErrors.due_date"
          id="due-date-error"
          class="form-error"
          role="alert"
          aria-live="polite"
        >
          {{ formErrors.due_date }}
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="button"
          @click="resetForm"
          class="btn btn-outline"
          :disabled="loading.creating"
          aria-label="Clear form and start over"
        >
          Reset
        </button>
        
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading.creating || !isFormValid"
          :aria-label="loading.creating ? 'Creating order...' : 'Create production order'"
        >
          <span v-if="loading.creating" class="loading" aria-hidden="true"></span>
          <span v-else aria-hidden="true">➕</span>
          {{ loading.creating ? 'Creating...' : 'Create Order' }}
        </button>
      </div>

      <!-- Form-level Error -->
      <div 
        v-if="errors.creating"
        class="alert alert-error"
        role="alert"
        aria-live="assertive"
      >
        <strong>Failed to create order:</strong> {{ errors.creating }}
        <button 
          @click="clearError('creating')"
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
        v-if="showSuccessMessage"
        class="alert alert-success"
        role="alert"
        aria-live="polite"
      >
        <strong>Success!</strong> Production order created successfully.
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import { 
  validateProductName, 
  validateQuantity, 
  validateDueDate,
  formatDateForInput 
} from '@/services/utils'
import type { OrderFormData, OrderFormErrors } from '@/types'

interface Emits {
  (e: 'order-created'): void
}

const emit = defineEmits<Emits>()

const ordersStore = useOrdersStore()
const { loading, errors } = storeToRefs(ordersStore)

// Form data
const formData = reactive<OrderFormData>({
  product_name: '',
  quantity: null,
  due_date: ''
})

// Form validation errors
const formErrors = reactive<OrderFormErrors>({})

// Success message state
const showSuccessMessage = ref(false)

// Computed properties
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateForInput(tomorrow.toISOString())
})

const isFormValid = computed(() => {
  return (
    formData.product_name.trim() !== '' &&
    formData.quantity !== null &&
    formData.quantity > 0 &&
    formData.due_date !== '' &&
    Object.keys(formErrors).length === 0
  )
})

// Methods
const validateField = (field: keyof OrderFormData) => {
  switch (field) {
    case 'product_name':
      const nameError = validateProductName(formData.product_name)
      if (nameError) {
        formErrors.product_name = nameError
      } else {
        delete formErrors.product_name
      }
      break
      
    case 'quantity':
      const quantityError = validateQuantity(formData.quantity)
      if (quantityError) {
        formErrors.quantity = quantityError
      } else {
        delete formErrors.quantity
      }
      break
      
    case 'due_date':
      const dateError = validateDueDate(formData.due_date)
      if (dateError) {
        formErrors.due_date = dateError
      } else {
        delete formErrors.due_date
      }
      break
  }
}

const validateForm = () => {
  validateField('product_name')
  validateField('quantity')
  validateField('due_date')
  return Object.keys(formErrors).length === 0
}

const clearFieldError = (field: keyof OrderFormErrors) => {
  delete formErrors[field]
}

const clearError = (type: keyof typeof errors.value) => {
  ordersStore.clearError(type)
}

const resetForm = () => {
  formData.product_name = ''
  formData.quantity = null
  formData.due_date = ''
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key as keyof OrderFormErrors]
  })
  ordersStore.clearError('creating')
  showSuccessMessage.value = false
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await ordersStore.createOrder({
      product_name: formData.product_name.trim(),
      quantity: formData.quantity!,
      due_date: formData.due_date
    })

    // Show success message
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)

    // Reset form
    resetForm()

    // Emit success event
    emit('order-created')

  } catch (error) {
    console.error('Failed to create order:', error)
    // Error is handled by the store and displayed in the template
  }
}

onMounted(() => {
  // Set default due date to tomorrow
  formData.due_date = minDate.value
})
</script>

<style scoped>
.order-form-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-form {
  padding: 2rem;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions .btn {
  min-width: 120px;
}

.alert {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .order-form {
    padding: 1.5rem;
  }
  
  .form-header {
    margin-bottom: 1.5rem;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .form-actions .btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .order-form {
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }
}

/* Focus management for better accessibility */
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-input {
    border-width: 2px;
  }
  
  .form-input.error {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .form-input,
  .btn {
    transition: none;
  }
}
</style>