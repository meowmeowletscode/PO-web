import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type {
  ProductionOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderListResponse,
  StatisticsResponse,
  ApiResponse,
  ApiError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest
} from '@/types'

class ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    // In development, use the proxy. In production, use the environment variable
    this.baseURL = import.meta.env.PROD 
      ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')
      : ''
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuthToken()
          // Optionally redirect to login
        }
        return Promise.reject(this.handleApiError(error))
      }
    )
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  private clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError
    }
    
    return {
      error: 'Network Error',
      status: error.response?.status || 500,
      details: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: error.config?.url || ''
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
    const response = await this.api.get('/health')
    return response.data
  }

  // Production Orders API
  async getOrders(params?: {
    status?: string
    due_date_from?: string
    due_date_to?: string
    include_stats?: boolean
    include_recommendations?: boolean
  }): Promise<OrderListResponse> {
    try {
      console.log('🔄 Fetching orders from:', `${this.baseURL}/api/orders`, 'with params:', params)
      const response = await this.api.get('/api/orders', { params })
      console.log('✅ Orders response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      throw error
    }
  }

  async getOrder(id: number): Promise<ApiResponse<ProductionOrder>> {
    const response = await this.api.get(`/api/orders/${id}`)
    return response.data
  }

  async createOrder(order: CreateOrderRequest): Promise<ApiResponse<ProductionOrder>> {
    const response = await this.api.post('/api/orders', order)
    return response.data
  }

  async updateOrder(id: number, updates: UpdateOrderRequest): Promise<ApiResponse<ProductionOrder>> {
    const response = await this.api.patch(`/api/orders/${id}`, updates)
    return response.data
  }

  async getStatistics(): Promise<StatisticsResponse> {
    const response = await this.api.get('/api/orders/statistics/summary')
    return response.data
  }

  // Authentication API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/login', credentials)
    const authData = response.data
    
    if (authData.success && authData.data.token) {
      this.setAuthToken(authData.data.token)
    }
    
    return authData
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/register', userData)
    const authData = response.data
    
    if (authData.success && authData.data.token) {
      this.setAuthToken(authData.data.token)
    }
    
    return authData
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/api/auth/profile')
    return response.data
  }

  logout(): void {
    this.clearAuthToken()
  }

  // User Management API (Admin)
  async getUsers(): Promise<UserListResponse> {
    const response = await this.api.get('/api/users')
    return response.data
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get(`/api/users/${id}`)
    return response.data
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.api.post('/api/users', userData)
    return response.data
  }

  async updateUser(id: number, updates: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.api.patch(`/api/users/${id}`, updates)
    return response.data
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/api/users/${id}`)
    return response.data
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  getBaseURL(): string {
    return this.baseURL
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()
export default apiService