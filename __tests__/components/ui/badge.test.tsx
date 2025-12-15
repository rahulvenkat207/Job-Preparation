/**
 * Unit tests for Badge component
 * Tests rendering, variants, and asChild prop
 */

import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  // Test: Should render badge with default variant
  it('should render badge with default variant', () => {
    render(<Badge>Badge Text</Badge>)
    
    const badge = screen.getByText('Badge Text')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  // Test: Should render all badge variants
  it('should render all badge variants', () => {
    const variants = ['default', 'secondary', 'destructive', 'warning', 'outline'] as const
    
    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toBeInTheDocument()
      unmount()
    })
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Badge className="custom-class">Test</Badge>)
    
    const badge = screen.getByText('Test')
    expect(badge).toHaveClass('custom-class')
  })

  // Test: Should render as child component when asChild is true
  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  // Test: Should pass through additional props
  it('should pass through additional props', () => {
    render(<Badge data-testid="custom-badge" aria-label="Custom badge">Test</Badge>)
    
    const badge = screen.getByTestId('custom-badge')
    expect(badge).toHaveAttribute('aria-label', 'Custom badge')
  })
})

