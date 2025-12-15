/**
 * Unit tests for BackLink component
 * Tests rendering, href prop, children, and className handling
 */

import { render, screen } from '@testing-library/react'
import { BackLink } from '@/components/BackLink'

describe('BackLink', () => {
  // Test: Should render with correct href
  it('should render with correct href', () => {
    render(<BackLink href="/test">Back to Test</BackLink>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
  })

  // Test: Should render children text
  it('should render children text', () => {
    render(<BackLink href="/test">Go Back</BackLink>)
    
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<BackLink href="/test" className="custom-class">Back</BackLink>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('custom-class')
  })

  // Test: Should render arrow icon
  it('should render arrow icon', () => {
    render(<BackLink href="/test">Back</BackLink>)
    
    const link = screen.getByRole('link')
    // ArrowLeftIcon should be rendered as SVG
    expect(link.querySelector('svg')).toBeInTheDocument()
  })

  // Test: Should have correct default styling classes
  it('should have correct default styling classes', () => {
    render(<BackLink href="/test">Back</BackLink>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('flex', 'gap-2', 'items-center', 'text-sm', 'text-muted-foreground')
  })
})

