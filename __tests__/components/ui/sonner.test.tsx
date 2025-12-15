/**
 * Unit tests for Sonner toast component
 * Tests basic rendering functionality
 */

import { render } from '@testing-library/react'
import { Toaster } from '@/components/ui/sonner'

describe('Sonner', () => {
  // Test: Should render toaster
  it('should render toaster', () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })
})

