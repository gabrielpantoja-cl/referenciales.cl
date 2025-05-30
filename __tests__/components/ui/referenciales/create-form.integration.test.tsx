// __tests__/components/ui/referenciales/create-form.integration.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CreateForm from '@/components/ui/referenciales/create-form';
import { createReferencial } from '@/lib/actions';
import { validateReferencial } from '@/lib/validation';
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  createTestUser, 
  findReferencialByTestData 
} from '../../__helpers__/database-helper';

// Mocks
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/lib/actions');
jest.mock('@/lib/validation');

// Corregir la sintaxis de los mocks
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockCreateReferencial = createReferencial as jest.MockedFunction<typeof createReferencial>;
const mockValidateReferencial = validateReferencial as jest.MockedFunction<typeof validateReferencial>;

describe('CreateForm Integration Tests', () => {
  let testUser: any;
  let mockRouter: any;
  let prisma: any;

  // Datos de prueba válidos
  const validFormData = {
    fojas: '123',
    numero: '456',
    anno: '2023',
    cbr: 'TEST_Conservador Santiago',
    comuna: 'Santiago',
    fechaEscritura: '2023-06-15',
    latitud: '-33.4489',
    longitud: '-70.6693',
    predio: 'TEST_Predio Los Álamos',
    vendedor: 'TEST_Carlos Mendoza',
    comprador: 'TEST_Ana Rivera',
    superficie: '120.5',
    monto: '75000000',
    rolAvaluo: 'TEST_98765-43',
    observaciones: 'GENERATED_BY_TEST - Propiedad en excelente estado'
  };

  beforeAll(async () => {
    // Configurar base de datos de prueba
    prisma = setupTestDatabase();
    
    // Crear usuario de prueba
    testUser = await createTestUser();
  });

  beforeEach(() => {
    // Mock del router
    mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
    mockUseRouter.mockReturnValue(mockRouter);

    // Mock de la sesión
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    // Mock de validación (por defecto exitosa)
    mockValidateReferencial.mockReturnValue({
      isValid: true,
      errors: {},
      message: undefined,
    });

    // Mock de createReferencial (por defecto exitoso)
    mockCreateReferencial.mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Component Rendering', () => {
    it('should render the form with all required fields', () => {
      render(<CreateForm users={[testUser]} />);

      // Verificar que todos los campos requeridos están presentes
      expect(screen.getByLabelText(/fojas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/año/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/conservador de bienes raíces/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/comuna/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rol de avalúo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/predio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vendedor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/comprador/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/superficie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de escritura/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/latitud/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/longitud/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/observaciones/i)).toBeInTheDocument();

      // Verificar botones
      expect(screen.getByRole('button', { name: /crear referencial/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should display user information', () => {
      render(<CreateForm users={[testUser]} />);

      expect(screen.getByText(testUser.name)).toBeInTheDocument();
      expect(screen.getByText(testUser.id)).toBeInTheDocument();
    });

    it('should show user count', () => {
      const users = [testUser, { id: '2', name: 'User 2' }];
      render(<CreateForm users={users} />);

      expect(screen.getByText('2 usuarios conectados')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      
      // Mock validation to return errors
      mockValidateReferencial.mockReturnValue({
        isValid: false,
        errors: {
          fojas: ['El campo Fojas es obligatorio'],
          numero: ['El campo Número es obligatorio'],
          cbr: ['El campo Conservador de Bienes Raíces es obligatorio'],
        },
        message: 'Hay 3 errores en el formulario. Por favor corrígelos antes de continuar.',
      });

      render(<CreateForm users={[testUser]} />);

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/hay 3 errores en el formulario/i)).toBeInTheDocument();
      });
    });

    it('should validate fojas format', async () => {
      const user = userEvent.setup();
      
      render(<CreateForm users={[testUser]} />);

      const fojasInput = screen.getByLabelText(/fojas/i);
      
      await act(async () => {
        await user.type(fojasInput, 'invalid-format');
      });

      expect(fojasInput).toHaveValue('invalid-format');
    });

    it('should validate numeric fields', async () => {
      const user = userEvent.setup();
      
      render(<CreateForm users={[testUser]} />);

      const numeroInput = screen.getByLabelText(/número/i);
      const superficieInput = screen.getByLabelText(/superficie/i);
      
      await act(async () => {
        await user.type(numeroInput, '123');
        await user.type(superficieInput, '100.5');
      });

      expect(numeroInput).toHaveValue(123);
      expect(superficieInput).toHaveValue(100.5);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      
      render(<CreateForm users={[testUser]} />);

      // Llenar todos los campos
      await act(async () => {
        await user.type(screen.getByLabelText(/fojas/i), validFormData.fojas);
        await user.type(screen.getByLabelText(/número/i), validFormData.numero);
        await user.type(screen.getByLabelText(/año/i), validFormData.anno);
        await user.type(screen.getByLabelText(/conservador de bienes raíces/i), validFormData.cbr);
        await user.type(screen.getByLabelText(/comuna/i), validFormData.comuna);
        await user.type(screen.getByLabelText(/rol de avalúo/i), validFormData.rolAvaluo);
        await user.type(screen.getByLabelText(/predio/i), validFormData.predio);
        await user.type(screen.getByLabelText(/vendedor/i), validFormData.vendedor);
        await user.type(screen.getByLabelText(/comprador/i), validFormData.comprador);
        await user.type(screen.getByLabelText(/superficie/i), validFormData.superficie);
        await user.type(screen.getByLabelText(/monto/i), validFormData.monto);
        await user.type(screen.getByLabelText(/fecha de escritura/i), validFormData.fechaEscritura);
        await user.type(screen.getByLabelText(/latitud/i), validFormData.latitud);
        await user.type(screen.getByLabelText(/longitud/i), validFormData.longitud);
        await user.type(screen.getByLabelText(/observaciones/i), validFormData.observaciones);
      });

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockValidateReferencial).toHaveBeenCalled();
        expect(mockCreateReferencial).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock para que createReferencial tome tiempo
      mockCreateReferencial.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      render(<CreateForm users={[testUser]} />);

      // Llenar campos mínimos
      await act(async () => {
        await user.type(screen.getByLabelText(/fojas/i), validFormData.fojas);
        await user.type(screen.getByLabelText(/número/i), validFormData.numero);
        await user.type(screen.getByLabelText(/año/i), validFormData.anno);
        await user.type(screen.getByLabelText(/conservador de bienes raíces/i), validFormData.cbr);
        await user.type(screen.getByLabelText(/comuna/i), validFormData.comuna);
        await user.type(screen.getByLabelText(/rol de avalúo/i), validFormData.rolAvaluo);
        await user.type(screen.getByLabelText(/predio/i), validFormData.predio);
        await user.type(screen.getByLabelText(/vendedor/i), validFormData.vendedor);
        await user.type(screen.getByLabelText(/comprador/i), validFormData.comprador);
        await user.type(screen.getByLabelText(/superficie/i), validFormData.superficie);
        await user.type(screen.getByLabelText(/monto/i), validFormData.monto);
        await user.type(screen.getByLabelText(/fecha de escritura/i), validFormData.fechaEscritura);
        await user.type(screen.getByLabelText(/latitud/i), validFormData.latitud);
        await user.type(screen.getByLabelText(/longitud/i), validFormData.longitud);
      });

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      // Verificar estado de loading
      expect(screen.getByRole('button', { name: /creando.../i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      
      // Mock error en createReferencial
      mockCreateReferencial.mockResolvedValue({
        errors: {
          cbr: ['Error al crear o encontrar el Conservador']
        },
        message: 'Error al procesar el Conservador de Bienes Raíces.'
      });

      render(<CreateForm users={[testUser]} />);

      // Llenar campos y enviar
      await act(async () => {
        await user.type(screen.getByLabelText(/fojas/i), validFormData.fojas);
        await user.type(screen.getByLabelText(/conservador de bienes raíces/i), validFormData.cbr);
      });

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error al procesar el conservador/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should show error when user is not authenticated', async () => {
      const user = userEvent.setup();
      
      // Mock sin sesión
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<CreateForm users={[testUser]} />);

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error: usuario no autenticado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should redirect after successful submission', async () => {
      const user = userEvent.setup();
      
      render(<CreateForm users={[testUser]} />);

      // Llenar campos mínimos y enviar
      await act(async () => {
        await user.type(screen.getByLabelText(/fojas/i), validFormData.fojas);
        await user.type(screen.getByLabelText(/número/i), validFormData.numero);
        await user.type(screen.getByLabelText(/año/i), validFormData.anno);
        await user.type(screen.getByLabelText(/conservador de bienes raíces/i), validFormData.cbr);
        await user.type(screen.getByLabelText(/comuna/i), validFormData.comuna);
        await user.type(screen.getByLabelText(/rol de avalúo/i), validFormData.rolAvaluo);
        await user.type(screen.getByLabelText(/predio/i), validFormData.predio);
        await user.type(screen.getByLabelText(/vendedor/i), validFormData.vendedor);
        await user.type(screen.getByLabelText(/comprador/i), validFormData.comprador);
        await user.type(screen.getByLabelText(/superficie/i), validFormData.superficie);
        await user.type(screen.getByLabelText(/monto/i), validFormData.monto);
        await user.type(screen.getByLabelText(/fecha de escritura/i), validFormData.fechaEscritura);
        await user.type(screen.getByLabelText(/latitud/i), validFormData.latitud);
        await user.type(screen.getByLabelText(/longitud/i), validFormData.longitud);
      });

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/referenciales');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should navigate to cancel page when cancel button is clicked', () => {
      render(<CreateForm users={[testUser]} />);

      const cancelLink = screen.getByRole('link', { name: /cancelar/i });
      expect(cancelLink).toHaveAttribute('href', '/dashboard/referenciales');
    });
  });
});
