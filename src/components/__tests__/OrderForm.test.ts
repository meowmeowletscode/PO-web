import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrderForm from '../OrderForm.vue'
import { useOrdersStore } from '@/stores/orders'

// Mock API service
vi.mock('@/services/api', () => ({
  default: {
    createOrder: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 1,
        product_name: 'Test Product',
        quantity: 100,
        status: 'Pending',
        due_date: '2026-04-01',
        priority_score: 7.5,
        created_at: '2026-03-17T10:00:00Z',
        updated_at: '2026-03-17T10:00:00Z'
      },
      message: 'Order created successfully',
      timestamp: new Date().toISOString()
    }))
  }
}))

describe('OrderForm', () => {
  let wrapper: any
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useOrdersStore()
    
    wrapper = mount(OrderForm)
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.order-form').exists()).toBe(true)
  })

  it('displays the correct title', () => {
    expect(wrapper.find('.form-title').text()).toBe('Create New Production Order')
  })

  it('has all required form fields', () => {
    expect(wrapper.find('#product-name').exists()).toBe(true)
    expect(wrapper.find('#quantity').exists()).toBe(true)
    expect(wrapper.find('#due-date').exists()).toBe(true)
  })

  it('validates required fields', async () => {
    const submitButton = wrapper.find('button[type="submit"]')
    
    // Initially form should be invalid
    expect(wrapper.vm.isFormValid).toBe(false)
    expect(submitButton.attributes('disabled')).toBeDefined()

    // Fill in the form
    await wrapper.find('#product-name').setValue('Test Product')
    await wrapper.find('#quantity').setValue('100')
    await wrapper.find('#due-date').setValue('2026-04-01')

    expect(wrapper.vm.isFormValid).toBe(true)
  })

  it('shows validation errors for invalid inputs', async () => {
    const productNameInput = wrapper.find('#product-name')
    const quantityInput = wrapper.find('#quantity')

    // Test empty product name
    await productNameInput.setValue('')
    await productNameInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#product-name-error').text()).toBe('Product name is required')

    // Test invalid quantity
    await quantityInput.setValue('-1')
    await quantityInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#quantity-error').text()).toBe('Quantity must be positive')
  })

  it('validates product name length', async () => {
    const productNameInput = wrapper.find('#product-name')
    
    // Test too long product name
    const longName = 'a'.repeat(256)
    await productNameInput.setValue(longName)
    await productNameInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#product-name-error').text()).toBe('Product name must be less than 255 characters')
  })

  it('validates quantity range', async () => {
    const quantityInput = wrapper.find('#quantity')
    
    // Test quantity too large
    await quantityInput.setValue('1000001')
    await quantityInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#quantity-error').text()).toBe('Quantity must be less than 1,000,000')
  })

  it('validates due date is in the future', async () => {
    const dueDateInput = wrapper.find('#due-date')
    
    // Test past date
    await dueDateInput.setValue('2020-01-01')
    await dueDateInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('#due-date-error').text()).toBe('Due date must be in the future')
  })

  it('resets form when reset button is clicked', async () => {
    // Fill in the form
    await wrapper.find('#product-name').setValue('Test Product')
    await wrapper.find('#quantity').setValue('100')
    await wrapper.find('#due-date').setValue('2026-04-01')

    // Click reset button
    const resetButton = wrapper.find('button[type="button"]')
    await resetButton.trigger('click')

    expect(wrapper.vm.formData.product_name).toBe('')
    expect(wrapper.vm.formData.quantity).toBe(null)
    expect(wrapper.vm.formData.due_date).toBe('')
  })

  it('submits form with valid data', async () => {
    const createOrderSpy = vi.spyOn(store, 'createOrder')
    
    // Fill in valid form data
    await wrapper.find('#product-name').setValue('Test Product')
    await wrapper.find('#quantity').setValue('100')
    await wrapper.find('#due-date').setValue('2026-04-01')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    expect(createOrderSpy).toHaveBeenCalledWith({
      product_name: 'Test Product',
      quantity: 100,
      due_date: '2026-04-01'
    })
  })

  it('emits order-created event on successful submission', async () => {
    // Fill in valid form data
    await wrapper.find('#product-name').setValue('Test Product')
    await wrapper.find('#quantity').setValue('100')
    await wrapper.find('#due-date').setValue('2026-04-01')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Wait for async operations
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.emitted('order-created')).toBeTruthy()
  })

  it('has proper accessibility attributes', () => {
    expect(wrapper.find('form[aria-labelledby="form-title"]').exists()).toBe(true)
    expect(wrapper.find('#product-name[aria-describedby="product-name-help product-name-error"]').exists()).toBe(true)
    expect(wrapper.find('#quantity[aria-describedby="quantity-help quantity-error"]').exists()).toBe(true)
    expect(wrapper.find('#due-date[aria-describedby="due-date-help due-date-error"]').exists()).toBe(true)
    
    // Check for required field indicators
    expect(wrapper.find('label[for="product-name"].required').exists()).toBe(true)
    expect(wrapper.find('label[for="quantity"].required').exists()).toBe(true)
    expect(wrapper.find('label[for="due-date"].required').exists()).toBe(true)
  })

  it('shows loading state during form submission', async () => {
    store.loading.creating = true
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Creating...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('displays error message on submission failure', async () => {
    store.errors.creating = 'Failed to create order'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to create order')
  })
})