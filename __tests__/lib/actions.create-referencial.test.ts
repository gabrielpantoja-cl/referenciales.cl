// __tests__/lib/actions.create-referencial.test.ts
import { createReferencial } from '@/lib/actions';
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  createTestUser,
  prismaForTests 
} from '@/tests/__helpers__/database-helper';

// No mock de prisma - queremos probar la integración real
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('createReferencial Action Tests', () => {
  let testUser: any;
  let prisma: any;

  beforeAll(async () => {
    console.log('📦 Configurando tests de acciones...');
    prisma = setupTestDatabase();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  const createValidFormData = (suffix: string) => {
    const formData = new FormData();
    formData.set('userId', testUser.id);
    formData.set('fojas', `TEST_ACTION_${suffix}_456`);
    formData.set('numero', '789');
    formData.set('anno', '2023');
    formData.set('cbr', `TEST_ACTION_${suffix}_Conservador Concepción`);
    formData.set('comuna', 'Concepción');
    formData.set('fechaEscritura', '2023-07-20');
    formData.set('latitud', '-36.8270');
    formData.set('longitud', '-73.0444');
    formData.set('predio', `TEST_ACTION_${suffix}_Fundo El Roble`);
    formData.set('vendedor', `TEST_ACTION_${suffix}_Pedro Silva`);
    formData.set('comprador', `TEST_ACTION_${suffix}_Laura Martínez`);
    formData.set('superficie', '250.75');
    formData.set('monto', '120000000');
    formData.set('rolAvaluo', `TEST_ACTION_${suffix}_11111-22`);
    formData.set('observaciones', `GENERATED_BY_TEST_ACTION_${suffix} - Test de acciones`);
    return formData;
  };

  describe('createReferencial Function', () => {
    it('should create referencial with valid data', async () => {
      const formData = createValidFormData('VALID');
      
      const result = await createReferencial(formData);
      
      // Si no hay errores, la función redirige (lo cual lanza una excepción en el entorno de test)
      // Verificamos que no se devolvieron errores
      expect(result).toBeUndefined(); // La función redirige, no devuelve nada
      
      // Verificar que se creó en la base de datos
      const created = await prismaForTests.referenciales.findFirst({
        where: {
          predio: formData.get('predio') as string,
          userId: testUser.id
        },
        include: { conservador: true }
      });
      
      expect(created).not.toBeNull();
      expect(created?.fojas).toBe(formData.get('fojas'));
      expect(created?.conservador.nombre).toBe(formData.get('cbr'));
    }, 30000);

    it('should return validation errors for missing required fields', async () => {
      const formData = new FormData();
      formData.set('userId', testUser.id);
      // Omitir campos requeridos
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.errors).toBeDefined();
      expect(result?.message).toContain('Missing Fields');
      expect(Object.keys(result?.errors || {})).toHaveLength(expect.any(Number));
    });

    it('should return validation errors for invalid fojas format', async () => {
      const formData = createValidFormData('INVALID_FOJAS');
      formData.set('fojas', 'invalid-fojas-format');
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.errors?.fojas).toBeDefined();
      expect(result?.errors?.fojas).toContain(expect.stringMatching(/formato/i));
    });

    it('should return validation errors for invalid numeric fields', async () => {
      const formData = createValidFormData('INVALID_NUMBERS');
      formData.set('numero', 'not-a-number');
      formData.set('anno', 'not-a-year');
      formData.set('superficie', 'not-a-surface');
      formData.set('monto', 'not-an-amount');
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.errors).toBeDefined();
      expect(Object.keys(result?.errors || {})).toContain('numero');
    });

    it('should create conservador if it does not exist', async () => {
      const formData = createValidFormData('NEW_CONSERVADOR');
      const uniqueCbrName = `TEST_ACTION_UNIQUE_CBR_${Date.now()}`;
      formData.set('cbr', uniqueCbrName);
      
      // Verificar que no existe
      const existingConservador = await prismaForTests.conservadores.findFirst({
        where: { nombre: uniqueCbrName }
      });
      expect(existingConservador).toBeNull();
      
      await createReferencial(formData);
      
      // Verificar que se creó
      const newConservador = await prismaForTests.conservadores.findFirst({
        where: { nombre: uniqueCbrName }
      });
      expect(newConservador).not.toBeNull();
      expect(newConservador?.nombre).toBe(uniqueCbrName);
    }, 30000);

    it('should use existing conservador if it already exists', async () => {
      const existingCbrName = `TEST_ACTION_EXISTING_CBR_${Date.now()}`;
      
      // Crear conservador primero
      const existingConservador = await prismaForTests.conservadores.create({
        data: {
          nombre: existingCbrName,
          direccion: 'Dirección existente',
          comuna: 'Comuna existente',
          region: 'Región existente'
        }
      });
      
      const formData = createValidFormData('EXISTING_CONSERVADOR');
      formData.set('cbr', existingCbrName);
      
      await createReferencial(formData);
      
      // Verificar que se usó el conservador existente
      const referencial = await prismaForTests.referenciales.findFirst({
        where: {
          predio: formData.get('predio') as string,
          userId: testUser.id
        }
      });
      
      expect(referencial?.conservadorId).toBe(existingConservador.id);
      
      // Verificar que no se creó un conservador duplicado
      const conservadorCount = await prismaForTests.conservadores.count({
        where: { nombre: existingCbrName }
      });
      expect(conservadorCount).toBe(1);
    }, 30000);

    it('should handle missing userId', async () => {
      const formData = createValidFormData('NO_USER');
      formData.delete('userId'); // Remover userId
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.errors?.userId).toBeDefined();
    });

    it('should handle missing CBR name', async () => {
      const formData = createValidFormData('NO_CBR');
      formData.set('cbr', ''); // CBR vacío
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.errors?.cbr).toBeDefined();
      expect(result?.message).toContain('Conservador');
    });

    it('should handle database errors gracefully', async () => {
      const formData = createValidFormData('DB_ERROR');
      // Usar un userId que no existe para forzar un error de FK
      formData.set('userId', 'non-existent-user-id');
      
      const result = await createReferencial(formData);
      
      expect(result).toBeDefined();
      expect(result?.message).toContain('Database Error');
    });
  });

  describe('Data Type Conversions', () => {
    it('should properly convert numeric fields', async () => {
      const formData = createValidFormData('CONVERSION');
      
      await createReferencial(formData);
      
      const created = await prismaForTests.referenciales.findFirst({
        where: {
          predio: formData.get('predio') as string,
          userId: testUser.id
        }
      });
      
      expect(typeof created?.numero).toBe('number');
      expect(typeof created?.anio).toBe('number');
      expect(typeof created?.superficie).toBe('number');
      expect(typeof created?.lat).toBe('number');
      expect(typeof created?.lng).toBe('number');
      expect(typeof created?.monto).toBe('bigint');
    }, 30000);

    it('should properly convert date fields', async () => {
      const formData = createValidFormData('DATE_CONVERSION');
      const testDate = '2023-12-25';
      formData.set('fechaEscritura', testDate);
      
      await createReferencial(formData);
      
      const created = await prismaForTests.referenciales.findFirst({
        where: {
          predio: formData.get('predio') as string,
          userId: testUser.id
        }
      });
      
      expect(created?.fechaescritura).toBeInstanceOf(Date);
      expect(created?.fechaescritura.toISOString().split('T')[0]).toBe(testDate);
    }, 30000);
  });
});
