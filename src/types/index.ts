// Production Order Types
export interface ProductionOrder {
  id: number
  product_name: string
  quantity: number
  status: OrderStatus
  due_date: string
  priority_score: number
  created_at: string
  updated_at: string
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed'

export interface CreateOrderRequest {
  product_name: string
  quantity: number
  due_date: string
}

export interface UpdateOrderRequest {
  product_name?: string
  quantity?: number
  status?: OrderStatus
  due_date?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  error: string
  status: number
  details: string
  timestamp: string
  path: string
}

export interface OrderListResponse {
  success: boolean
  data: ProductionOrder[]
  count: number
  statistics?: OrderStatistics
  timestamp: string
}

export interface OrderStatistics {
  total_orders: number
  pending_orders: number
  in_progress_orders: number
  completed_orders: number
  total_quantity: number
  avg_priority_score: number
}

export interface OrderRecommendation {
  type: 'critical' | 'overdue' | 'batch'
  message: string
  orders: number[]
}

export interface StatisticsResponse {
  success: boolean
  data: {
    statistics: OrderStatistics
    recommendations: OrderRecommendation[]
    last_updated: string
  }
  timestamp: string
}

// Authentication Types
export interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    expires_in: string
  }
  timestamp: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role?: string
}

// UI State Types
export interface LoadingState {
  orders: boolean
  creating: boolean
  updating: boolean
  statistics: boolean
}

export interface ErrorState {
  orders: string | null
  creating: string | null
  updating: string | null
  statistics: string | null
}

// Form Types
export interface OrderFormData {
  product_name: string
  quantity: number | null
  due_date: string
}

export interface OrderFormErrors {
  product_name?: string
  quantity?: string
  due_date?: string
}

// Priority Level Types
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'very-low'

export interface PriorityConfig {
  level: PriorityLevel
  label: string
  color: string
  min: number
  max: number
}