import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatDateForInput,
  isOverdue,
  isDueSoon,
  getPriorityLevel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusIcon,
  validateProductName,
  validateQuantity,
  validateDueDate,
  formatNumber,
  formatPriorityScore
} from '../utils'

describe('Date Utilities', () => {
  it('formats date correctly', () => {
    expect(formatDate('2026-03-17T10:00:00Z')).toBe('Mar 17, 2026')
    expect(formatDate('2026-12-25T15:30:00Z')).toBe('Dec 25, 2026')
  })

  it('formats date time correctly', () => {
    expect(formatDateTime('2026-03-17T10:00:00Z')).toBe('Mar 17, 2026 10:00')
    expect(formatDateTime('2026-12-25T15:30:00Z')).toBe('Dec 25, 2026 15:30')
  })

  it('formats date for input correctly', () => {
    expect(formatDateForInput('2026-03-17T10:00:00Z')).toBe('2026-03-17')
    expect(formatDateForInput('2026-12-25T15:30:00Z')).toBe('2026-12-25')
  })

  it('handles invalid date strings gracefully', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date')
    expect(formatDateTime('invalid-date')).toBe('invalid-date')
    expect(formatDateForInput('invalid-date')).toBe('')
  })

  it('detects overdue dates correctly', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    expect(isOverdue(yesterday.toISOString())).toBe(true)
    expect(isOverdue(tomorrow.toISOString())).toBe(false)
    expect(isOverdue('invalid-date')).toBe(false)
  })

  it('detects due soon dates correctly', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    expect(isDueSoon(tomorrow.toISOString(), 3)).toBe(true)
    expect(isDueSoon(nextWeek.toISOString(), 3)).toBe(false)
    expect(isDueSoon('invalid-date')).toBe(false)
  })
})

describe('Priority Utilities', () => {
  it('returns correct priority level for different scores', () => {
    expect(getPriorityLevel(9.5)).toBe('critical')
    expect(getPriorityLevel(7.5)).toBe('high')
    expect(getPriorityLevel(5.5)).toBe('medium')
    expect(getPriorityLevel(3.5)).toBe('low')
    expect(getPriorityLevel(1.5)).toBe('very-low')
  })

  it('returns correct priority color for different scores', () => {
    expect(getPriorityColor(9.5)).toBe('#dc2626')
    expect(getPriorityColor(7.5)).toBe('#ea580c')
    expect(getPriorityColor(5.5)).toBe('#ca8a04')
    expect(getPriorityColor(3.5)).toBe('#16a34a')
    expect(getPriorityColor(1.5)).toBe('#6b7280')
  })

  it('returns correct priority label for different scores', () => {
    expect(getPriorityLabel(9.5)).toBe('Critical')
    expect(getPriorityLabel(7.5)).toBe('High')
    expect(getPriorityLabel(5.5)).toBe('Medium')
    expect(getPriorityLabel(3.5)).toBe('Low')
    expect(getPriorityLabel(1.5)).toBe('Very Low')
  })
})

describe('Status Utilities', () => {
  it('returns correct status color', () => {
    expect(getStatusColor('Pending')).toBe('#f59e0b')
    expect(getStatusColor('In Progress')).toBe('#3b82f6')
    expect(getStatusColor('Completed')).toBe('#10b981')
    expect(getStatusColor('Unknown')).toBe('#6b7280')
  })

  it('returns correct status icon', () => {
    expect(getStatusIcon('Pending')).toBe('⏳')
    expect(getStatusIcon('In Progress')).toBe('🔄')
    expect(getStatusIcon('Completed')).toBe('✅')
    expect(getStatusIcon('Unknown')).toBe('❓')
  })
})

describe('Validation Utilities', () => {
  describe('validateProductName', () => {
    it('validates product name correctly', () => {
      expect(validateProductName('Valid Product')).toBeNull()
      expect(validateProductName('')).toBe('Product name is required')
      expect(validateProductName('   ')).toBe('Product name is required')
      expect(validateProductName('a'.repeat(256))).toBe('Product name must be less than 255 characters')
    })
  })

  describe('validateQuantity', () => {
    it('validates quantity correctly', () => {
      expect(validateQuantity(100)).toBeNull()
      expect(validateQuantity(1)).toBeNull()
      expect(validateQuantity(1000000)).toBeNull()
      
      expect(validateQuantity(null)).toBe('Quantity is required')
      expect(validateQuantity(0)).toBe('Quantity must be positive')
      expect(validateQuantity(-1)).toBe('Quantity must be positive')
      expect(validateQuantity(1000001)).toBe('Quantity must be less than 1,000,000')
      expect(validateQuantity(1.5)).toBe('Quantity must be a whole number')
    })
  })

  describe('validateDueDate', () => {
    it('validates due date correctly', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowString = tomorrow.toISOString().split('T')[0]
      
      expect(validateDueDate(tomorrowString)).toBeNull()
      expect(validateDueDate('')).toBe('Due date is required')
      expect(validateDueDate('   ')).toBe('Due date is required')
      expect(validateDueDate('2020-01-01')).toBe('Due date must be in the future')
      expect(validateDueDate('invalid-date')).toBe('Invalid date format')
    })
  })
})

describe('Number Formatting Utilities', () => {
  it('formats numbers correctly', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(100)).toBe('100')
  })

  it('formats priority score correctly', () => {
    expect(formatPriorityScore(7.5)).toBe('7.5')
    expect(formatPriorityScore(8)).toBe('8.0')
    expect(formatPriorityScore(9.123)).toBe('9.1')
  })
})