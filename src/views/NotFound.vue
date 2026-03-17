<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <div class="error-illustration" aria-hidden="true">
          <div class="error-code">404</div>
          <div class="error-icon">📋❓</div>
        </div>
        
        <div class="error-text">
          <h1 class="error-title">Page Not Found</h1>
          <p class="error-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div class="error-actions">
          <router-link to="/" class="btn btn-primary btn-lg">
            <span aria-hidden="true">🏠</span>
            Go to Dashboard
          </router-link>
          
          <button 
            @click="goBack"
            class="btn btn-outline btn-lg"
            type="button"
            aria-label="Go back to previous page"
          >
            <span aria-hidden="true">←</span>
            Go Back
          </button>
        </div>
        
        <div class="helpful-links">
          <h2 class="links-title">Helpful Links</h2>
          <div class="links-grid">
            <router-link to="/" class="help-link">
              <span class="link-icon" aria-hidden="true">📊</span>
              <span class="link-text">Dashboard</span>
            </router-link>
            
            <router-link to="/login" class="help-link">
              <span class="link-icon" aria-hidden="true">🔑</span>
              <span class="link-text">Sign In</span>
            </router-link>
            
            <router-link to="/register" class="help-link">
              <span class="link-icon" aria-hidden="true">📝</span>
              <span class="link-text">Sign Up</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-illustration {
  margin-bottom: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #e5e7eb;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.error-text {
  margin-bottom: 3rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.error-description {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.helpful-links {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.links-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.help-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  color: #374151;
  transition: all 0.15s ease-in-out;
}

.help-link:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.help-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.link-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e7ff;
  border-radius: 0.75rem;
}

.link-text {
  font-weight: 500;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .not-found-page {
    padding: 1rem;
  }
  
  .error-code {
    font-size: 6rem;
  }
  
  .error-icon {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-description {
    font-size: 1.125rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .helpful-links {
    padding: 1.5rem;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }
  
  .error-icon {
    font-size: 2.5rem;
  }
  
  .error-title {
    font-size: 1.75rem;
  }
  
  .error-description {
    font-size: 1rem;
  }
  
  .helpful-links {
    padding: 1rem;
  }
  
  .help-link {
    padding: 1rem;
  }
  
  .link-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .help-link {
    transition: none;
  }
  
  .help-link:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .helpful-links {
    border-width: 2px;
  }
  
  .help-link {
    border-width: 2px;
  }
}
</style>