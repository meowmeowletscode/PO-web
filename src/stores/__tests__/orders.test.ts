import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrdersStore } from '../orders'
import type { ProductionOrder } from '@/types'

// Mock API service
const mockApiService = {
  getOrders: vi.fn(),
  getOrder: vi.fn(),
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  getStatistics: vi.fn()
}

vi.mock('@/services/api', () => ({
  default: mockApiService
}))

describe('Orders Store', () => {
  let store: ReturnType<typeof useOrdersStore>

  const mockOrder: ProductionOrder = {
    id: 1,
    product_name: 'Test Product',
    quantity: 100,
    status: 'Pending',
    due_date: '2026-04-01',
    priority_score: 7.5,
    created_at: '2026-03-17T10:00:00Z',
    updated_at: '2026-03-17T10:00:00Z'
  }

  const mockStatistics = {
    total_orders: 5,
    pending_orders: 2,
    in_progress_orders: 2,
    completed_orders: 1,
    total_quantity: 750,
    avg_priority_score: 6.8
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useOrdersStore()
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    expect(store.orders).toEqual([])
    expect(store.statistics).toBeNull()
    expect(store.recommendations).toEqual([])
    expect(store.loading.orders).toBe(false)
    expect(store.errors.orders).toBeNull()
  })

  describe('fetchOrders', () => {
    it('successfully fetches orders', async () => {
      const mockResponse = {
        success: true,
        data: [mockOrder],
        count: 1,
        timestamp: '2026-03-17T10:00:00Z'
      }

      mockApiService.getOrders.mockResolvedValue(mockResponse)

      await store.fetchOrders()

      expect(store.loading.orders).toBe(false)
      expect(store.orders).toEqual([mockOrder])
      expect(store.errors.orders).toBeNull()
      expect(mockApiService.getOrders).toHaveBeenCalledWith(undefined)
    })

    it('handles fetch orders error', async () => {
      const mockError = {
        details: 'Network error'
      }

      mockApiService.getOrders.mockRejectedValue(mockError)

      await expect(store.fetchOrders()).rejects.toThrow()
      expect(store.loading.orders).toBe(false)
      expect(store.errors.orders).toBe('Network error')
    })

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockApiService.getOrders.mockReturnValue(promise)

      const fetchPromise = store.fetchOrders()
      expect(store.loading.orders).toBe(true)

      resolvePromise!({
        success: true,
        data: [mockOrder],
        count: 1,
        timestamp: '2026-03-17T10:00:00Z'
      })

      await fetchPromise
      expect(store.loading.orders).toBe(false)
    })
  })

  describe('createOrder', () => {
    it('successfully creates an order', async () => {
      const mockResponse = {
        success: true,
        data: mockOrder,
        message: 'Order created successfully',
        timestamp: '2026-03-17T10:00:00Z'
      }

      mockApiService.createOrder.mockResolvedValue(mockResponse)

      const orderData = {
        product_name: 'Test Product',
        quantity: 100,
        due_date: '2026-04-01'
      }

      const result = await store.createOrder(orderData)

      expect(result).toEqual(mockOrder)
      expect(store.orders[0]).toEqual(mockOrder)
      expect(store.loading.creating).toBe(false)
      expect(store.errors.creating).toBeNull()
    })

    it('handles create order error', async () => {
      const mockError = {
        details: 'Validation failed'
      }

      mockApiService.createOrder.mockRejectedValue(mockError)

      const orderData = {
        product_name: '',
        quantity: 0,
        due_date: '2020-01-01'
      }

      await expect(store.createOrder(orderData)).rejects.toThrow()
      expect(store.errors.creating).toBe('Validation failed')
    })
  })

  describe('updateOrder', () => {
    it('successfully updates an order', async () => {
      const updatedOrder = { ...mockOrder, status: 'In Progress' as const }
      const mockResponse = {
        success: true,
        data: updatedOrder,
        message: 'Order updated successfully',
        timestamp: '2026-03-17T10:00:00Z'
      }

      // Set initial state
      store.orders = [mockOrder]
      mockApiService.updateOrder.mockResolvedValue(mockResponse)

      const result = await store.updateOrder(1, { status: 'In Progress' })

      expect(result).toEqual(updatedOrder)
      expect(store.orders[0]).toEqual(updatedOrder)
      expect(store.loading.updating).toBe(false)
      expect(store.errors.updating).toBeNull()
    })

    it('handles update order error', async () => {
      const mockError = {
        details: 'Order not found'
      }

      mockApiService.updateOrder.mockRejectedValue(mockError)

      await expect(store.updateOrder(999, { status: 'Completed' })).rejects.toThrow()
      expect(store.errors.updating).toBe('Order not found')
    })
  })

  describe('updateOrderStatus', () => {
    it('calls updateOrder with status', async () => {
      const updateOrderSpy = vi.spyOn(store, 'updateOrder')
      updateOrderSpy.mockResolvedValue(mockOrder)

      await store.updateOrderStatus(1, 'Completed')

      expect(updateOrderSpy).toHaveBeenCalledWith(1, { status: 'Completed' })
    })
  })

  describe('fetchStatistics', () => {
    it('successfully fetches statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          statistics: mockStatistics,
          recommendations: [],
          last_updated: '2026-03-17T10:00:00Z'
        },
        timestamp: '2026-03-17T10:00:00Z'
      }

      mockApiService.getStatistics.mockResolvedValue(mockResponse)

      await store.fetchStatistics()

      expect(store.statistics).toEqual(mockStatistics)
      expect(store.recommendations).toEqual([])
      expect(store.lastUpdated).toBe('2026-03-17T10:00:00Z')
      expect(store.loading.statistics).toBe(false)
      expect(store.errors.statistics).toBeNull()
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      store.orders = [
        { ...mockOrder, id: 1, status: 'Pending' },
        { ...mockOrder, id: 2, status: 'In Progress' },
        { ...mockOrder, id: 3, status: 'Completed' },
        { ...mockOrder, id: 4, status: 'Pending', priority_score: 9.0 }
      ]
    })

    it('calculates ordersCount correctly', () => {
      expect(store.ordersCount).toBe(4)
    })

    it('groups orders by status correctly', () => {
      expect(store.ordersByStatus).toEqual({
        'Pending': 2,
        'In Progress': 1,
        'Completed': 1
      })
    })

    it('filters pending orders correctly', () => {
      expect(store.pendingOrders).toHaveLength(2)
      expect(store.pendingOrders.every(order => order.status === 'Pending')).toBe(true)
    })

    it('filters in progress orders correctly', () => {
      expect(store.inProgressOrders).toHaveLength(1)
      expect(store.inProgressOrders[0].status).toBe('In Progress')
    })

    it('filters completed orders correctly', () => {
      expect(store.completedOrders).toHaveLength(1)
      expect(store.completedOrders[0].status).toBe('Completed')
    })

    it('filters critical orders correctly', () => {
      expect(store.criticalOrders).toHaveLength(1)
      expect(store.criticalOrders[0].priority_score).toBe(9.0)
    })

    it('sorts orders by priority and due date', () => {
      const sorted = store.sortedOrders
      expect(sorted[0].priority_score).toBe(9.0) // Highest priority first
      expect(sorted[0].id).toBe(4)
    })
  })

  describe('utility methods', () => {
    it('clears specific error', () => {
      store.errors.orders = 'Some error'
      store.clearError('orders')
      expect(store.errors.orders).toBeNull()
    })

    it('clears all errors', () => {
      store.errors.orders = 'Error 1'
      store.errors.creating = 'Error 2'
      store.clearAllErrors()
      expect(store.errors.orders).toBeNull()
      expect(store.errors.creating).toBeNull()
    })

    it('searches orders correctly', () => {
      store.orders = [
        { ...mockOrder, id: 1, product_name: 'Widget A' },
        { ...mockOrder, id: 2, product_name: 'Component B' },
        { ...mockOrder, id: 3, product_name: 'Assembly C' }
      ]

      const results = store.searchOrders('widget')
      expect(results).toHaveLength(1)
      expect(results[0].product_name).toBe('Widget A')
    })

    it('resets store state', () => {
      store.orders = [mockOrder]
      store.statistics = mockStatistics
      store.errors.orders = 'Some error'

      store.$reset()

      expect(store.orders).toEqual([])
      expect(store.statistics).toBeNull()
      expect(store.errors.orders).toBeNull()
    })
  })
})