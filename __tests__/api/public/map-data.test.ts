// __tests__/api/public/map-data.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/public/map-data/route';

// Mock Prisma
const mockPrisma = {
  $queryRaw: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/public/map-data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return map data successfully', async () => {
    // Mock successful database response
    const mockData = [
      {
        id: 'test-id-1',
        lat: -33.4489,
        lng: -70.6693,
        fojas: '1234',
        numero: 567,
        anio: 2024,
        cbr: 'CBR Santiago',
        predio: 'Test Property',
        comuna: 'Santiago',
        rol: '12345-67',
        fechaescritura: new Date('2024-03-15'),
        superficie: 150,
        monto: BigInt(180000000),
        observaciones: 'Test observations',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockData);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(200);
        
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data).toHaveLength(1);
        expect(json.metadata).toBeDefined();
        expect(json.metadata.total).toBe(1);
      },
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(500);
        
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error).toBeDefined();
      },
    });
  });

  it('should handle query parameters correctly', async () => {
    const mockData = [];
    mockPrisma.$queryRaw.mockResolvedValue(mockData);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          url: '?comuna=santiago&anio=2024&limit=50',
        });

        expect(res.status).toBe(200);
        
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
      },
    });
  });

  it('should include proper CORS headers', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
        expect(res.headers.get('Content-Type')).toBe('application/json');
      },
    });
  });

  it('should handle OPTIONS request (CORS preflight)', async () => {
    await testApiHandler({
      handler: { OPTIONS: handler.OPTIONS },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'OPTIONS',
        });

        expect(res.status).toBe(200);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      },
    });
  });

  it('should transform data correctly for public API', async () => {
    const mockData = [
      {
        id: 'test-id-1',
        lat: -33.4489,
        lng: -70.6693,
        fojas: '1234',
        numero: 567,
        anio: 2024,
        cbr: 'CBR Santiago',
        predio: 'Test Property',
        comuna: 'Santiago',
        rol: '12345-67',
        fechaescritura: new Date('2024-03-15'),
        superficie: 150.5,
        monto: BigInt(180000000),
        observaciones: 'Test observations',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockData);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        const json = await res.json();
        const point = json.data[0];

        // Verificar que los datos están correctamente transformados
        expect(typeof point.lat).toBe('number');
        expect(typeof point.lng).toBe('number');
        expect(typeof point.fechaescritura).toBe('string');
        expect(typeof point.monto).toBe('string');
        expect(point.monto).toContain('$'); // Debe estar formateado como moneda
        
        // Verificar que no incluye datos sensibles
        expect(point.userId).toBeUndefined();
        expect(point.comprador).toBeUndefined();
        expect(point.vendedor).toBeUndefined();
      },
    });
  });
});
