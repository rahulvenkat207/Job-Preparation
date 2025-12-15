/**
 * Unit tests for ActionButton component
 * Tests action execution, loading states, confirmation dialog, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButton } from '@/components/ui/action-button'
import { toast } from 'sonner'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

describe('ActionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Should render button with children
  it('should render button with children', () => {
    const mockAction = jest.fn().mockResolvedValue({ error: false })
    
    render(<ActionButton action={mockAction}>Click me</ActionButton>)
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  // Test: Should execute action on click
  it('should execute action on click', async () => {
    const mockAction = jest.fn().mockResolvedValue({ error: false })
    const user = userEvent.setup()
    
    render(<ActionButton action={mockAction}>Click me</ActionButton>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledTimes(1)
    })
  })

  // Test: Should show error toast when action returns error
  it('should show error toast when action returns error', async () => {
    const mockAction = jest.fn().mockResolvedValue({ error: true, message: 'Error message' })
    const user = userEvent.setup()
    
    render(<ActionButton action={mockAction}>Click me</ActionButton>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error message')
    })
  })

  // Test: Should show confirmation dialog when requireAreYouSure is true
  it('should show confirmation dialog when requireAreYouSure is true', async () => {
    const mockAction = jest.fn().mockResolvedValue({ error: false })
    const user = userEvent.setup()
    
    render(
      <ActionButton action={mockAction} requireAreYouSure>
        Delete
      </ActionButton>
    )
    
    const button = screen.getByRole('button', { name: 'Delete' })
    await user.click(button)
    
    expect(await screen.findByText('Are you sure?')).toBeInTheDocument()
  })

  // Test: Should apply custom areYouSureDescription
  it('should apply custom areYouSureDescription', async () => {
    const mockAction = jest.fn().mockResolvedValue({ error: false })
    const user = userEvent.setup()
    
    render(
      <ActionButton
        action={mockAction}
        requireAreYouSure
        areYouSureDescription="Custom warning message"
      >
        Delete
      </ActionButton>
    )
    
    const button = screen.getByRole('button', { name: 'Delete' })
    await user.click(button)
    
    expect(await screen.findByText('Custom warning message')).toBeInTheDocument()
  })
})

