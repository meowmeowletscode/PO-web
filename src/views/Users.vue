<template>
  <div class="users-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header" role="banner">
        <div class="header-content">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">
            Manage system users and their roles
          </p>
        </div>
        <div class="header-actions">
          <router-link
            to="/users/new"
            class="btn btn-primary"
            aria-label="Create new user"
          >
            <span aria-hidden="true">➕</span>
            New User
          </router-link>
        </div>
      </header>

      <!-- Main Content -->
      <main class="users-main" role="main">
        <!-- Users List Section -->
        <section 
          class="users-section"
          aria-labelledby="users-title"
        >
          <h2 id="users-title" class="sr-only">Users List</h2>
          <UserList />
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserList from '@/components/UserList.vue'

document.title = 'Users - Production Order Dashboard'
</script>

<style scoped>
.users-page {
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

.users-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.users-section {
  animation: fadeInUp 0.6s ease-out;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .users-page {
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
  .users-page {
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
  
  .users-main {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .users-page {
    padding: 0.5rem 0;
  }
  
  .page-header {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .users-main {
    gap: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .page-header {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .users-section {
    animation: none;
  }
}

/* Screen reader only */
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
  .header-actions {
    display: none;
  }
  
  .users-page {
    background: white;
    padding: 0;
  }
  
  .page-header {
    box-shadow: none;
    border: 1px solid #000;
  }
}
</style>
