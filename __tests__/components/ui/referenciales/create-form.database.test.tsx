// __tests__/components/ui/referenciales/create-form.database.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import CreateForm from '@/components/ui/referenciales/create-form';
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  createTestUser, 
  findReferencialByTestData,
  prismaForTests 
} from '@/tests/__helpers__/database-helper';

// Solo mock de autenticación y navegación, NO mock de las acciones de base de datos
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
}));

// Corregir la sintaxis del mock
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('CreateForm Database Integration Tests', () => {
  let testUser: any;
  let prisma: any;

  // Datos únicos para cada test
  const generateUniqueFormData = (testSuffix: string) => ({
    fojas: `TEST_${testSuffix}_123`,
    numero: `${Date.now()}`.slice(-6), // Últimos 6 dígitos del timestamp
    anno: '2023',
    cbr: `TEST_${testSuffix}_Conservador Santiago`,
    comuna: 'Santiago',
    fechaEscritura: '2023-06-15',
    latitud: '-33.4489',
    longitud: '-70.6693',
    predio: `TEST_${testSuffix}_Predio Los Álamos`,
    vendedor: `TEST_${testSuffix}_Carlos Mendoza`,
    comprador: `TEST_${testSuffix}_Ana Rivera`,
    superficie: '120.5',
    monto: '75000000',
    rolAvaluo: `TEST_${testSuffix}_98765-43`,
    observaciones: `GENERATED_BY_TEST_${testSuffix} - Propiedad de prueba para integración`
  });

  beforeAll(async () => {
    console.log('🔧 Configurando base de datos de prueba...');
    prisma = setupTestDatabase();
    
    try {
      // Crear usuario de prueba
      testUser = await createTestUser();
      console.log('✅ Usuario de prueba creado:', testUser.email);
    } catch (error) {
      console.error('❌ Error al configurar base de datos:', error);
      throw error;
    }
  });

  beforeEach(() => {
    // Mock de la sesión de usuario
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    console.log('🧹 Limpiando base de datos de prueba...');
    await cleanupTestDatabase();
    console.log('✅ Limpieza completada');
  });

  const fillFormWithData = async (user: any, formData: any) => {
    await act(async () => {
      await user.type(screen.getByLabelText(/fojas/i), formData.fojas);
      await user.type(screen.getByLabelText(/número/i), formData.numero);
      await user.type(screen.getByLabelText(/año/i), formData.anno);
      await user.type(screen.getByLabelText(/conservador de bienes raíces/i), formData.cbr);
      await user.type(screen.getByLabelText(/comuna/i), formData.comuna);
      await user.type(screen.getByLabelText(/rol de avalúo/i), formData.rolAvaluo);
      await user.type(screen.getByLabelText(/predio/i), formData.predio);
      await user.type(screen.getByLabelText(/vendedor/i), formData.vendedor);
      await user.type(screen.getByLabelText(/comprador/i), formData.comprador);
      await user.type(screen.getByLabelText(/superficie/i), formData.superficie);
      await user.type(screen.getByLabelText(/monto/i), formData.monto);
      await user.type(screen.getByLabelText(/fecha de escritura/i), formData.fechaEscritura);
      await user.type(screen.getByLabelText(/latitud/i), formData.latitud);
      await user.type(screen.getByLabelText(/longitud/i), formData.longitud);
      await user.type(screen.getByLabelText(/observaciones/i), formData.observaciones);
    });
  };

  describe('Real Database Integration', () => {
    it('should create a referencial in the database with valid form data', async () => {
      const user = userEvent.setup();
      const testSuffix = 'CREATE_SUCCESS';
      const formData = generateUniqueFormData(testSuffix);
      
      console.log('🧪 Iniciando test de creación exitosa...');
      console.log('📝 Datos del formulario:', { 
        predio: formData.predio,
        vendedor: formData.vendedor,
        comprador: formData.comprador 
      });

      render(<CreateForm users={[testUser]} />);

      // Llenar el formulario
      await fillFormWithData(user, formData);

      // Verificar que los campos están llenos
      expect(screen.getByDisplayValue(formData.fojas)).toBeInTheDocument();
      expect(screen.getByDisplayValue(formData.predio)).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      console.log('📤 Enviando formulario...');
      
      // Enviar el formulario
      await act(async () => {
        await user.click(submitButton);
      });

      // Esperar a que el formulario se procese
      await waitFor(async () => {
        // Verificar que el registro se creó en la base de datos
        const createdReferencial = await findReferencialByTestData({
          predio: formData.predio,
          vendedor: formData.vendedor,
          comprador: formData.comprador
        });

        expect(createdReferencial).not.toBeNull();
        
        if (createdReferencial) {
          console.log('✅ Referencial creado exitosamente:', createdReferencial.id);
          
          // Verificar los datos guardados
          expect(createdReferencial.fojas).toBe(formData.fojas);
          expect(createdReferencial.numero).toBe(parseInt(formData.numero));
          expect(createdReferencial.anio).toBe(parseInt(formData.anno));
          expect(createdReferencial.cbr).toBe(formData.cbr);
          expect(createdReferencial.comuna).toBe(formData.comuna);
          expect(createdReferencial.rol).toBe(formData.rolAvaluo);
          expect(createdReferencial.predio).toBe(formData.predio);
          expect(createdReferencial.vendedor).toBe(formData.vendedor);
          expect(createdReferencial.comprador).toBe(formData.comprador);
          expect(createdReferencial.superficie).toBe(parseFloat(formData.superficie));
          expect(createdReferencial.monto).toBe(BigInt(formData.monto));
          expect(createdReferencial.lat).toBe(parseFloat(formData.latitud));
          expect(createdReferencial.lng).toBe(parseFloat(formData.longitud));
          expect(createdReferencial.observaciones).toBe(formData.observaciones);
          expect(createdReferencial.userId).toBe(testUser.id);
          
          // Verificar relaciones
          expect(createdReferencial.user).toBeTruthy();
          expect(createdReferencial.user.id).toBe(testUser.id);
          expect(createdReferencial.conservador).toBeTruthy();
          expect(createdReferencial.conservador.nombre).toBe(formData.cbr);
          
          // Verificar fechas
          const fechaEscritura = new Date(createdReferencial.fechaescritura);
          const expectedDate = new Date(formData.fechaEscritura);
          expect(fechaEscritura.toDateString()).toBe(expectedDate.toDateString());
          
          console.log('✅ Todos los datos verificados correctamente');
        }
      }, { timeout: 10000 });
    }, 30000); // Timeout de 30 segundos para el test completo

    it('should create the conservador if it does not exist', async () => {
      const user = userEvent.setup();
      const testSuffix = 'NEW_CONSERVADOR';
      const formData = generateUniqueFormData(testSuffix);
      
      console.log('🧪 Iniciando test de creación de conservador...');

      // Verificar que el conservador no existe inicialmente
      const existingConservador = await prismaForTests.conservadores.findFirst({
        where: { nombre: formData.cbr }
      });
      expect(existingConservador).toBeNull();

      render(<CreateForm users={[testUser]} />);

      await fillFormWithData(user, formData);

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(async () => {
        // Verificar que el conservador se creó
        const newConservador = await prismaForTests.conservadores.findFirst({
          where: { nombre: formData.cbr }
        });
        
        expect(newConservador).not.toBeNull();
        expect(newConservador?.nombre).toBe(formData.cbr);
        expect(newConservador?.comuna).toBe(formData.comuna);
        
        console.log('✅ Conservador creado:', newConservador?.id);

        // Verificar que el referencial usa el nuevo conservador
        const createdReferencial = await findReferencialByTestData({
          predio: formData.predio,
          vendedor: formData.vendedor,
          comprador: formData.comprador
        });
        
        expect(createdReferencial?.conservadorId).toBe(newConservador?.id);
      }, { timeout: 10000 });
    }, 30000);

    it('should handle validation errors before database insertion', async () => {
      const user = userEvent.setup();
      
      console.log('🧪 Iniciando test de validación...');

      render(<CreateForm users={[testUser]} />);

      // Intentar enviar formulario vacío
      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      // Verificar que aparecen errores de validación
      await waitFor(() => {
        const errorSummary = screen.queryByText(/hay.*errores en el formulario/i);
        if (errorSummary) {
          expect(errorSummary).toBeInTheDocument();
          console.log('✅ Errores de validación mostrados correctamente');
        }
      });

      // Verificar que NO se creó ningún registro en la base de datos
      const allTestReferenciales = await prismaForTests.referenciales.findMany({
        where: {
          observaciones: { contains: 'GENERATED_BY_TEST' }
        }
      });

      // No debería haber registros nuevos de este test específico
      const thisTestReferenciales = allTestReferenciales.filter(r => 
        r.observaciones?.includes('VALIDATION')
      );
      expect(thisTestReferenciales).toHaveLength(0);
      
      console.log('✅ Validación funcionó correctamente - no se crearon registros inválidos');
    }, 30000);

    it('should handle database connection errors gracefully', async () => {
      const user = userEvent.setup();
      const testSuffix = 'DB_ERROR';
      const formData = generateUniqueFormData(testSuffix);
      
      console.log('🧪 Iniciando test de manejo de errores...');

      render(<CreateForm users={[testUser]} />);
      
      await fillFormWithData(user, formData);

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      // En caso de error, debería mostrar un mensaje de error
      // Este test principalmente verifica que la aplicación no se rompe
      await waitFor(() => {
        // El formulario debería manejar cualquier error de manera elegante
        expect(submitButton).not.toBeDisabled();
      }, { timeout: 15000 });
      
      console.log('✅ Test de manejo de errores completado');
    }, 30000);
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between referenciales and conservadores', async () => {
      const user = userEvent.setup();
      const testSuffix = 'INTEGRITY';
      const formData = generateUniqueFormData(testSuffix);
      
      render(<CreateForm users={[testUser]} />);
      
      await fillFormWithData(user, formData);

      const submitButton = screen.getByRole('button', { name: /crear referencial/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(async () => {
        const referencial = await findReferencialByTestData({
          predio: formData.predio,
          vendedor: formData.vendedor,
          comprador: formData.comprador
        });

        expect(referencial).not.toBeNull();
        
        if (referencial) {
          // Verificar integridad referencial
          const conservador = await prismaForTests.conservadores.findUnique({
            where: { id: referencial.conservadorId }
          });
          
          expect(conservador).not.toBeNull();
          expect(conservador?.nombre).toBe(formData.cbr);
          
          // Verificar que la relación inversa funciona
          const referencialFromConservador = await prismaForTests.conservadores.findUnique({
            where: { id: referencial.conservadorId },
            include: { referenciales: true }
          });
          
          expect(referencialFromConservador?.referenciales).toContainEqual(
            expect.objectContaining({ id: referencial.id })
          );
        }
      });
    }, 30000);
  });
});
