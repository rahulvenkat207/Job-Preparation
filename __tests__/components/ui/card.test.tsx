/**
 * Unit tests for Card components
 * Tests rendering of Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, and CardAction
 */

import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'

describe('Card', () => {
  // Test: Should render card with children
  it('should render card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    
    const card = screen.getByText('Card content').closest('[data-slot="card"]')
    expect(card).toBeInTheDocument()
  })

  // Test: Should apply custom className
  it('should apply custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    
    const card = screen.getByText('Content').closest('[data-slot="card"]')
    expect(card).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  // Test: Should render card header
  it('should render card header', () => {
    render(<CardHeader>Header content</CardHeader>)
    
    const header = screen.getByText('Header content').closest('[data-slot="card-header"]')
    expect(header).toBeInTheDocument()
  })
})

describe('CardTitle', () => {
  // Test: Should render card title
  it('should render card title', () => {
    render(<CardTitle>Card Title</CardTitle>)
    
    const title = screen.getByText('Card Title').closest('[data-slot="card-title"]')
    expect(title).toBeInTheDocument()
  })
})

describe('CardDescription', () => {
  // Test: Should render card description
  it('should render card description', () => {
    render(<CardDescription>Card description text</CardDescription>)
    
    const description = screen.getByText('Card description text').closest('[data-slot="card-description"]')
    expect(description).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  // Test: Should render card content
  it('should render card content', () => {
    render(<CardContent>Card content text</CardContent>)
    
    const content = screen.getByText('Card content text').closest('[data-slot="card-content"]')
    expect(content).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  // Test: Should render card footer
  it('should render card footer', () => {
    render(<CardFooter>Footer content</CardFooter>)
    
    const footer = screen.getByText('Footer content').closest('[data-slot="card-footer"]')
    expect(footer).toBeInTheDocument()
  })
})

describe('CardAction', () => {
  // Test: Should render card action
  it('should render card action', () => {
    render(<CardAction>Action button</CardAction>)
    
    const action = screen.getByText('Action button').closest('[data-slot="card-action"]')
    expect(action).toBeInTheDocument()
  })
})

describe('Card Composition', () => {
  // Test: Should render complete card structure
  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Test Footer')).toBeInTheDocument()
  })
})

