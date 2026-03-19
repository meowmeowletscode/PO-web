<template>
  <header class="app-header" role="banner">
    <div class="container">
      <nav class="nav-container" role="navigation" aria-label="Main navigation">
        <div class="nav-brand">
          <router-link to="/" class="brand-link" aria-label="Production Order Dashboard Home">
            <h1 class="brand-title">📋 PO Dashboard</h1>
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link 
            to="/" 
            class="nav-link"
            :class="{ active: $route.name === 'dashboard' }"
            aria-current="page"
          >
            Dashboard
          </router-link>
          
          <router-link 
            v-if="authStore.isAuthenticated && authStore.user?.role === 'admin'"
            to="/users" 
            class="nav-link"
            :class="{ active: $route.name === 'users' || $route.name === 'create-user' || $route.name === 'edit-user' }"
          >
            Users
          </router-link>
          
          <div class="nav-actions">
            <template v-if="authStore.isAuthenticated">
              <span class="user-info" aria-label="Current user">
                👤 {{ authStore.user?.username }}
              </span>
              <button 
                @click="handleLogout"
                class="btn btn-outline btn-sm"
                type="button"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </template>
            <template v-else>
              <router-link 
                to="/login" 
                class="btn btn-primary btn-sm"
                aria-label="Sign in to your account"
              >
                Sign In
              </router-link>
            </template>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}

.nav-link:hover {
  color: #374151;
}

.nav-link.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.nav-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .nav-menu {
    justify-content: space-between;
    gap: 1rem;
  }
  
  .nav-actions {
    gap: 0.75rem;
  }
  
  .user-info {
    font-size: 0.75rem;
  }
  
  .brand-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .nav-actions {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .nav-actions .btn {
    text-align: center;
  }
}
</style>