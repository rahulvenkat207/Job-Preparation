/**
 * Unit tests for Textarea component
 * Tests rendering, value handling, event handling, and accessibility
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  // Test: Should render textarea element
  it('should render textarea element', () => {
    render(<Textarea />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('data-slot', 'textarea')
  })

  // Test: Should handle value changes
  it('should handle value changes', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'test textarea content')
    
    expect(textarea.value).toBe('test textarea content')
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Textarea className="custom-class" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })

  // Test: Should be disabled when disabled prop is true
  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  // Test: Should show placeholder text
  it('should show placeholder text', () => {
    render(<Textarea placeholder="Enter description here" />)
    
    const textarea = screen.getByPlaceholderText('Enter description here')
    expect(textarea).toBeInTheDocument()
  })

  // Test: Should handle onChange events
  it('should handle onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Textarea onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  // Test: Should accept rows and cols attributes
  it('should accept rows and cols attributes', () => {
    render(<Textarea rows={5} cols={40} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '40')
  })

  // Test: Should pass through additional props
  it('should pass through additional props', () => {
    render(<Textarea data-testid="custom-textarea" aria-label="Custom textarea" />)
    
    const textarea = screen.getByTestId('custom-textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Custom textarea')
  })
})

