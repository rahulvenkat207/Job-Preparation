/**
 * Unit tests for ScrollArea component
 * Tests basic rendering functionality
 */

import { render, screen } from '@testing-library/react'
import { ScrollArea } from '@/components/ui/scroll-area'

describe('ScrollArea', () => {
  // Test: Should render scroll area with children
  it('should render scroll area with children', () => {
    render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>
    )
    
    expect(screen.getByText('Scrollable content')).toBeInTheDocument()
  })
})

