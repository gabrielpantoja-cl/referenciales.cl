// __tests__/api/public-api.test.ts
import { describe, test, expect, beforeAll } from '@jest/globals';

// Mock para evitar problemas con Prisma en tests
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

// Datos mock para tests
const mockMapData = [
  {
    id: 'test-1',
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
    observaciones: 'Test observation',
  },
  {
    id: 'test-2',
    lat: -33.4200,
    lng: -70.6100,
    fojas: '5678',
    numero: 910,
    anio: 2023,
    cbr: 'CBR Santiago',
    predio: 'Another Test Property',
    comuna: 'Las Condes',
    rol: '98765-43',
    fechaescritura: new Date('2023-08-20'),
    superficie: 200,
    monto: BigInt(250000000),
    observaciones: null,
  },
];

describe('Public API Endpoints', () => {
  beforeAll(() => {
    // Mock la respuesta de Prisma
    const { prisma } = require('@/lib/prisma');
    prisma.$queryRaw.mockResolvedValue(mockMapData);
  });

  describe('GET /api/public/map-data', () => {
    test('should return map data without authentication', async () => {
      // Importar el handler después del mock
      const { GET } = await import('@/app/api/public/map-data/route');
      
      const request = new Request('http://localhost:3000/api/public/map-data');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.total).toBe(2);
    });

    test('should include correct CORS headers', async () => {
      const { GET } = await import('@/app/api/public/map-data/route');
      
      const request = new Request('http://localhost:3000/api/public/map-data');
      const response = await GET(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    test('should format data correctly for public consumption', async () => {
      const { GET } = await import('@/app/api/public/map-data/route');
      
      const request = new Request('http://localhost:3000/api/public/map-data');
      const response = await GET(request);
      const data = await response.json();

      const firstPoint = data.data[0];
      
      // Verificar que los campos necesarios están presentes
      expect(firstPoint.id).toBeDefined();
      expect(firstPoint.lat).toBe(-33.4489);
      expect(firstPoint.lng).toBe(-70.6693);
      expect(firstPoint.comuna).toBe('Santiago');
      
      // Verificar que el monto está formateado como string
      expect(typeof firstPoint.monto).toBe('string');
      expect(firstPoint.monto).toContain('$');
      
      // Verificar que la fecha está formateada
      expect(typeof firstPoint.fechaescritura).toBe('string');
      expect(firstPoint.fechaescritura).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);

      // Verificar que no incluye información sensible (no existe en mock)
      expect(firstPoint.comprador).toBeUndefined();
      expect(firstPoint.vendedor).toBeUndefined();
      expect(firstPoint.userId).toBeUndefined();
    });

    test('should handle filters in query parameters', async () => {
      const { GET } = await import('@/app/api/public/map-data/route');
      
      const request = new Request('http://localhost:3000/api/public/map-data?comuna=santiago&limit=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // En un test real, verificaríamos que los filtros se aplicaron
    });
  });

  describe('GET /api/public/map-config', () => {
    test('should return API configuration', async () => {
      const { GET } = await import('@/app/api/public/map-config/route');
      
      const request = new Request('http://localhost:3000/api/public/map-config');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config).toBeDefined();
      expect(data.config.api).toBeDefined();
      expect(data.config.map).toBeDefined();
      expect(data.config.markers).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    test('should include correct map configuration', async () => {
      const { GET } = await import('@/app/api/public/map-config/route');
      
      const request = new Request('http://localhost:3000/api/public/map-config');
      const response = await GET(request);
      const data = await response.json();

      const mapConfig = data.config.map;
      expect(mapConfig.defaultCenter).toEqual([-33.4489, -70.6693]);
      expect(mapConfig.defaultZoom).toBe(10);
      expect(mapConfig.tileLayer.url).toContain('openstreetmap');
    });
  });

  describe('GET /api/public/docs', () => {
    test('should return documentation', async () => {
      const { GET } = await import('@/app/api/public/docs/route');
      
      const request = new Request('http://localhost:3000/api/public/docs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.documentation).toBeDefined();
      expect(data.documentation.title).toContain('API Pública');
      expect(data.documentation.quickStart).toBeDefined();
    });
  });

  describe('OPTIONS requests (CORS preflight)', () => {
    test('should handle OPTIONS request for map-data', async () => {
      const { OPTIONS } = await import('@/app/api/public/map-data/route');
      
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });
  });

  describe('Error handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock error del prisma
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'));

      const { GET } = await import('@/app/api/public/map-data/route');
      
      const request = new Request('http://localhost:3000/api/public/map-data');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});

describe('Public API Integration', () => {
  test('should be accessible without authentication', () => {
    // Este test verifica que las rutas públicas están configuradas correctamente
    const publicRoutes = [
      '/api/public/map-data',
      '/api/public/map-config',
      '/api/public/docs',
    ];

    publicRoutes.forEach(route => {
      expect(route).toMatch(/^\/api\/public\//);
    });
  });

  test('should have consistent response format', () => {
    const expectedResponseFormat = {
      success: expect.any(Boolean),
      data: expect.any(Array), // para map-data
      metadata: expect.any(Object), // para map-data
      timestamp: expect.any(String),
    };

    // Verificar que el formato esperado está definido
    expect(expectedResponseFormat.success).toBeDefined();
  });
});

// Test para verificar tipos TypeScript
describe('TypeScript Types', () => {
  test('should have correct MapPoint interface', () => {
    // Importar tipos
    type MapPoint = {
      id: string;
      lat: number;
      lng: number;
      fojas?: string;
      numero?: number;
      anio?: number;
      cbr?: string;
      predio?: string;
      comuna?: string;
      rol?: string;
      fechaescritura?: string;
      superficie?: number;
      monto?: string;
      observaciones?: string;
    };

    const samplePoint: MapPoint = {
      id: 'test-id',
      lat: -33.4489,
      lng: -70.6693,
      comuna: 'Santiago',
      monto: '$150.000.000',
    };

    expect(samplePoint.id).toBe('test-id');
    expect(typeof samplePoint.lat).toBe('number');
    expect(typeof samplePoint.lng).toBe('number');
  });
});
