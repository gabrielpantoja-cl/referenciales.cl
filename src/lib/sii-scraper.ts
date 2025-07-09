// Scraper directo del SII usando Playwright
// Implementación para extraer coordenadas desde el mapa oficial del SII

// Importación condicional para evitar errores en Vercel
let chromium: any = null;
let Browser: any = null;
let Page: any = null;

// Solo intentar importar playwright si no estamos en build de producción
if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    const playwright = require('playwright');
    chromium = playwright.chromium;
    Browser = playwright.Browser;
    Page = playwright.Page;
  } catch (error) {
    console.log('Playwright no disponible en este entorno');
  }
}

interface SIIScrapingResult {
  lat: number;
  lng: number;
  address?: string;
  surface?: number;
  avaluo?: number;
  success: boolean;
  error?: string;
}

export class SIIScraper {
  private browser: any = null;
  private page: any = null;

  async init(): Promise<void> {
    if (!chromium) {
      throw new Error('Playwright no está disponible en este entorno');
    }

    this.browser = await chromium.launch({
      headless: true, // Cambiar a false para debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Configurar headers para evitar detección
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    });
  }

  async scrapePropertyCoordinates(rol: string, comuna: string): Promise<SIIScrapingResult> {
    if (!this.page) {
      throw new Error('Scraper no inicializado. Llama a init() primero.');
    }

    try {
      // 1. Navegar al SII Mapas
      await this.page.goto('https://www4.sii.cl/mapasui/internet/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // 2. Esperar a que cargue la aplicación
      await this.page.waitForSelector('#searchForm', { timeout: 10000 });

      // 3. Seleccionar búsqueda por rol
      await this.page.selectOption('#searchType', 'rol');

      // 4. Ingresar comuna
      await this.page.fill('#comunaInput', comuna);
      await this.page.waitForTimeout(1000);

      // 5. Seleccionar comuna del dropdown
      await this.page.click(`text=${comuna}`);

      // 6. Ingresar rol de avalúo
      await this.page.fill('#rolInput', rol);

      // 7. Hacer click en buscar
      await this.page.click('#searchButton');

      // 8. Esperar resultados
      await this.page.waitForSelector('.property-result', { timeout: 15000 });

      // 9. Hacer click en el primer resultado
      await this.page.click('.property-result:first-child');

      // 10. Esperar a que se centre el mapa
      await this.page.waitForTimeout(3000);

      // 11. Extraer coordenadas del mapa
      const coordinates = await this.page.evaluate(() => {
        // Buscar en el objeto del mapa (puede variar según implementación)
        const mapElement = document.querySelector('#map');
        if (mapElement) {
          // Intentar extraer coordenadas del centro del mapa
          const centerLat = (window as any).map?.getCenter()?.lat;
          const centerLng = (window as any).map?.getCenter()?.lng;
          
          if (centerLat && centerLng) {
            return { lat: centerLat, lng: centerLng };
          }
        }

        // Método alternativo: buscar en elementos del DOM
        const coordsElement = document.querySelector('[data-coords]');
        if (coordsElement) {
          const coords = coordsElement.getAttribute('data-coords');
          if (coords) {
            const [lat, lng] = coords.split(',').map(Number);
            return { lat, lng };
          }
        }

        return null;
      });

      if (!coordinates) {
        return {
          lat: 0,
          lng: 0,
          success: false,
          error: 'No se pudieron extraer las coordenadas del mapa'
        };
      }

      // 12. Extraer información adicional
      const propertyInfo = await this.page.evaluate(() => {
        const addressElement = document.querySelector('.property-address');
        const surfaceElement = document.querySelector('.property-surface');
        const avaluoElement = document.querySelector('.property-avaluo');

        return {
          address: addressElement?.textContent?.trim() || undefined,
          surface: surfaceElement ? parseInt(surfaceElement.textContent || '0') : undefined,
          avaluo: avaluoElement ? parseInt(avaluoElement.textContent?.replace(/[^\d]/g, '') || '0') : undefined
        };
      });

      return {
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: propertyInfo.address,
        surface: propertyInfo.surface,
        avaluo: propertyInfo.avaluo,
        success: true
      };

    } catch (error) {
      console.error('Error en scraping del SII:', error);
      
      // Tomar screenshot para debugging
      if (this.page) {
        await this.page.screenshot({ 
          path: `./debug-sii-error-${Date.now()}.png`,
          fullPage: true 
        });
      }

      return {
        lat: 0,
        lng: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Función helper para usar en API routes
export async function scrapePropertyFromSII(rol: string, comuna: string): Promise<SIIScrapingResult> {
  if (!canScrape()) {
    return {
      lat: 0,
      lng: 0,
      success: false,
      error: 'Web scraping no disponible en este entorno'
    };
  }

  const scraper = new SIIScraper();
  
  try {
    await scraper.init();
    const result = await scraper.scrapePropertyCoordinates(rol, comuna);
    return result;
  } catch (error) {
    return {
      lat: 0,
      lng: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Error en scraping'
    };
  } finally {
    await scraper.close();
  }
}

// Función para validar que el scraping es posible
export function canScrape(): boolean {
  return chromium !== null && (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SII_SCRAPING === 'true');
}