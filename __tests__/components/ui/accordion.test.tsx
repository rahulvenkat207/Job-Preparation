/**
 * Unit tests for Accordion components
 * Tests rendering of Accordion, AccordionItem, AccordionTrigger, and AccordionContent
 */

import { render, screen } from '@testing-library/react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

describe('Accordion', () => {
  // Test: Should render accordion root
  it('should render accordion root', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const accordion = screen.getByText('Trigger').closest('[data-slot="accordion"]')
    expect(accordion).toBeInTheDocument()
  })
})

describe('AccordionItem', () => {
  // Test: Should render accordion item
  it('should render accordion item', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const item = screen.getByText('Trigger').closest('[data-slot="accordion-item"]')
    expect(item).toBeInTheDocument()
  })
})

describe('AccordionTrigger', () => {
  // Test: Should render accordion trigger
  it('should render accordion trigger', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger Text</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const trigger = screen.getByText('Trigger Text')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-slot', 'accordion-trigger')
  })
})

describe('AccordionContent', () => {
  // Test: Should render accordion content
  it('should render accordion content', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content Text</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    // Accordion content is hidden by default, but the element exists
    const content = container.querySelector('[data-slot="accordion-content"]')
    expect(content).toBeInTheDocument()
    // Content text might be hidden, so we check the structure
    expect(content).toHaveAttribute('data-slot', 'accordion-content')
  })
})

