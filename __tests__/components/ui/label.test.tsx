/**
 * Unit tests for Label component
 * Tests rendering, htmlFor attribute, and accessibility
 */

import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  // Test: Should render label element
  it('should render label element', () => {
    render(<Label>Label Text</Label>)
    
    const label = screen.getByText('Label Text')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('data-slot', 'label')
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Label className="custom-class">Test</Label>)
    
    const label = screen.getByText('Test')
    expect(label).toHaveClass('custom-class')
  })

  // Test: Should associate with input via htmlFor
  it('should associate with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>
    )
    
    const label = screen.getByText('Test Label')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  // Test: Should pass through additional props
  it('should pass through additional props', () => {
    render(<Label data-testid="custom-label" aria-label="Custom label">Test</Label>)
    
    const label = screen.getByTestId('custom-label')
    expect(label).toHaveAttribute('aria-label', 'Custom label')
  })
})

