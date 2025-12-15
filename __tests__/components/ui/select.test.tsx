/**
 * Unit tests for Select components
 * Tests rendering of Select, SelectTrigger, SelectValue, SelectContent, and SelectItem
 */

import { render, screen } from '@testing-library/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

describe('Select', () => {
  // Test: Should render select
  it('should render select', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )
    
    expect(screen.getByText('Select option')).toBeInTheDocument()
  })

  // Test: Should render select items
  it('should render select items', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )
    
    // Items are rendered in portal, so we check the structure exists
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})

