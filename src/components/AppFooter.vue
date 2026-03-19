<template>
  <footer class="app-footer" role="contentinfo">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <p class="footer-text">
            © Angel Yap - Production Order Dashboard
          </p>
          <p class="footer-subtitle">
            Automating 80% of routine operations with intelligent insights
          </p>
        </div>
        
        <div class="footer-section">
          <div class="footer-links">
            <a 
              href="#" 
              class="footer-link"
              aria-label="API Documentation"
              @click.prevent="showApiDocs"
            >
              API Docs
            </a>
            <a 
              href="#" 
              class="footer-link"
              aria-label="System Health Check"
              @click.prevent="checkHealth"
            >
              Health: 
              <span 
                :class="healthStatusClass"
                :aria-label="`System status: ${healthStatus}`"
              >
                {{ healthStatus }}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiService from '@/services/api'

const healthStatus = ref<string>('Checking...')
const lastHealthCheck = ref<Date | null>(null)

const healthStatusClass = computed(() => ({
  'health-ok': healthStatus.value === 'OK',
  'health-error': healthStatus.value === 'Error',
  'health-checking': healthStatus.value === 'Checking...'
}))

const checkHealth = async () => {
  try {
    healthStatus.value = 'Checking...'
    const health = await apiService.healthCheck()
    healthStatus.value = health.status
    lastHealthCheck.value = new Date()
  } catch (error) {
    healthStatus.value = 'Error'
    console.warn('Health check failed:', error)
  }
}

const showApiDocs = () => {
  const baseUrl = apiService.getBaseURL()
  window.open(`${baseUrl}/api/docs`, '_blank')
}

onMounted(() => {
  checkHealth()
  // Check health every 5 minutes
  setInterval(checkHealth, 5 * 60 * 1000)
})
</script>

<style scoped>
.app-footer {
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 2rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.footer-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.footer-link {
  font-size: 0.75rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s ease-in-out;
}

.footer-link:hover {
  color: #3b82f6;
}

.footer-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.health-ok {
  color: #10b981;
  font-weight: 600;
}

.health-error {
  color: #ef4444;
  font-weight: 600;
}

.health-checking {
  color: #f59e0b;
  font-weight: 600;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .footer-section {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 1.5rem 0 1rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>