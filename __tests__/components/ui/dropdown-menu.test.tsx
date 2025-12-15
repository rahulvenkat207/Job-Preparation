/**
 * Unit tests for DropdownMenu components
 * Tests basic rendering of dropdown menu components
 */

import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

describe('DropdownMenu', () => {
  // Test: Should render dropdown menu
  it('should render dropdown menu', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    expect(screen.getByText('Open')).toBeInTheDocument()
  })
})

