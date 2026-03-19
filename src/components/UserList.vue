<template>
  <div class="user-list">
    <div class="list-header">
      <h2 class="list-title">Users</h2>
      <div class="list-actions">
        <button 
          @click="refreshUsers"
          :disabled="loading"
          class="btn btn-outline btn-sm"
          type="button"
          :aria-label="loading ? 'Refreshing users...' : 'Refresh user list'"
        >
          <span v-if="loading" class="loading" aria-hidden="true"></span>
          <span v-else aria-hidden="true">🔄</span>
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
        <router-link 
          to="/users/new"
          class="btn btn-primary btn-sm"
          aria-label="Create new user"
        >
          <span aria-hidden="true">➕</span>
          New User
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters" role="region" aria-label="User filters">
      <div class="filter-group">
        <label for="role-filter" class="form-label">Filter by Role:</label>
        <select 
          id="role-filter"
          v-model="selectedRole"
          class="form-select"
          @change="applyFilters"
          aria-describedby="role-filter-help"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <div id="role-filter-help" class="form-help">
          Filter users by their role
        </div>
      </div>

      <div class="filter-group">
        <label for="search-input" class="form-label">Search:</label>
        <input
          id="search-input"
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Search by username, email, or ID..."
          @input="applyFilters"
          aria-describedby="search-help"
        >
        <div id="search-help" class="form-help">
          Search across usernames, emails, and user IDs
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-error" role="alert">
      <strong>Error loading users:</strong> {{ error }}
      <button 
        @click="error = null"
        class="btn btn-sm btn-outline"
        type="button"
        aria-label="Dismiss error message"
        style="margin-left: 1rem;"
      >
        Dismiss
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && users.length === 0" class="loading-state">
      <div class="loading" aria-hidden="true"></div>
      <p>Loading users...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredUsers.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">👥</div>
      <h3>No users found</h3>
      <p v-if="hasActiveFilters">
        Try adjusting your filters or search terms.
      </p>
      <p v-else>
        No users have been created yet.
      </p>
    </div>

    <!-- Users Table -->
    <div v-else class="table-container">
      <div class="table-info">
        <p class="results-count">
          Showing {{ filteredUsers.length }} of {{ users.length }} users
        </p>
      </div>
      
      <table 
        class="table user-table"
        role="table"
        aria-label="Users"
        aria-describedby="table-description"
      >
        <div id="table-description" class="sr-only">
          Table showing users with columns for ID, username, email, role, and created date. Each row has actions to edit or delete the user.
        </div>
        
        <thead>
          <tr role="row">
            <th scope="col" class="sortable" @click="sortBy('id')">
              User ID
              <span v-if="sortField === 'id'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('username')">
              Username
              <span v-if="sortField === 'username'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('email')">
              Email
              <span v-if="sortField === 'email'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('role')">
              Role
              <span v-if="sortField === 'role'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="sortable" @click="sortBy('created_at')">
              Created
              <span v-if="sortField === 'created_at'" :aria-label="sortDirection === 'asc' ? 'Sorted ascending' : 'Sorted descending'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="user in paginatedUsers"
            :key="user.id"
            role="row"
          >
            <td>{{ user.id }}</td>
            <td>
              <div class="user-info-cell">
                <span class="user-icon" aria-hidden="true">👤</span>
                <strong>{{ user.username }}</strong>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span 
                class="role-badge"
                :class="`role-${user.role.toLowerCase()}`"
              >
                {{ user.role }}
              </span>
            </td>
            <td>
              <time :datetime="user.created_at">
                {{ formatDate(user.created_at) }}
              </time>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button
                  @click="handleEdit(user)"
                  class="btn btn-sm btn-outline"
                  type="button"
                  :aria-label="`Edit user ${user.username}`"
                  title="Edit user"
                >
                  ✏️
                </button>
                <button
                  @click="handleDelete(user)"
                  class="btn btn-sm btn-danger"
                  type="button"
                  :aria-label="`Delete user ${user.username}`"
                  title="Delete user"
                  :disabled="deletingUserId === user.id"
                >
                  <span v-if="deletingUserId === user.id" class="loading" aria-hidden="true"></span>
                  <span v-else>🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination" role="navigation" aria-label="Users pagination">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-outline btn-sm"
          type="button"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        <span class="pagination-info" aria-live="polite">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-outline btn-sm"
          type="button"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal" @click.stop role="dialog" aria-labelledby="delete-modal-title" aria-modal="true">
        <div class="modal-header">
          <h3 id="delete-modal-title">Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete user <strong>{{ userToDelete?.username }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button
            @click="closeDeleteModal"
            class="btn btn-outline"
            type="button"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-danger"
            type="button"
            :disabled="deletingUserId !== null"
          >
            <span v-if="deletingUserId !== null" class="loading" aria-hidden="true"></span>
            {{ deletingUserId !== null ? 'Deleting...' : 'Delete User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import apiService from '@/services/api'
import { debounce } from '@/services/utils'
import type { User } from '@/types'

const router = useRouter()

// State
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const deletingUserId = ref<number | null>(null)
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

// Filters and search
const selectedRole = ref<string>('')
const searchQuery = ref<string>('')

// Sorting
const sortField = ref<string>('id')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Computed
const hasActiveFilters = computed(() => 
  selectedRole.value !== '' || searchQuery.value.trim() !== ''
)

const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Apply role filter
  if (selectedRole.value && selectedRole.value !== '') {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query)
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aVal: any = a[sortField.value as keyof typeof a]
    let bVal: any = b[sortField.value as keyof typeof b]

    if (sortField.value === 'created_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredUsers.value.length / itemsPerPage)
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

// Methods
const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const applyFilters = debounce(() => {
  currentPage.value = 1
}, 300)

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

const refreshUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiService.getUsers()
    users.value = response.data
  } catch (err: any) {
    error.value = err.details || err.error || 'Failed to load users'
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
}

const handleEdit = (user: User) => {
  router.push(`/users/${user.id}/edit`)
}

const handleDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  deletingUserId.value = userToDelete.value.id
  
  try {
    await apiService.deleteUser(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value!.id)
    closeDeleteModal()
  } catch (err: any) {
    error.value = err.details || err.error || 'Failed to delete user'
    console.error('Failed to delete user:', err)
  } finally {
    deletingUserId.value = null
  }
}

// Watch for filter changes to reset pagination
watch([selectedRole, searchQuery], () => {
  currentPage.value = 1
})

// Load users on mount
onMounted(() => {
  refreshUsers()
})
</script>

<style scoped>
.user-list {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.list-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.filters {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fafafa;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.table-container {
  padding: 1.5rem;
}

.table-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.user-table {
  margin-bottom: 1.5rem;
}

.user-table th {
  position: relative;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;
}

.sortable:hover {
  background-color: #f3f4f6;
}

.sortable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1.25rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.role-admin {
  background-color: #fee2e2;
  color: #991b1b;
}

.role-manager {
  background-color: #dbeafe;
  color: #1e40af;
}

.role-user {
  background-color: #e5e7eb;
  color: #374151;
}

.actions-col {
  width: 140px;
}

.actions-cell {
  padding: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #374151;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .list-actions {
    justify-content: stretch;
  }
  
  .list-actions .btn {
    flex: 1;
  }
  
  .filters {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .table-container {
    padding: 1rem;
    overflow-x: auto;
  }
  
  .user-table {
    min-width: 700px;
  }
  
  .table-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .list-header,
  .filters,
  .table-container {
    padding: 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal {
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
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
</style>
