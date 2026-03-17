<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <h1 class="profile-title">User Profile</h1>
        <p class="profile-subtitle">
          Manage your account settings and preferences
        </p>
      </div>

      <div class="profile-content">
        <!-- Loading State -->
        <div v-if="authStore.isLoading" class="loading-state">
          <div class="loading" aria-hidden="true"></div>
          <p>Loading profile...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="authStore.error" class="alert alert-error" role="alert">
          <strong>Error loading profile:</strong> {{ authStore.error }}
          <button 
            @click="authStore.clearError()"
            class="btn btn-sm btn-outline"
            type="button"
            aria-label="Dismiss error message"
            style="margin-left: 1rem;"
          >
            Dismiss
          </button>
        </div>

        <!-- Profile Information -->
        <div v-else-if="authStore.user" class="profile-card">
          <div class="profile-info">
            <div class="profile-avatar">
              <div class="avatar-placeholder" aria-hidden="true">
                {{ getInitials(authStore.user.username) }}
              </div>
            </div>
            
            <div class="profile-details">
              <h2 class="user-name">{{ authStore.user.username }}</h2>
              <p class="user-email">{{ authStore.user.email }}</p>
              <div class="user-role">
                <span class="role-badge" :class="`role-${authStore.user.role}`">
                  {{ formatRole(authStore.user.role) }}
                </span>
              </div>
              <p class="user-joined">
                Member since {{ formatDate(authStore.user.created_at) }}
              </p>
            </div>
          </div>

          <div class="profile-actions">
            <button
              @click="refreshProfile"
              :disabled="authStore.isLoading"
              class="btn btn-outline"
              type="button"
              aria-label="Refresh profile information"
            >
              <span v-if="authStore.isLoading" class="loading" aria-hidden="true"></span>
              <span v-else aria-hidden="true">🔄</span>
              {{ authStore.isLoading ? 'Refreshing...' : 'Refresh' }}
            </button>
            
            <button
              @click="handleLogout"
              class="btn btn-danger"
              type="button"
              aria-label="Sign out of your account"
            >
              <span aria-hidden="true">🚪</span>
              Sign Out
            </button>
          </div>
        </div>

        <!-- Account Statistics -->
        <div v-if="authStore.user" class="account-stats">
          <h3 class="stats-title">Account Activity</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon" aria-hidden="true">📊</div>
              <div class="stat-content">
                <div class="stat-label">Dashboard Access</div>
                <div class="stat-value">Available</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon" aria-hidden="true">🔐</div>
              <div class="stat-content">
                <div class="stat-label">Account Status</div>
                <div class="stat-value">Active</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon" aria-hidden="true">⚡</div>
              <div class="stat-content">
                <div class="stat-label">Role</div>
                <div class="stat-value">{{ formatRole(authStore.user.role) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="profile-navigation">
          <h3 class="nav-title">Quick Actions</h3>
          <div class="nav-links">
            <router-link to="/" class="nav-link">
              <span class="nav-icon" aria-hidden="true">📋</span>
              <span class="nav-text">Dashboard</span>
              <span class="nav-arrow" aria-hidden="true">→</span>
            </router-link>
            
            <a 
              href="#" 
              @click.prevent="downloadData"
              class="nav-link"
              aria-label="Download your data"
            >
              <span class="nav-icon" aria-hidden="true">💾</span>
              <span class="nav-text">Download Data</span>
              <span class="nav-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/services/utils'

const router = useRouter()
const authStore = useAuthStore()

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const refreshProfile = async () => {
  try {
    await authStore.fetchProfile()
  } catch (error) {
    console.error('Failed to refresh profile:', error)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const downloadData = () => {
  if (!authStore.user) return
  
  const userData = {
    username: authStore.user.username,
    email: authStore.user.email,
    role: authStore.user.role,
    created_at: authStore.user.created_at,
    exported_at: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(userData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `profile-data-${authStore.user.username}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Load profile on mount
onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    refreshProfile()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.profile-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.profile-details {
  flex: 1;
}

.user-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.user-email {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.user-role {
  margin-bottom: 0.75rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-user {
  background-color: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background-color: #fed7aa;
  color: #9a3412;
}

.role-admin {
  background-color: #fecaca;
  color: #991b1b;
}

.user-joined {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.account-stats {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.stats-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e7ff;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.profile-navigation {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  color: #374151;
  transition: all 0.15s ease-in-out;
}

.nav-link:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.nav-link:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.nav-icon {
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-weight: 500;
}

.nav-arrow {
  color: #9ca3af;
  font-weight: 600;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .profile-title {
    font-size: 2rem;
  }
  
  .profile-subtitle {
    font-size: 1rem;
  }
  
  .profile-card,
  .account-stats,
  .profile-navigation {
    padding: 1.5rem;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .profile-actions .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-card,
  .account-stats,
  .profile-navigation {
    padding: 1rem;
  }
  
  .user-name {
    font-size: 1.5rem;
  }
  
  .user-email {
    font-size: 1rem;
  }
  
  .avatar-placeholder {
    width: 4rem;
    height: 4rem;
    font-size: 1.25rem;
  }
}
</style>