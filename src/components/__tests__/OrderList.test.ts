import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderList from '../OrderList.vue'
import { useOrdersStore } from '@/stores/orders'

// Mock child components
vi.mock('../OrderRow.vue', () => ({
  default: {
    name: 'OrderRow',
    props: ['order'],
    template: '<tr data-testid="order-row"><td>{{ order.product_name }}</td></tr>'
  }
}))

// Mock API service
vi.mock('@/services/api', () => ({
  default: {
    getOrders: vi.fn(() => Promise.resolve({
      success: true,
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }))
  }
}))

describe('OrderList', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useOrdersStore()
    
    wrapper = mount(OrderList, {
      global: {
        stubs: {
          OrderRow: {
            props: ['order'],
            template: '<tr data-testid="order-row"><td>{{ order.product_name }}</td></tr>'
          }
        }
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.order-list').exists()).toBe(true)
  })

  it('displays the correct title', () => {
    expect(wrapper.find('.list-title').text()).toBe('Production Orders')
  })

  it('shows loading state when orders are being fetched', async () => {
    store.loading.orders = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.loading-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading orders...')
  })

  it('shows empty state when no orders exist', async () => {
    store.loading.orders = false
    store.orders = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No orders found')
  })

  it('displays orders when available', async () => {
    const mockOrders = [
      {
        id: 1,
        product_name: 'Test Product 1',
        quantity: 100,
        status: 'Pending',
        due_date: '2026-04-01',
        priority_score: 7.5,
        created_at: '2026-03-17T10:00:00Z',
        updated_at: '2026-03-17T10:00:00Z'
      },
      {
        id: 2,
        product_name: 'Test Product 2',
        quantity: 200,
        status: 'In Progress',
        due_date: '2026-04-02',
        priority_score: 8.0,
        created_at: '2026-03-17T10:00:00Z',
        updated_at: '2026-03-17T10:00:00Z'
      }
    ]

    store.loading.orders = false
    store.orders = mockOrders
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('.order-table').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="order-row"]')).toHaveLength(2)
  })

  it('handles status filter changes', async () => {
    const statusFilter = wrapper.find('#status-filter')
    expect(statusFilter.exists()).toBe(true)

    await statusFilter.setValue('Pending')
    expect(wrapper.vm.selectedStatus).toBe('Pending')
  })

  it('handles search input', async () => {
    const searchInput = wrapper.find('#search-input')
    expect(searchInput.exists()).toBe(true)

    await searchInput.setValue('test product')
    expect(wrapper.vm.searchQuery).toBe('test product')
  })

  it('shows error state when there is an error', async () => {
    store.errors.orders = 'Failed to load orders'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load orders')
  })

  it('has proper accessibility attributes', () => {
    expect(wrapper.find('[role="region"][aria-label="Order filters"]').exists()).toBe(true)
    expect(wrapper.find('[role="table"][aria-label="Production orders"]').exists()).toBe(true)
    expect(wrapper.find('#status-filter[aria-describedby="status-filter-help"]').exists()).toBe(true)
    expect(wrapper.find('#search-input[aria-describedby="search-help"]').exists()).toBe(true)
  })

  it('calls refresh function when refresh button is clicked', async () => {
    const refreshSpy = vi.spyOn(wrapper.vm, 'refreshOrders')
    const refreshButton = wrapper.find('button[aria-label*="Refresh"]')
    
    await refreshButton.trigger('click')
    expect(refreshSpy).toHaveBeenCalled()
  })
})