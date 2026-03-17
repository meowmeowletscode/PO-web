<template>
  <div class="stats-dashboard">
    <div class="dashboard-header">
      <h2 class="dashboard-title">Dashboard Overview</h2>
      <button 
        @click="refreshStats"
        :disabled="loading.statistics"
        class="btn btn-outline btn-sm"
        type="button"
        :aria-label="loading.statistics ? 'Refreshing statistics...' : 'Refresh statistics'"
      >
        <span v-if="loading.statistics" class="loading" aria-hidden="true"></span>
        <span v-else aria-hidden="true">📊</span>
        {{ loading.statistics ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- Error State -->
    <div v-if="errors.statistics" class="alert alert-error" role="alert">
      <strong>Error loading statistics:</strong> {{ errors.statistics }}
      <button 
        @click="clearError('statistics')"
        class="btn btn-sm btn-outline"
        type="button"
        aria-label="Dismiss error message"
        style="margin-left: 1rem;"
      >
        Dismiss
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading.statistics && !statistics" class="loading-state">
      <div class="loading" aria-hidden="true"></div>
      <p>Loading statistics...</p>
    </div>

    <!-- Statistics Cards -->
    <div v-else-if="statistics" class="stats-grid">
      <!-- Total Orders -->
      <div class="stat-card" role="region" aria-labelledby="total-orders-title">
        <div class="stat-icon total-icon" aria-hidden="true">📋</div>
        <div class="stat-content">
          <h3 id="total-orders-title" class="stat-title">Total Orders</h3>
          <div class="stat-value">{{ formatNumber(statistics.total_orders) }}</div>
          <div class="stat-subtitle">All production orders</div>
        </div>
      </div>

      <!-- Pending Orders -->
      <div class="stat-card pending-card" role="region" aria-labelledby="pending-orders-title">
        <div class="stat-icon pending-icon" aria-hidden="true">⏳</div>
        <div class="stat-content">
          <h3 id="pending-orders-title" class="stat-title">Pending</h3>
          <div class="stat-value">{{ formatNumber(statistics.pending_orders) }}</div>
          <div class="stat-subtitle">
            {{ getPercentage(statistics.pending_orders, statistics.total_orders) }}% of total
          </div>
        </div>
      </div>

      <!-- In Progress Orders -->
      <div class="stat-card in-progress-card" role="region" aria-labelledby="in-progress-orders-title">
        <div class="stat-icon in-progress-icon" aria-hidden="true">🔄</div>
        <div class="stat-content">
          <h3 id="in-progress-orders-title" class="stat-title">In Progress</h3>
          <div class="stat-value">{{ formatNumber(statistics.in_progress_orders) }}</div>
          <div class="stat-subtitle">
            {{ getPercentage(statistics.in_progress_orders, statistics.total_orders) }}% of total
          </div>
        </div>
      </div>

      <!-- Completed Orders -->
      <div class="stat-card completed-card" role="region" aria-labelledby="completed-orders-title">
        <div class="stat-icon completed-icon" aria-hidden="true">✅</div>
        <div class="stat-content">
          <h3 id="completed-orders-title" class="stat-title">Completed</h3>
          <div class="stat-value">{{ formatNumber(statistics.completed_orders) }}</div>
          <div class="stat-subtitle">
            {{ getPercentage(statistics.completed_orders, statistics.total_orders) }}% of total
          </div>
        </div>
      </div>

      <!-- Total Quantity -->
      <div class="stat-card quantity-card" role="region" aria-labelledby="total-quantity-title">
        <div class="stat-icon quantity-icon" aria-hidden="true">📦</div>
        <div class="stat-content">
          <h3 id="total-quantity-title" class="stat-title">Total Quantity</h3>
          <div class="stat-value">{{ formatNumber(statistics.total_quantity) }}</div>
          <div class="stat-subtitle">Units to produce</div>
        </div>
      </div>

      <!-- Average Priority -->
      <div class="stat-card priority-card" role="region" aria-labelledby="avg-priority-title">
        <div class="stat-icon priority-icon" aria-hidden="true">⚡</div>
        <div class="stat-content">
          <h3 id="avg-priority-title" class="stat-title">Avg Priority</h3>
          <div class="stat-value">{{ formatPriorityScore(statistics.avg_priority_score) }}</div>
          <div class="stat-subtitle">{{ getPriorityLabel(statistics.avg_priority_score) }}</div>
        </div>
      </div>
    </div>

    <!-- AI Recommendations -->
    <div v-if="recommendations.length > 0" class="recommendations-section">
      <h3 class="recommendations-title">🤖 AI Recommendations</h3>
      <div class="recommendations-list" role="list">
        <div 
          v-for="(recommendation, index) in recommendations"
          :key="index"
          :class="getRecommendationClass(recommendation.type)"
          class="recommendation-item"
          role="listitem"
        >
          <div class="recommendation-icon" aria-hidden="true">
            {{ getRecommendationIcon(recommendation.type) }}
          </div>
          <div class="recommendation-content">
            <div class="recommendation-message">{{ recommendation.message }}</div>
            <div v-if="recommendation.orders.length > 0" class="recommendation-orders">
              Affected orders: 
              <span class="order-links">
                <span 
                  v-for="(orderId, idx) in recommendation.orders" 
                  :key="orderId"
                  class="order-id"
                >
                  #{{ orderId }}<span v-if="idx < recommendation.orders.length - 1">, </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Last Updated -->
    <div v-if="lastUpdated" class="last-updated">
      <small class="last-updated-text">
        Last updated: {{ formatDateTime(lastUpdated) }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import { 
  formatNumber, 
  formatPriorityScore, 
  formatDateTime,
  getPriorityLabel 
} from '@/services/utils'
import type { OrderRecommendation } from '@/types'

const ordersStore = useOrdersStore()
const { statistics, recommendations, lastUpdated, loading, errors } = storeToRefs(ordersStore)

// Methods
const refreshStats = async () => {
  try {
    await ordersStore.fetchStatistics()
  } catch (error) {
    console.error('Failed to refresh statistics:', error)
  }
}

const clearError = (type: keyof typeof errors.value) => {
  ordersStore.clearError(type)
}

const getPercentage = (value: number, total: number): string => {
  if (total === 0) return '0'
  return Math.round((value / total) * 100).toString()
}

const getRecommendationClass = (type: string): string => {
  switch (type) {
    case 'critical':
      return 'recommendation-critical'
    case 'overdue':
      return 'recommendation-overdue'
    case 'batch':
      return 'recommendation-batch'
    default:
      return 'recommendation-info'
  }
}

const getRecommendationIcon = (type: string): string => {
  switch (type) {
    case 'critical':
      return '🚨'
    case 'overdue':
      return '⚠️'
    case 'batch':
      return '📊'
    default:
      return 'ℹ️'
  }
}

// Load statistics on mount
onMounted(() => {
  if (!statistics.value) {
    refreshStats()
  }
})
</script>

<style scoped>
.stats-dashboard {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.total-icon { background-color: #dbeafe; }
.pending-icon { background-color: #fef3c7; }
.in-progress-icon { background-color: #dbeafe; }
.completed-icon { background-color: #d1fae5; }
.quantity-icon { background-color: #e0e7ff; }
.priority-icon { background-color: #fed7aa; }

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
}

.recommendations-section {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #fafafa;
}

.recommendations-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.375rem;
  border-left: 4px solid;
}

.recommendation-critical {
  background-color: #fef2f2;
  border-left-color: #dc2626;
}

.recommendation-overdue {
  background-color: #fffbeb;
  border-left-color: #d97706;
}

.recommendation-batch {
  background-color: #f0f9ff;
  border-left-color: #0284c7;
}

.recommendation-info {
  background-color: #f8fafc;
  border-left-color: #64748b;
}

.recommendation-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-message {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.recommendation-orders {
  font-size: 0.875rem;
  color: #6b7280;
}

.order-links {
  font-weight: 500;
}

.order-id {
  color: #3b82f6;
  font-weight: 600;
}

.last-updated {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  text-align: center;
}

.last-updated-text {
  color: #6b7280;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .recommendations-section {
    padding: 1rem;
  }
  
  .recommendation-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    padding: 0.75rem;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-content {
    text-align: center;
  }
  
  .recommendations-section {
    padding: 0.75rem;
  }
  
  .recommendation-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
  
  .stat-card:hover {
    transform: none;
  }
}
</style>