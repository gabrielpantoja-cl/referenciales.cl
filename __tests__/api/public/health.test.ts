// __tests__/api/public/health.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/public/health/route';

// Mock Prisma
const mockPrisma = {
  $queryRaw: jest.fn(),
  referenciales: {
    count: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/public/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return healthy status when all services are up', async () => {
    // Mock successful database connection
    mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);
    mockPrisma.referenciales.count.mockResolvedValue(1500);
    mockPrisma.referenciales.findFirst.mockResolvedValue({
      updatedAt: new Date('2024-06-18T10:30:00Z'),
    });

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          url: '?stats=true',
        });

        expect(res.status).toBe(200);
        
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.health).toBeDefined();
        expect(json.health.status).toBe('healthy');
        expect(json.health.services.database.status).toBe('up');
        expect(json.health.services.api.status).toBe('up');
        expect(json.health.stats).toBeDefined();
        expect(json.health.stats.totalReferenciales).toBe(1500);
      },
    });
  });

  it('should return unhealthy status when database is down', async () => {
    // Mock database connection failure
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(503);
        
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.health.status).toBe('unhealthy');
        expect(json.health.services.database.status).toBe('down');
        expect(json.health.services.database.error).toBeDefined();
      },
    });
  });

  it('should return degraded status when database is slow', async () => {
    // Mock slow database response
    mockPrisma.$queryRaw.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve([{ test: 1 }]), 6000) // 6 segundos
      )
    );

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(200); // Degraded still returns 200
        
        const json = await res.json();
        expect(json.health.status).toBe('degraded');
        expect(json.health.services.database.status).toBe('up');
        expect(json.health.services.database.responseTime).toBeGreaterThan(5000);
      },
    }, { timeout: 10000 }); // Increase timeout for this test
  });

  it('should work without stats parameter', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(200);
        
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.health.stats).toBeUndefined(); // No stats requested
      },
    });
  });

  it('should include proper CORS headers', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);

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
      },
    });
  });

  it('should include environment and version information', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ test: 1 }]);

    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        const json = await res.json();
        
        expect(json.health.version).toBe('1.0.0');
        expect(json.health.environment).toBeDefined();
        expect(json.health.timestamp).toBeDefined();
      },
    });
  });
});
