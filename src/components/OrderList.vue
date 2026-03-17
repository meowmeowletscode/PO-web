<template>
  <div class="order-list">
    <div class="list-header">
      <h2 class="list-title">Production Orders</h2>
      <div class="list-actions">
        <button 
          @click="refreshOrders"
          :disabled="loading.orders"
          class="btn btn-outline btn-sm"
          type="button"
          :aria-label="loading.orders ? 'Refreshing orders...' : 'Refresh order list'"
        >
          <span v-if="loading.orders" class="loading" aria-hidden="true"></span>
          <span v-else aria-hidden="true">🔄</span>
          {{ loading.orders ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters" role="region" aria-label="Order filters">
      <div class="filter-group">
        <label for="status-filter" class="form-label">Filter by Status:</label>
        <select 
          id="status-filter"
          v-model="selectedStatus"
          class="form-select"
          @change="applyFilters"
          aria-describedby="status-filter-help"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <div id="status-filter-help" class="form-help">
          Filter orders by their current status
        </div>
      </div>

      <div class="filter-group">
        <label for="search-input" class="form-label">Search:</label>
        <input
          id="search-input"
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Search by product name, ID, or status..."
          @input="applyFilters"
          aria-describedby="search-help"
        >
        <div id="search-help" class="form-help">
          Search across product names, order IDs, and status
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="errors.orders" class="alert alert-error" role="alert">
      <strong>Error loading orders:</strong> {{ errors.orders }}
      <button 
        @click="clearError('orders')"
        class="btn btn-sm btn-outline"
        type="button"
        aria-label="Dismiss error message"
        style="margin-left: 1rem;"
      >
        Dismiss
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading.orders && orders.length === 0" class="loading-state">
      <div class="loading" aria-hidden="true"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading.orders && filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">📋</div>
      <h3>No orders found</h3>
      <p v-if="hasActiveFilters">
        Try adjusting your filters or search terms.
      </p>
      <p v-else>
        No production orders have been created yet.
      </p>
    </div>

    <!-- Orders Table -->
    <div v-else class="table-container">
      <div class="table-info">
        <p class="results-count">
          Showing {{ filteredOrders.length }} of {{ orders.length }} orders
        </p>
      </div>
      
      <table 
        class="table order-table"
        role="table"
        aria-label="Production orders"
        aria-describedby="table-description"
      >
        <div id="table-description" class="sr-only">
          Table showing production orders with columns for ID, product name, quantity, status, due date, and priority score. Each row has actions to update the order status.
        </div>
        
        <thead>
          <tr role="row">
            <th scope="col" class="sortable" @click="sortBy('id')">
              Order ID
              <span v-if="sortField === 'id'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('product_name')">
              Product Name
              <span v-if="sortField === 'product_name'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('quantity')">
              Quantity
              <span v-if="sortField === 'quantity'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col">Status</th>
            <th scope="col" class="sortable" @click="sortBy('due_date')">
              Due Date
              <span v-if="sortField === 'due_date'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('priority_score')">
              Priority
              <span v-if="sortField === 'priority_score'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <OrderRow
            v-for="order in paginatedOrders"
            :key="order.id"
            :order="order"
            @update-status="handleStatusUpdate"
          />
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination" role="navigation" aria-label="Orders pagination">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-outline btn-sm"
          type="button"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        <span class="pagination-info" aria-live="polite">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-outline btn-sm"
          type="button"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import OrderRow from '@/components/OrderRow.vue'
import { debounce } from '@/services/utils'
import type { OrderStatus } from '@/types'

const ordersStore = useOrdersStore()
const { orders, loading, errors } = storeToRefs(ordersStore)

// Filters and search
const selectedStatus = ref<string>('')
const searchQuery = ref<string>('')

// Sorting
const sortField = ref<string>('priority_score')
const sortDirection = ref<'asc' | 'desc'>('desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Computed
const hasActiveFilters = computed(() => 
  selectedStatus.value !== '' || searchQuery.value.trim() !== ''
)

const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  // Apply status filter
  if (selectedStatus.value && selectedStatus.value !== '') {
    filtered = filtered.filter(order => order.status === selectedStatus.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order =>
      order.product_name.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.id.toString().includes(query)
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aVal: any = a[sortField.value as keyof typeof a]
    let bVal: any = b[sortField.value as keyof typeof b]

    // Handle different data types
    if (sortField.value === 'due_date') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredOrders.value.length / itemsPerPage)
)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

// Methods
const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = field === 'priority_score' ? 'desc' : 'asc'
  }
  currentPage.value = 1
}

const applyFilters = debounce(() => {
  currentPage.value = 1
}, 300)

const refreshOrders = async () => {
  try {
    await ordersStore.fetchOrders({ include_stats: true })
  } catch (error) {
    console.error('Failed to refresh orders:', error)
  }
}

const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

const clearError = (type: keyof typeof errors.value) => {
  ordersStore.clearError(type)
}

// Watch for filter changes to reset pagination
watch([selectedStatus, searchQuery], () => {
  currentPage.value = 1
})

// Load orders on mount
onMounted(() => {
  refreshOrders()
})
</script>

<style scoped>
.order-list {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.list-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.filters {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fafafa;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.table-container {
  padding: 1.5rem;
}

.table-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.order-table {
  margin-bottom: 1.5rem;
}

.order-table th {
  position: relative;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;
}

.sortable:hover {
  background-color: #f3f4f6;
}

.sortable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.actions-col {
  width: 120px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .table-container {
    padding: 1rem;
    overflow-x: auto;
  }
  
  .order-table {
    min-width: 600px;
  }
  
  .table-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .list-header,
  .filters,
  .table-container {
    padding: 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>