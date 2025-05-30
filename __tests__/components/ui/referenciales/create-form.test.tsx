import { render, fireEvent, waitFor, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SessionProvider } from 'next-auth/react'
import Form from '@/components/ui/referenciales/create-form'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  fillFormFields, 
  getFormFields,
  createMockSession,
  createMockRouter,
  createMockValidationResult,
  createMockActionResult,
  validFormData
} from '../__helpers__/form-test-helpers'

// Mock del router
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock de la sesión
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: jest.fn()
}))

// Mock de las acciones del servidor
jest.mock('@/lib/actions', () => ({
  createReferencial: jest.fn()
}))

// Mock de validación
jest.mock('@/lib/validation', () => ({
  validateReferencial: jest.fn()
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Form Component', () => {
  const mockUsers = [{ id: '1', name: 'Test User' }]
  const mockCreateReferencial = require('@/lib/actions').createReferencial
  const mockValidateReferencial = require('@/lib/validation').validateReferencial
  const mockRouter = createMockRouter()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Configurar el router mock
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      ...mockRouter
    })
    
    // Configurar la sesión mock
    mockUseSession.mockReturnValue(createMockSession())
    
    // Configurar validación exitosa por defecto
    mockValidateReferencial.mockReturnValue(createMockValidationResult())
    
    // Configurar acción exitosa por defecto
    mockCreateReferencial.mockResolvedValue(createMockActionResult())
  })

  it('handles form submission with valid data', async () => {
    render(<Form users={mockUsers} />)

    // Verificar que el formulario se renderiza
    expect(screen.getByText('Crear Nuevo Referencial')).toBeInTheDocument()

    // Llenar campos usando el helper
    await act(async () => {
      await fillFormFields()
    })

    // Submit form
    const { submitButton } = getFormFields()
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Verificar que se llamaron las funciones correctas
    await waitFor(() => {
      expect(mockValidateReferencial).toHaveBeenCalled()
      expect(mockCreateReferencial).toHaveBeenCalled()
    })

    // Verificar redirección
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/referenciales')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('displays validation errors when form is invalid', async () => {
    // Configurar validación con errores
    mockValidateReferencial.mockReturnValue(
      createMockValidationResult(false, {
        fojas: ['Las fojas son requeridas'],
        numero: ['El número es requerido']
      })
    )

    render(<Form users={mockUsers} />)

    // Submit form vacío
    const { submitButton } = getFormFields()
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Verificar que aparecen los errores
    await waitFor(() => {
      expect(screen.getByText(/hay.*errores en el formulario/i)).toBeInTheDocument()
      expect(screen.getByText('Las fojas son requeridas')).toBeInTheDocument()
      expect(screen.getByText('El número es requerido')).toBeInTheDocument()
    })

    // Verificar que NO se intentó crear el referencial
    expect(mockCreateReferencial).not.toHaveBeenCalled()
  })

  it('should render all form fields correctly', () => {
    render(<Form users={mockUsers} />)

    const fields = getFormFields()
    
    // Verificar que todos los campos están presentes
    expect(fields.fojas).toBeInTheDocument()
    expect(fields.numero).toBeInTheDocument()
    expect(fields.anno).toBeInTheDocument()
    expect(fields.cbr).toBeInTheDocument()
    expect(fields.comuna).toBeInTheDocument()
    expect(fields.rolAvaluo).toBeInTheDocument()
    expect(fields.predio).toBeInTheDocument()
    expect(fields.vendedor).toBeInTheDocument()
    expect(fields.comprador).toBeInTheDocument()
    expect(fields.superficie).toBeInTheDocument()
    expect(fields.monto).toBeInTheDocument()
    expect(fields.fechaEscritura).toBeInTheDocument()
    expect(fields.latitud).toBeInTheDocument()
    expect(fields.longitud).toBeInTheDocument()
    expect(fields.observaciones).toBeInTheDocument()
    expect(fields.submitButton).toBeInTheDocument()
    expect(fields.cancelLink).toBeInTheDocument()
  })

  it('should show loading state during form submission', async () => {
    // Mock para que createReferencial tome tiempo
    mockCreateReferencial.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(createMockActionResult()), 1000))
    )

    render(<Form users={mockUsers} />)

    // Llenar campos básicos
    await act(async () => {
      await fillFormFields({
        fojas: '123',
        numero: '456',
        anno: '2023',
        cbr: 'Test CBR',
        comuna: 'Test Comuna'
      })
    })

    const { submitButton } = getFormFields()
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Verificar estado de loading
    expect(screen.getByRole('button', { name: /creando.../i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should handle authentication errors', async () => {
    // Mock sin sesión
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn()
    })

    render(<Form users={mockUsers} />)

    const { submitButton } = getFormFields()
    
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/error: usuario no autenticado/i)).toBeInTheDocument()
    })

    expect(mockCreateReferencial).not.toHaveBeenCalled()
  })
})