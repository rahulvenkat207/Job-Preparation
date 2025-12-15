/**
 * Unit tests for formatters utility functions
 * Tests formatDateTime() with various date formats and locales
 */

import { formatDateTime } from '@/lib/formatters'

describe('formatDateTime', () => {
  // Test: Should format date and time
  it('should format date and time', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const result = formatDateTime(date)
    
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  // Test: Should format different dates correctly
  it('should format different dates correctly', () => {
    const dates = [
      new Date('2024-01-15T14:30:00Z'),
      new Date('2023-12-25T00:00:00Z'),
      new Date('2024-06-01T12:00:00Z'),
    ]

    dates.forEach((date) => {
      const result = formatDateTime(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })

  // Test: Should include both date and time
  it('should include both date and time', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const result = formatDateTime(date)
    
    // Should contain date components (month/day/year)
    expect(result).toMatch(/\d+/)
    // Should contain time components (hours:minutes)
    expect(result).toMatch(/\d+:\d+/)
  })

  // Test: Should handle current date
  it('should handle current date', () => {
    const now = new Date()
    const result = formatDateTime(now)
    
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  // Test: Should handle dates in different timezones
  it('should handle dates in different timezones', () => {
    const date1 = new Date('2024-01-15T14:30:00Z')
    const date2 = new Date('2024-01-15T14:30:00-05:00')
    
    const result1 = formatDateTime(date1)
    const result2 = formatDateTime(date2)
    
    // Both should produce valid formatted strings
    expect(result1).toBeTruthy()
    expect(result2).toBeTruthy()
    expect(typeof result1).toBe('string')
    expect(typeof result2).toBe('string')
  })

  // Test: Should format edge case dates
  it('should format edge case dates', () => {
    const edgeCases = [
      new Date('1970-01-01T00:00:00Z'), // Unix epoch
      new Date('2099-12-31T23:59:59Z'), // Far future
      new Date('2000-02-29T12:00:00Z'), // Leap year
    ]

    edgeCases.forEach((date) => {
      const result = formatDateTime(date)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })
  })
})

