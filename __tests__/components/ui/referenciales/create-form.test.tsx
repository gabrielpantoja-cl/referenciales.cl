import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SessionProvider } from 'next-auth/react'
import Form from '@/components/ui/referenciales/create-form'
import { useRouter } from 'next/navigation'

// Mock del router
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

// Mock de fetch - Corregida la sintaxis
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);
global.fetch = mockFetch;

describe('Form Component', () => {
  const mockUsers = [{ id: '1', name: 'Test User' }]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles form submission with valid data', async () => {
    const { container } = render(
      <SessionProvider session={null}>
        <Form users={mockUsers} />
      </SessionProvider>
    )

    // Llenar campos
    fireEvent.change(screen.getByLabelText('Fojas'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2024' } })
    fireEvent.change(screen.getByLabelText('CBR'), { target: { value: 'Test CBR' } })
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Test Comuna' } })

    // Submit form
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    
    await waitFor(() => {
      fireEvent.submit(form!)
    })

    // Verificar que se llamó a fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Verificar redirección
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })

    // Verificar refresh
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})