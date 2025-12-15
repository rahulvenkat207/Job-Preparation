/**
 * Unit tests for Alert components
 * Tests rendering of Alert, AlertTitle, and AlertDescription with variants
 */

import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert', () => {
  // Test: Should render alert with default variant
  it('should render alert with default variant', () => {
    render(<Alert>Alert content</Alert>)
    
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-slot', 'alert')
  })

  // Test: Should render all alert variants
  it('should render all alert variants', () => {
    const variants = ['default', 'destructive', 'warning'] as const
    
    variants.forEach((variant) => {
      const { unmount } = render(<Alert variant={variant}>Test</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      unmount()
    })
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Alert className="custom-class">Test</Alert>)
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })
})

describe('AlertTitle', () => {
  // Test: Should render alert title
  it('should render alert title', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
      </Alert>
    )
    
    const title = screen.getByText('Alert Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-slot', 'alert-title')
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(
      <Alert>
        <AlertTitle className="custom-class">Title</AlertTitle>
      </Alert>
    )
    
    const title = screen.getByText('Title')
    expect(title).toHaveClass('custom-class')
  })
})

describe('AlertDescription', () => {
  // Test: Should render alert description
  it('should render alert description', () => {
    render(
      <Alert>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>
    )
    
    const description = screen.getByText('Alert description text')
    expect(description).toBeInTheDocument()
    expect(description).toHaveAttribute('data-slot', 'alert-description')
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(
      <Alert>
        <AlertDescription className="custom-class">Description</AlertDescription>
      </Alert>
    )
    
    const description = screen.getByText('Description')
    expect(description).toHaveClass('custom-class')
  })
})

describe('Alert Composition', () => {
  // Test: Should render complete alert structure
  it('should render complete alert structure', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>
    )
    
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })
})

