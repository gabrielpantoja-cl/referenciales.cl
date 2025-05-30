// __tests__/__helpers__/database-helper.ts
import { PrismaClient } from '@prisma/client';

// Cliente Prisma específico para tests
let prismaForTests: PrismaClient;

export const setupTestDatabase = () => {
  if (!prismaForTests) {
    prismaForTests = new PrismaClient({
      datasources: {
        db: {
          url: process.env.POSTGRES_PRISMA_URL
        }
      }
    });
  }
  return prismaForTests;
};

export const cleanupTestDatabase = async () => {
  if (prismaForTests) {
    // Limpiar datos de prueba creados durante los tests
    await prismaForTests.referenciales.deleteMany({
      where: {
        OR: [
          { predio: { contains: 'TEST_' } },
          { vendedor: { contains: 'TEST_' } },
          { comprador: { contains: 'TEST_' } },
          { observaciones: { contains: 'GENERATED_BY_TEST' } }
        ]
      }
    });

    // Limpiar conservadores de prueba
    await prismaForTests.conservadores.deleteMany({
      where: {
        nombre: { contains: 'TEST_' }
      }
    });

    await prismaForTests.$disconnect();
  }
};

export const createTestUser = async () => {
  const testUser = await prismaForTests.user.upsert({
    where: { email: 'test-create-form@referenciales.test' },
    update: {},
    create: {
      email: 'test-create-form@referenciales.test',
      name: 'Test User Create Form',
      role: 'user'
    }
  });
  return testUser;
};

export const createTestReferencial = async (userId: string, overrides = {}) => {
  const defaultData = {
    userId,
    fojas: 'TEST_123',
    numero: 456,
    anio: 2023,
    cbr: 'TEST_Conservador Santiago',
    comuna: 'Santiago',
    fechaescritura: new Date('2023-06-15'),
    lat: -33.4489,
    lng: -70.6693,
    predio: 'TEST_Predio Ejemplo',
    vendedor: 'TEST_Juan Pérez',
    comprador: 'TEST_María González',
    superficie: 100.5,
    monto: 50000000,
    rol: 'TEST_12345-67',
    observaciones: 'GENERATED_BY_TEST - Datos de prueba',
    conservadorId: '', // Se establecerá después de crear el conservador
    ...overrides
  };

  // Crear conservador de prueba si no existe
  const conservador = await prismaForTests.conservadores.upsert({
    where: { id: 'test-conservador-id' },
    update: {},
    create: {
      id: 'test-conservador-id',
      nombre: defaultData.cbr,
      direccion: 'Dirección de prueba',
      comuna: defaultData.comuna,
      region: 'Región Metropolitana'
    }
  });

  defaultData.conservadorId = conservador.id;

  const referencial = await prismaForTests.referenciales.create({
    data: defaultData
  });

  return referencial;
};

export const findReferencialByTestData = async (testData: {
  predio: string;
  vendedor: string;
  comprador: string;
}) => {
  return await prismaForTests.referenciales.findFirst({
    where: {
      predio: testData.predio,
      vendedor: testData.vendedor,
      comprador: testData.comprador
    },
    include: {
      user: true,
      conservador: true
    }
  });
};

export { prismaForTests };
