<template>
  <div class="dashboard-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header" role="banner">
        <div class="header-content">
          <h1 class="page-title">Production Order Dashboard</h1>
          <p class="page-subtitle">
            Manage and track production orders with AI-powered insights
          </p>
        </div>
        <div class="header-actions">
          <button
            @click="toggleFormVisible"
            class="btn btn-primary"
            type="button"
            :aria-label="showForm ? 'Hide order form' : 'Show order form'"
            :aria-expanded="showForm"
            aria-controls="order-form-section"
          >
            <span aria-hidden="true">{{ showForm ? '➖' : '➕' }}</span>
            {{ showForm ? 'Hide Form' : 'New Order' }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-main" role="main">
        <!-- Statistics Dashboard -->
        <section 
          class="stats-section"
          aria-labelledby="stats-title"
        >
          <h2 id="stats-title" class="sr-only">Statistics Overview</h2>
          <StatsDashboard />
        </section>

        <!-- Order Form Section -->
        <section 
          v-if="showForm"
          id="order-form-section"
          class="form-section"
          aria-labelledby="form-section-title"
        >
          <h2 id="form-section-title" class="sr-only">Create New Order</h2>
          <OrderForm @order-created="handleOrderCreated" />
        </section>

        <!-- Orders List Section -->
        <section 
          class="orders-section"
          aria-labelledby="orders-title"
        >
          <h2 id="orders-title" class="sr-only">Production Orders List</h2>
          <OrderList />
        </section>
      </main>

      <!-- Quick Actions Floating Button (Mobile) -->
      <div class="quick-actions-mobile">
        <button
          @click="scrollToTop"
          class="quick-action-btn scroll-top-btn"
          type="button"
          aria-label="Scroll to top"
          :class="{ visible: showScrollTop }"
        >
          <span aria-hidden="true">⬆️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StatsDashboard from '@/components/StatsDashboard.vue'
import OrderForm from '@/components/OrderForm.vue'
import OrderList from '@/components/OrderList.vue'

// Set page metadata
document.title = 'Dashboard - Production Order Management'

// Reactive state
const showForm = ref(false)
const showScrollTop = ref(false)

// Methods
const toggleFormVisible = () => {
  showForm.value = !showForm.value
  
  // Scroll to form when showing it
  if (showForm.value) {
    setTimeout(() => {
      const formSection = document.getElementById('order-form-section')
      if (formSection) {
        formSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }
}

const handleOrderCreated = () => {
  // Optionally hide the form after successful creation
  // showForm.value = false
  
  // Scroll to the orders list to show the new order
  setTimeout(() => {
    const ordersSection = document.querySelector('.orders-section')
    if (ordersSection) {
      ordersSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, 500)
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Check if we should show the form based on URL hash
  if (window.location.hash === '#new-order') {
    showForm.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  max-width: 600px;
}

.header-actions {
  flex-shrink: 0;
  margin-left: 2rem;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-section,
.form-section,
.orders-section {
  animation: fadeInUp 0.6s ease-out;
}

.form-section {
  animation: slideDown 0.4s ease-out;
}

.quick-actions-mobile {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

.quick-action-btn {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}

.quick-action-btn.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.quick-action-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.quick-action-btn:active {
  transform: translateY(0);
}

.quick-action-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 1000px;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-page {
    padding: 1.5rem 0;
  }
  
  .page-header {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem 0;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    padding: 1.5rem;
  }
  
  .header-actions {
    margin-left: 0;
  }
  
  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .dashboard-main {
    gap: 1.5rem;
  }
  
  .quick-actions-mobile {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  
  .quick-action-btn {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-page {
    padding: 0.5rem 0;
  }
  
  .page-header {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .dashboard-main {
    gap: 1rem;
  }
  
  .quick-actions-mobile {
    bottom: 1rem;
    right: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .page-header {
    border-width: 2px;
  }
  
  .quick-action-btn {
    border: 2px solid #1e40af;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stats-section,
  .form-section,
  .orders-section {
    animation: none;
  }
  
  .quick-action-btn {
    transition: none;
  }
  
  .quick-action-btn:hover {
    transform: none;
  }
  
  .quick-action-btn.visible {
    transform: none;
  }
}

/* Focus management */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Print styles */
@media print {
  .header-actions,
  .quick-actions-mobile {
    display: none;
  }
  
  .dashboard-page {
    background: white;
    padding: 0;
  }
  
  .page-header {
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>