/**
 * Unit tests for Form components
 * Tests rendering of Form, FormItem, FormLabel, FormControl, FormDescription, and FormMessage
 */

import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'

describe('Form', () => {
  // Test: Should render form with form item
  it('should render form with form item', () => {
    const TestComponent = () => {
      const form = useForm()
      return (
        <Form {...form}>
          <FormItem>
            <FormLabel>Test Label</FormLabel>
            <FormControl>
              <input />
            </FormControl>
            <FormDescription>Test description</FormDescription>
            <FormMessage />
          </FormItem>
        </Form>
      )
    }
    
    render(<TestComponent />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  // Test: Should render form field
  it('should render form field', () => {
    const TestComponent = () => {
      const form = useForm({ defaultValues: { test: '' } })
      return (
        <Form {...form}>
          <FormField
            name="test"
            control={form.control}
            render={({ field }) => <input {...field} />}
          />
        </Form>
      )
    }
    
    render(<TestComponent />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })
})

