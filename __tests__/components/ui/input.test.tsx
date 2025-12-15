/**
 * Unit tests for Input component
 * Tests rendering, input types, event handling, and accessibility
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  // Test: Should render input element
  it('should render input element', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  // Test: Should render with different input types
  it('should render with different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const
    
    types.forEach((type) => {
      const { container, unmount } = render(<Input type={type} data-testid={`input-${type}`} />)
      const input = container.querySelector(`input[type="${type}"]`)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', type)
      unmount()
    })
  })

  // Test: Should handle value changes
  it('should handle value changes', async () => {
    const user = userEvent.setup()
    render(<Input />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'test input')
    
    expect(input.value).toBe('test input')
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  // Test: Should be disabled when disabled prop is true
  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled type="text" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  // Test: Should show placeholder text
  it('should show placeholder text', () => {
    render(<Input placeholder="Enter text here" />)
    
    const input = screen.getByPlaceholderText('Enter text here')
    expect(input).toBeInTheDocument()
  })

  // Test: Should handle onChange events
  it('should handle onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  // Test: Should pass through additional props
  it('should pass through additional props', () => {
    render(<Input data-testid="custom-input" aria-label="Custom input" />)
    
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('aria-label', 'Custom input')
  })
})

