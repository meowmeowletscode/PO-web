<template>
  <span 
    :class="badgeClass"
    class="badge status-badge"
    :aria-label="`Status: ${status}`"
  >
    <span class="status-icon" aria-hidden="true">{{ statusIcon }}</span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getStatusIcon } from '@/services/utils'
import type { OrderStatus } from '@/types'

interface Props {
  status: OrderStatus
}

const props = defineProps<Props>()

const statusIcon = computed(() => getStatusIcon(props.status))

const badgeClass = computed(() => {
  switch (props.status) {
    case 'Pending':
      return 'badge-pending'
    case 'In Progress':
      return 'badge-in-progress'
    case 'Completed':
      return 'badge-completed'
    default:
      return 'badge-pending'
  }
})
</script>

<style scoped>
.status-badge {
  font-weight: 600;
  text-transform: none;
  white-space: nowrap;
}

.status-icon {
  font-size: 0.875rem;
}

.badge-pending {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.badge-in-progress {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #60a5fa;
}

.badge-completed {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
}

@media (max-width: 640px) {
  .status-badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }
  
  .status-icon {
    font-size: 0.75rem;
  }
}
</style>