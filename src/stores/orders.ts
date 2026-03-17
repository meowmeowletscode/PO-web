import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'
import type {
  ProductionOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatistics,
  OrderRecommendation,
  LoadingState,
  ErrorState,
  OrderStatus
} from '@/types'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<ProductionOrder[]>([])
  const statistics = ref<OrderStatistics | null>(null)
  const recommendations = ref<OrderRecommendation[]>([])
  const lastUpdated = ref<string>('')

  const loading = ref<LoadingState>({
    orders: false,
    creating: false,
    updating: false,
    statistics: false
  })

  const errors = ref<ErrorState>({
    orders: null,
    creating: null,
    updating: null,
    statistics: null
  })

  // Computed
  const ordersCount = computed(() => orders.value.length)
  
  const ordersByStatus = computed(() => {
    return orders.value.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)
  })

  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'Pending')
  )

  const inProgressOrders = computed(() => 
    orders.value.filter(order => order.status === 'In Progress')
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'Completed')
  )

  const criticalOrders = computed(() => 
    orders.value.filter(order => order.priority_score >= 8.5)
  )

  const overdueOrders = computed(() => {
    const today = new Date()
    return orders.value.filter(order => {
      const dueDate = new Date(order.due_date)
      return dueDate < today && order.status !== 'Completed'
    })
  })

  const sortedOrders = computed(() => {
    return [...orders.value].sort((a, b) => {
      // Sort by priority score (descending), then by due date (ascending)
      if (a.priority_score !== b.priority_score) {
        return b.priority_score - a.priority_score
      }
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
  })

  // Actions
  const clearError = (type: keyof ErrorState) => {
    errors.value[type] = null
  }

  const clearAllErrors = () => {
    Object.keys(errors.value).forEach(key => {
      errors.value[key as keyof ErrorState] = null
    })
  }

  const fetchOrders = async (params?: {
    status?: string
    due_date_from?: string
    due_date_to?: string
    include_stats?: boolean
    include_recommendations?: boolean
  }) => {
    loading.value.orders = true
    errors.value.orders = null

    try {
      const response = await apiService.getOrders(params)
      orders.value = response.data
      
      if (response.statistics) {
        statistics.value = response.statistics
      }
      
      return response
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      errors.value.orders = error.details || 'Failed to fetch orders'
      throw error
    } finally {
      loading.value.orders = false
    }
  }

  const fetchOrder = async (id: number) => {
    try {
      const response = await apiService.getOrder(id)
      
      // Update the order in the list if it exists
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  const createOrder = async (orderData: CreateOrderRequest) => {
    loading.value.creating = true
    errors.value.creating = null

    try {
      const response = await apiService.createOrder(orderData)
      
      // Add the new order to the beginning of the list
      orders.value.unshift(response.data)
      
      return response.data
    } catch (error: any) {
      errors.value.creating = error.details || 'Failed to create order'
      throw error
    } finally {
      loading.value.creating = false
    }
  }

  const updateOrder = async (id: number, updates: UpdateOrderRequest) => {
    loading.value.updating = true
    errors.value.updating = null

    try {
      const response = await apiService.updateOrder(id, updates)
      
      // Update the order in the list
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      
      return response.data
    } catch (error: any) {
      errors.value.updating = error.details || 'Failed to update order'
      throw error
    } finally {
      loading.value.updating = false
    }
  }

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    return updateOrder(id, { status })
  }

  const fetchStatistics = async () => {
    loading.value.statistics = true
    errors.value.statistics = null

    try {
      const response = await apiService.getStatistics()
      statistics.value = response.data.statistics
      recommendations.value = response.data.recommendations
      lastUpdated.value = response.data.last_updated
      
      return response.data
    } catch (error: any) {
      errors.value.statistics = error.details || 'Failed to fetch statistics'
      throw error
    } finally {
      loading.value.statistics = false
    }
  }

  const refreshData = async () => {
    await Promise.all([
      fetchOrders({ include_stats: true, include_recommendations: true }),
      fetchStatistics()
    ])
  }

  const filterOrdersByStatus = (status: OrderStatus | null) => {
    if (!status) return orders.value
    return orders.value.filter(order => order.status === status)
  }

  const filterOrdersByDateRange = (from: string, to: string) => {
    return orders.value.filter(order => {
      const dueDate = new Date(order.due_date)
      const fromDate = new Date(from)
      const toDate = new Date(to)
      return dueDate >= fromDate && dueDate <= toDate
    })
  }

  const searchOrders = (query: string) => {
    if (!query.trim()) return orders.value
    
    const lowercaseQuery = query.toLowerCase()
    return orders.value.filter(order =>
      order.product_name.toLowerCase().includes(lowercaseQuery) ||
      order.status.toLowerCase().includes(lowercaseQuery) ||
      order.id.toString().includes(query)
    )
  }

  // Reset store
  const $reset = () => {
    orders.value = []
    statistics.value = null
    recommendations.value = []
    lastUpdated.value = ''
    loading.value = {
      orders: false,
      creating: false,
      updating: false,
      statistics: false
    }
    errors.value = {
      orders: null,
      creating: null,
      updating: null,
      statistics: null
    }
  }

  return {
    // State
    orders,
    statistics,
    recommendations,
    lastUpdated,
    loading,
    errors,
    
    // Computed
    ordersCount,
    ordersByStatus,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    criticalOrders,
    overdueOrders,
    sortedOrders,
    
    // Actions
    clearError,
    clearAllErrors,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    fetchStatistics,
    refreshData,
    filterOrdersByStatus,
    filterOrdersByDateRange,
    searchOrders,
    $reset
  }
})