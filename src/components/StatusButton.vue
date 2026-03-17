<template>
  <div class="status-button-container">
    <button
      v-if="nextStatus"
      @click="handleStatusUpdate"
      :disabled="disabled || isUpdating"
      :class="buttonClass"
      class="btn btn-sm status-update-btn"
      type="button"
      :aria-label="`Update order ${orderId} status from ${currentStatus} to ${nextStatus}`"
    >
      <span v-if="isUpdating" class="loading" aria-hidden="true"></span>
      <span v-else class="status-icon" aria-hidden="true">{{ nextStatusIcon }}</span>
      {{ isUpdating ? 'Updating...' : `Mark ${nextStatus}` }}
    </button>
    
    <span v-else class="status-complete" aria-label="Order is completed">
      ✅ Complete
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getStatusIcon } from '@/services/utils'
import type { OrderStatus } from '@/types'

interface Props {
  currentStatus: OrderStatus
  orderId: number
  disabled?: boolean
}

interface Emits {
  (e: 'update-status', newStatus: OrderStatus): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

const isUpdating = ref(false)

// Determine the next logical status
const nextStatus = computed((): OrderStatus | null => {
  switch (props.currentStatus) {
    case 'Pending':
      return 'In Progress'
    case 'In Progress':
      return 'Completed'
    case 'Completed':
      return null // No next status for completed orders
    default:
      return null
  }
})

const nextStatusIcon = computed(() => {
  return nextStatus.value ? getStatusIcon(nextStatus.value) : ''
})

const buttonClass = computed(() => {
  if (!nextStatus.value) return ''
  
  switch (nextStatus.value) {
    case 'In Progress':
      return 'btn-primary'
    case 'Completed':
      return 'btn-success'
    default:
      return 'btn-secondary'
  }
})

const handleStatusUpdate = async () => {
  if (!nextStatus.value || isUpdating.value || props.disabled) return
  
  isUpdating.value = true
  
  try {
    emit('update-status', nextStatus.value)
    // Note: We don't set isUpdating to false here because the parent component
    // will handle the async operation and the component might re-render
  } catch (error) {
    console.error('Failed to update status:', error)
  } finally {
    // Use a small delay to prevent flickering
    setTimeout(() => {
      isUpdating.value = false
    }, 500)
  }
}
</script>

<style scoped>
.status-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 2rem;
}

.status-update-btn {
  white-space: nowrap;
  font-weight: 600;
  transition: all 0.15s ease-in-out;
  min-width: 100px;
}

.status-update-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-update-btn:active:not(:disabled) {
  transform: translateY(0);
}

.status-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-icon {
  font-size: 0.875rem;
}

.status-complete {
  color: #059669;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .status-update-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    min-width: 80px;
  }
  
  .status-complete {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .status-update-btn {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    min-width: 70px;
  }
  
  .status-icon {
    font-size: 0.75rem;
  }
}

/* Focus styles for accessibility */
.status-update-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .status-update-btn {
    border-width: 2px;
  }
  
  .status-complete {
    border: 2px solid #059669;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
}
</style>