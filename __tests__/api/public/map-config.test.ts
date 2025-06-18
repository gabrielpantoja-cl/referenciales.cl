// __tests__/api/public/map-config.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/public/map-config/route';

describe('/api/public/map-config', () => {
  it('should return map configuration successfully', async () => {
    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        expect(res.status).toBe(200);
        
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.config).toBeDefined();
        expect(json.timestamp).toBeDefined();
        
        // Verificar estructura de configuración
        expect(json.config.api).toBeDefined();
        expect(json.config.map).toBeDefined();
        expect(json.config.markers).toBeDefined();
        expect(json.config.filters).toBeDefined();
        
        // Verificar versión de API
        expect(json.config.api.version).toBe('1.0.0');
        expect(json.config.api.baseUrl).toBe('https://referenciales.cl/api/public');
        
        // Verificar configuración del mapa
        expect(json.config.map.defaultCenter).toEqual([-33.4489, -70.6693]);
        expect(json.config.map.defaultZoom).toBe(10);
      },
    });
  });

  it('should include proper CORS headers', async () => {
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

  it('should include usage examples and integration guide', async () => {
    await testApiHandler({
      handler: { GET: handler.GET },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });

        const json = await res.json();
        
        // Verificar que incluye información de uso
        expect(json.config.usage).toBeDefined();
        expect(json.config.usage.examples).toBeDefined();
        expect(json.config.usage.integration).toBeDefined();
        expect(json.config.dataSchema).toBeDefined();
      },
    });
  });
});
