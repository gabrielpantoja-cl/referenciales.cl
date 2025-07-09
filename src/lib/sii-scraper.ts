// Scraper directo del SII usando Playwright
// Implementación para extraer coordenadas desde el mapa oficial del SII

interface SIIScrapingResult {
  lat: number;
  lng: number;
  address?: string;
  surface?: number;
  avaluo?: number;
  success: boolean;
  error?: string;
}

// Función para cargar Playwright de forma dinámica y segura
function getPlaywrightChromium() {
  // Evitar la ejecución en entornos de solo cliente o durante la fase de compilación de Next.js
  if (typeof window !== 'undefined' || process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  // Permitir el scraping en desarrollo o si está explícitamente habilitado en producción
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SII_SCRAPING !== 'true') {
      console.log("Playwright scraping is disabled in production. Set ENABLE_SII_SCRAPING=true to enable it.");
      return null;
  }

  try {
    // Usar eval('require') para evitar que Webpack empaquete esta dependencia de desarrollo.
    const playwright = eval('require')('playwright');
    return playwright.chromium;
  } catch (error) {
    console.error('Error al importar Playwright (puede ser normal en entornos donde no está instalado):', error);
    return null;
  }
}

export class SIIScraper {
  private browser: any = null;
  private page: any = null;

  async init(): Promise<void> {
    const chromium = getPlaywrightChromium();
    if (!chromium) {
      throw new Error('Playwright no está disponible o no se pudo inicializar en este entorno.');
    }

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
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
      await this.page.goto('https://www4.sii.cl/mapasui/internet/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await this.page.waitForSelector('#searchForm', { timeout: 10000 });
      await this.page.selectOption('#searchType', 'rol');
      await this.page.fill('#comunaInput', comuna);
      await this.page.waitForTimeout(1000);
      await this.page.click(`text=${comuna}`);
      await this.page.fill('#rolInput', rol);
      await this.page.click('#searchButton');
      await this.page.waitForSelector('.property-result', { timeout: 15000 });
      await this.page.click('.property-result:first-child');
      await this.page.waitForTimeout(3000);

      const coordinates = await this.page.evaluate(() => {
        const mapElement = document.querySelector('#map');
        if (mapElement) {
          const centerLat = (window as any).map?.getCenter()?.lat;
          const centerLng = (window as any).map?.getCenter()?.lng;
          if (centerLat && centerLng) {
            return { lat: centerLat, lng: centerLng };
          }
        }
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

export function canScrape(): boolean {
  const chromium = getPlaywrightChromium();
  return chromium !== null;
}

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
