/**
 * Unit tests for Resizable components
 * Tests basic rendering functionality
 */

import { render, screen } from '@testing-library/react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

describe('Resizable', () => {
  // Test: Should render resizable panel group
  it('should render resizable panel group', () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>
    )
    
    expect(screen.getByText('Panel 1')).toBeInTheDocument()
    expect(screen.getByText('Panel 2')).toBeInTheDocument()
  })
})

