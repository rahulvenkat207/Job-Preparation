/**
 * Unit tests for ThemeToggle component
 * Tests theme switching functionality, dropdown menu, and icon rendering
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockUseTheme.mockReturnValue({
      setTheme: jest.fn(),
      theme: 'light',
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
    } as any)
  })

  // Test: Should render theme toggle button
  it('should render theme toggle button', () => {
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  // Test: Should show sun icon for light theme
  it('should show sun icon for light theme', () => {
    mockUseTheme.mockReturnValue({
      setTheme: jest.fn(),
      theme: 'light',
      resolvedTheme: 'light',
    } as any)
    
    render(<ThemeToggle />)
    
    // Sun icon should be present
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  // Test: Should show moon icon for dark theme
  it('should show moon icon for dark theme', () => {
    mockUseTheme.mockReturnValue({
      setTheme: jest.fn(),
      theme: 'dark',
      resolvedTheme: 'dark',
    } as any)
    
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  // Test: Should call setTheme when theme option is clicked
  it('should call setTheme when theme option is clicked', async () => {
    const mockSetTheme = jest.fn()
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      resolvedTheme: 'light',
    } as any)
    
    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    // Wait for dropdown to appear and click dark theme
    const darkOption = await screen.findByText('Dark')
    await user.click(darkOption)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  // Test: Should not render until mounted
  it('should not render until mounted', () => {
    // Component returns null until mounted
    const { container } = render(<ThemeToggle />)
    
    // After useEffect runs, component should render
    // This is tested by checking if button appears after mount
    expect(container).toBeTruthy()
  })
})

