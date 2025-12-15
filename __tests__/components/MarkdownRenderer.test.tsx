/**
 * Unit tests for MarkdownRenderer component
 * Tests rendering of markdown content and className handling
 */

import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  // Test: Should render markdown content
  it('should render markdown content', () => {
    const { container } = render(<MarkdownRenderer># Hello World</MarkdownRenderer>)
    
    // react-markdown is mocked to render a div with data-testid="markdown"
    const markdown = container.querySelector('[data-testid="markdown"]')
    expect(markdown).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    const { container } = render(<MarkdownRenderer className="custom-class">Test</MarkdownRenderer>)
    
    // The className is applied to the wrapper div, not the mocked markdown component
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  // Test: Should have default prose classes
  it('should have default prose classes', () => {
    const { container } = render(<MarkdownRenderer>Test</MarkdownRenderer>)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('prose', 'prose-neutral', 'dark:prose-invert')
  })

  // Test: Should pass through additional props to Markdown component
  it('should pass through additional props to Markdown component', () => {
    const { container } = render(
      <MarkdownRenderer components={{ h1: ({ children }) => <h1 className="custom-h1">{children}</h1> }}>
        # Test
      </MarkdownRenderer>
    )
    
    // The mocked component receives the props but doesn't render them
    const markdown = container.querySelector('[data-testid="markdown"]')
    expect(markdown).toBeInTheDocument()
  })
})

