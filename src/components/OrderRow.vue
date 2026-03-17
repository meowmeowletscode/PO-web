<template>
  <tr 
    class="order-row"
    :class="{ 
      'overdue': isOverdue, 
      'due-soon': isDueSoon,
      'critical': isCritical 
    }"
    role="row"
  >
    <td class="order-id">
      <span class="id-badge">#{{ order.id }}</span>
    </td>
    
    <td class="product-name">
      <span class="product-text" :title="order.product_name">
        {{ order.product_name }}
      </span>
    </td>
    
    <td class="quantity">
      <span class="quantity-text">
        {{ formatNumber(order.quantity) }}
      </span>
    </td>
    
    <td class="status">
      <StatusBadge :status="order.status" />
    </td>
    
    <td class="due-date">
      <div class="date-container">
        <span class="date-text">{{ formatDate(order.due_date) }}</span>
        <div v-if="isOverdue || isDueSoon" class="date-warning">
          <span v-if="isOverdue" class="overdue-indicator" aria-label="Overdue">
            ⚠️ Overdue
          </span>
          <span v-else-if="isDueSoon" class="due-soon-indicator" aria-label="Due soon">
            ⏰ Due soon
          </span>
        </div>
      </div>
    </td>
    
    <td class="priority">
      <PriorityBadge :score="order.priority_score" />
    </td>
    
    <td class="actions">
      <StatusButton
        :current-status="order.status"
        :order-id="order.id"
        :disabled="loading.updating"
        @update-status="$emit('update-status', order.id, $event)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import StatusBadge from '@/components/StatusBadge.vue'
import PriorityBadge from '@/components/PriorityBadge.vue'
import StatusButton from '@/components/StatusButton.vue'
import { formatDate, formatNumber, isOverdue as checkIsOverdue, isDueSoon as checkIsDueSoon } from '@/services/utils'
import type { ProductionOrder, OrderStatus } from '@/types'

interface Props {
  order: ProductionOrder
}

interface Emits {
  (e: 'update-status', orderId: number, newStatus: OrderStatus): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const ordersStore = useOrdersStore()
const { loading } = storeToRefs(ordersStore)

// Computed properties for styling and warnings
const isOverdue = computed(() => 
  props.order.status !== 'Completed' && checkIsOverdue(props.order.due_date)
)

const isDueSoon = computed(() => 
  props.order.status !== 'Completed' && !isOverdue.value && checkIsDueSoon(props.order.due_date, 3)
)

const isCritical = computed(() => 
  props.order.priority_score >= 8.5
)
</script>

<style scoped>
.order-row {
  transition: background-color 0.15s ease-in-out;
}

.order-row:hover {
  background-color: #f9fafb;
}

.order-row.overdue {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.order-row.due-soon {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.order-row.critical {
  background-color: #fef2f2;
  border-left: 4px solid #dc2626;
}

.order-row.overdue:hover {
  background-color: #fee2e2;
}

.order-row.due-soon:hover {
  background-color: #fef3c7;
}

.order-row.critical:hover {
  background-color: #fee2e2;
}

.order-id {
  font-weight: 600;
  color: #374151;
}

.id-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.product-name {
  max-width: 200px;
}

.product-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  color: #1f2937;
}

.quantity-text {
  font-weight: 600;
  color: #374151;
}

.date-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-text {
  font-size: 0.875rem;
  color: #374151;
}

.date-warning {
  font-size: 0.75rem;
  font-weight: 500;
}

.overdue-indicator {
  color: #dc2626;
}

.due-soon-indicator {
  color: #d97706;
}

.actions {
  text-align: center;
}

@media (max-width: 768px) {
  .product-name {
    max-width: 150px;
  }
  
  .date-container {
    font-size: 0.75rem;
  }
  
  .date-warning {
    font-size: 0.625rem;
  }
}

@media (max-width: 640px) {
  .product-name {
    max-width: 120px;
  }
  
  .id-badge {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
  }
}
</style>