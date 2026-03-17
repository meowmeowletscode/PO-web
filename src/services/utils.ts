import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import type { PriorityLevel, PriorityConfig } from '@/types'

// Date utilities
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'MMM dd, yyyy HH:mm')
  } catch {
    return dateString
  }
}

export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export const isOverdue = (dueDateString: string): boolean => {
  try {
    const dueDate = parseISO(dueDateString)
    const today = new Date()
    return isBefore(dueDate, today)
  } catch {
    return false
  }
}

export const isDueSoon = (dueDateString: string, days: number = 3): boolean => {
  try {
    const dueDate = parseISO(dueDateString)
    const threshold = addDays(new Date(), days)
    return isBefore(dueDate, threshold) && isAfter(dueDate, new Date())
  } catch {
    return false
  }
}

// Priority utilities
export const priorityConfigs: PriorityConfig[] = [
  { level: 'critical', label: 'Critical', color: '#dc2626', min: 8.5, max: 10 },
  { level: 'high', label: 'High', color: '#ea580c', min: 7, max: 8.4 },
  { level: 'medium', label: 'Medium', color: '#ca8a04', min: 5, max: 6.9 },
  { level: 'low', label: 'Low', color: '#16a34a', min: 3, max: 4.9 },
  { level: 'very-low', label: 'Very Low', color: '#6b7280', min: 0, max: 2.9 }
]

export const getPriorityConfig = (score: number): PriorityConfig => {
  return priorityConfigs.find(config => score >= config.min && score <= config.max) || priorityConfigs[4]
}

export const getPriorityLevel = (score: number): PriorityLevel => {
  return getPriorityConfig(score).level
}

export const getPriorityColor = (score: number): string => {
  return getPriorityConfig(score).color
}

export const getPriorityLabel = (score: number): string => {
  return getPriorityConfig(score).label
}

// Status utilities
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return '#f59e0b'
    case 'In Progress':
      return '#3b82f6'
    case 'Completed':
      return '#10b981'
    default:
      return '#6b7280'
  }
}

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'Pending':
      return '⏳'
    case 'In Progress':
      return '🔄'
    case 'Completed':
      return '✅'
    default:
      return '❓'
  }
}

// Validation utilities
export const validateProductName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Product name is required'
  }
  if (name.length > 255) {
    return 'Product name must be less than 255 characters'
  }
  return null
}

export const validateQuantity = (quantity: number | null): string | null => {
  if (quantity === null || quantity === undefined) {
    return 'Quantity is required'
  }
  if (quantity <= 0) {
    return 'Quantity must be positive'
  }
  if (quantity > 1000000) {
    return 'Quantity must be less than 1,000,000'
  }
  if (!Number.isInteger(quantity)) {
    return 'Quantity must be a whole number'
  }
  return null
}

export const validateDueDate = (dateString: string): string | null => {
  if (!dateString.trim()) {
    return 'Due date is required'
  }
  
  try {
    const dueDate = parseISO(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (isBefore(dueDate, today)) {
      return 'Due date must be in the future'
    }
    
    return null
  } catch {
    return 'Invalid date format'
  }
}

// Number formatting utilities
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

export const formatPriorityScore = (score: number): string => {
  return score.toFixed(1)
}

// Debounce utility for search/filtering
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Local storage utilities
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultValue
  }
}