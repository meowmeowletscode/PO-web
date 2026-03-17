<template>
  <div class="priority-container">
    <span 
      :class="badgeClass"
      class="badge priority-badge"
      :style="{ borderColor: priorityColor }"
      :aria-label="`Priority: ${priorityLabel} (${formatPriorityScore(score)})`"
    >
      <span class="priority-score">{{ formatPriorityScore(score) }}</span>
    </span>
    <div class="priority-label">{{ priorityLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  getPriorityConfig, 
  getPriorityColor, 
  getPriorityLabel, 
  formatPriorityScore 
} from '@/services/utils'

interface Props {
  score: number
}

const props = defineProps<Props>()

const priorityConfig = computed(() => getPriorityConfig(props.score))
const priorityColor = computed(() => getPriorityColor(props.score))
const priorityLabel = computed(() => getPriorityLabel(props.score))

const badgeClass = computed(() => {
  return `badge-${priorityConfig.value.level}`
})
</script>

<style scoped>
.priority-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.priority-badge {
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 2.5rem;
  text-align: center;
  border-width: 2px;
  border-style: solid;
}

.priority-score {
  font-family: 'Courier New', monospace;
}

.priority-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
}

.badge-critical {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #dc2626;
}

.badge-high {
  background-color: #fed7aa;
  color: #9a3412;
  border-color: #ea580c;
}

.badge-medium {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #ca8a04;
}

.badge-low {
  background-color: #dcfce7;
  color: #166534;
  border-color: #16a34a;
}

.badge-very-low {
  background-color: #f3f4f6;
  color: #4b5563;
  border-color: #6b7280;
}

@media (max-width: 768px) {
  .priority-badge {
    font-size: 0.625rem;
    min-width: 2rem;
    padding: 0.125rem 0.25rem;
  }
  
  .priority-label {
    font-size: 0.5rem;
  }
}

@media (max-width: 640px) {
  .priority-container {
    gap: 0.125rem;
  }
  
  .priority-label {
    display: none; /* Hide label on very small screens */
  }
}
</style>