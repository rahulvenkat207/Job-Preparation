/**
 * Unit tests for utils utility functions
 * Tests the cn() className merging function with various inputs
 */

import { cn } from '@/lib/utils'

describe('cn', () => {
  // Test: Should merge class names
  it('should merge class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
  })

  // Test: Should handle conditional classes
  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
  })

  // Test: Should handle false conditional classes
  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).not.toContain('active-class')
  })

  // Test: Should handle undefined and null values
  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'other-class')
    expect(result).toContain('base-class')
    expect(result).toContain('other-class')
  })

  // Test: Should merge Tailwind classes and resolve conflicts
  it('should merge Tailwind classes and resolve conflicts', () => {
    // tailwind-merge should resolve conflicts, keeping the last one
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2') // Last class should win
  })

  // Test: Should handle empty strings
  it('should handle empty strings', () => {
    const result = cn('base-class', '', 'other-class')
    expect(result).toContain('base-class')
    expect(result).toContain('other-class')
  })

  // Test: Should handle arrays of classes
  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toContain('class1')
    expect(result).toContain('class2')
    expect(result).toContain('class3')
  })

  // Test: Should handle objects with boolean values
  it('should handle objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    })
    expect(result).toContain('class1')
    expect(result).not.toContain('class2')
    expect(result).toContain('class3')
  })

  // Test: Should handle complex combinations
  it('should handle complex combinations', () => {
    const isActive = true
    const isDisabled = false
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class',
      ['array-class1', 'array-class2'],
      {
        'object-class': true,
        'object-class-false': false,
      }
    )
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
    expect(result).not.toContain('disabled-class')
    expect(result).toContain('array-class1')
    expect(result).toContain('array-class2')
    expect(result).toContain('object-class')
    expect(result).not.toContain('object-class-false')
  })
})

