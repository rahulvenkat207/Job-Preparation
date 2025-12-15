/**
 * Unit tests for Dialog components
 * Tests rendering of Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, and DialogDescription
 */

import { render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

describe('Dialog', () => {
  // Test: Should render dialog
  it('should render dialog', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    )
    
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  // Test: Should render dialog title
  it('should render dialog title', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  // Test: Should render dialog description
  it('should render dialog description', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>Test description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})

