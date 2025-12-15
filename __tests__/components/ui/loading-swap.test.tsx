/**
 * Unit tests for LoadingSwap component
 * Tests loading state display, children visibility, and className handling
 */

import { render, screen } from '@testing-library/react'
import { LoadingSwap } from '@/components/ui/loading-swap'

describe('LoadingSwap', () => {
  // Test: Should render children when not loading
  it('should render children when not loading', () => {
    render(
      <LoadingSwap isLoading={false}>
        <span>Content</span>
      </LoadingSwap>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  // Test: Should show loading icon when loading
  it('should show loading icon when loading', () => {
    const { container } = render(
      <LoadingSwap isLoading={true}>
        <span>Content</span>
      </LoadingSwap>
    )
    
    // Loading icon should be present (Loader2Icon from lucide-react)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(
      <LoadingSwap isLoading={false} className="custom-class">
        <span>Content</span>
      </LoadingSwap>
    )
    
    const container = screen.getByText('Content').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  // Test: Should apply loadingIconClassName
  it('should apply loadingIconClassName', () => {
    const { container } = render(
      <LoadingSwap isLoading={true} loadingIconClassName="custom-icon-class">
        <span>Content</span>
      </LoadingSwap>
    )
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    if (icon) {
      expect(icon).toHaveClass('custom-icon-class')
    }
  })
})

