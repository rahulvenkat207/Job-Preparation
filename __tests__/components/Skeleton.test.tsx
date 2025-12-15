/**
 * Unit tests for Skeleton components
 * Tests rendering of Skeleton and SkeletonButton with className handling
 */

import { render, screen } from '@testing-library/react'
import { Skeleton, SkeletonButton } from '@/components/Skeleton'

describe('Skeleton', () => {
  // Test: Should render skeleton element
  it('should render skeleton element', () => {
    const { container } = render(<Skeleton />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toHaveClass('custom-class')
  })

  // Test: Should have default animation and styling classes
  it('should have default animation and styling classes', () => {
    const { container } = render(<Skeleton />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toHaveClass('animate-pulse', 'bg-muted', 'rounded')
  })
})

describe('SkeletonButton', () => {
  // Test: Should render skeleton button
  it('should render skeleton button', () => {
    const { container } = render(<SkeletonButton />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    const { container } = render(<SkeletonButton className="custom-class" />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toHaveClass('custom-class')
  })

  // Test: Should have button height class
  it('should have button height class', () => {
    const { container } = render(<SkeletonButton />)
    
    const skeleton = container.querySelector('span')
    expect(skeleton).toHaveClass('h-9')
  })
})

