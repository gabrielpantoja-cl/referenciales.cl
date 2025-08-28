// __tests__/referenciales/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import Page from '@/app/dashboard/referenciales/page';
import { fetchFilteredReferenciales, fetchReferencialesPages } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';

// ✅ MOCKS NECESARIOS
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  usePathname: jest.fn(() => '/dashboard/referenciales'),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock('@/lib/referenciales', () => ({
  fetchFilteredReferenciales: jest.fn(),
  fetchReferencialesPages: jest.fn(),
}));

jest.mock('@/lib/exportToXlsx', () => ({
  exportReferencialesToXlsx: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  default: {
    loading: jest.fn(() => 'toast-id'),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// ✅ DATOS DE PRUEBA
const mockReferenciales = [
  {
    id: '1',
    lat: -33.4569,
    lng: -70.6483,
    fojas: 'F123',
    numero: 456,
    anio: 2023,
    cbr: 'Santiago',
    comprador: 'Juan Pérez',
    vendedor: 'María García',
    predio: 'Casa en Las Condes',
    comuna: 'Las Condes',
    rol: '12345-6',
    fechaescritura: new Date('2023-06-15'),
    superficie: 120.5,
    monto: 150000000,
    observaciones: 'Propiedad en buen estado',
    userId: 'user-1',
    conservadorId: 'conservador-1',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
    User: { name: 'Test User', email: 'test@test.com' },
    conservadores: { id: 'conservador-1', nombre: 'CBR Santiago', comuna: 'Santiago' }
  }
];

// ✅ UTILITIES DE TESTING
const setupMocks = (overrides = {}) => {
  const defaults = {
    searchParams: new URLSearchParams(''),
    referenciales: mockReferenciales,
    pages: 1,
  };
  
  const config = { ...defaults, ...overrides };
  
  (useSearchParams as jest.Mock).mockReturnValue(config.searchParams);
  (fetchFilteredReferenciales as jest.Mock).mockResolvedValue(config.referenciales);
  (fetchReferencialesPages as jest.Mock).mockResolvedValue(config.pages);
};

describe('Referenciales Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // ✅ TESTS DE RENDERIZADO BÁSICO
  describe('Basic Rendering', () => {
    test('should render page title', async () => {
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('Referenciales de Compraventas')).toBeInTheDocument();
      });
    });

    test('should render search component', async () => {
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Buscar referencial...')).toBeInTheDocument();
      });
    });

    test('should render create button', async () => {
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  // ✅ TESTS DE CARGA DE DATOS
  describe('Data Loading', () => {
    test('should display loading skeleton initially', () => {
      render(<Page />);
      
      // Verificar que el skeleton se muestra mientras carga
      expect(screen.getByTestId('referenciales-skeleton')).toBeInTheDocument();
    });

    test('should load and display referenciales', async () => {
      render(<Page />);
      
      await waitFor(() => {
        expect(fetchFilteredReferenciales).toHaveBeenCalledWith('', 1);
        expect(fetchReferencialesPages).toHaveBeenCalledWith('');
      });
    });

    test('should handle search params correctly', async () => {
      const searchParams = new URLSearchParams('query=Santiago&page=2');
      setupMocks({ searchParams });
      
      render(<Page />);
      
      await waitFor(() => {
        expect(fetchFilteredReferenciales).toHaveBeenCalledWith('Santiago', 2);
        expect(fetchReferencialesPages).toHaveBeenCalledWith('Santiago');
      });
    });
  });

  // ✅ TESTS DE MANEJO DE ERRORES
  describe('Error Handling', () => {
    test('should display error message on network error', async () => {
      const networkError = new TypeError('fetch failed');
      setupMocks({ referenciales: Promise.reject(networkError) });
      
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText(/Problema de Conexión/)).toBeInTheDocument();
        expect(screen.getByText(/Error de conexión/)).toBeInTheDocument();
      });
    });

    test('should display retry button for retryable errors', async () => {
      const serverError = new Error('Server error');
      setupMocks({ referenciales: Promise.reject(serverError) });
      
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
      });
    });

    test('should retry request when retry button is clicked', async () => {
      const serverError = new Error('Server error');
      (fetchFilteredReferenciales as jest.Mock)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue(mockReferenciales);
      
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Reintentar'));
      
      await waitFor(() => {
        expect(fetchFilteredReferenciales).toHaveBeenCalledTimes(2);
      });
    });

    test('should not show retry button for non-retryable errors', async () => {
      const permissionError = new Error('permission denied');
      setupMocks({ referenciales: Promise.reject(permissionError) });
      
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText(/Sin Permisos/)).toBeInTheDocument();
        expect(screen.queryByText('Reintentar')).not.toBeInTheDocument();
      });
    });
  });

  // ✅ TESTS DE EXPORTACIÓN
  describe('Export Functionality', () => {
    test('should display export button with count', async () => {
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText(/Exportar XLSX \(1\)/)).toBeInTheDocument();
      });
    });

    test('should disable export button when no data', async () => {
      setupMocks({ referenciales: [] });
      
      render(<Page />);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Exportar XLSX/ });
        expect(exportButton).toBeDisabled();
      });
    });

    test('should export data when export button is clicked', async () => {
      const mockBuffer = new ArrayBuffer(8);
      (exportReferencialesToXlsx as jest.Mock).mockResolvedValue(mockBuffer);
      
      render(<Page />);
      
      await waitFor(() => {
        const exportButton = screen.getByText(/Exportar XLSX/);
        expect(exportButton).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(/Exportar XLSX/));
      
      await waitFor(() => {
        expect(exportReferencialesToXlsx).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ id: '1' })]),
          expect.any(Array)
        );
      });
    });

    test('should show loading state during export', async () => {
      const mockBuffer = new ArrayBuffer(8);
      (exportReferencialesToXlsx as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBuffer), 100))
      );
      
      render(<Page />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Exportar XLSX/));
      });
      
      expect(screen.getByText('Exportando...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Exportando...')).not.toBeInTheDocument();
      });
    });
  });

  // ✅ TESTS DE TRANSFORMACIÓN DE DATOS
  describe('Data Transformation', () => {
    test('should handle BigInt monto conversion safely', async () => {
      const bigIntReferencial = {
        ...mockReferenciales[0],
        monto: BigInt('999999999999999999') // Valor muy grande
      };
      
      setupMocks({ referenciales: [bigIntReferencial] });
      
      render(<Page />);
      
      await waitFor(() => {
        // Verificar que no hay errores de conversión
        expect(screen.getByText('Referenciales de Compraventas')).toBeInTheDocument();
      });
    });

    test('should handle null monto values', async () => {
      const nullMontoReferencial = {
        ...mockReferenciales[0],
        monto: null
      };
      
      setupMocks({ referenciales: [nullMontoReferencial] });
      
      render(<Page />);
      
      await waitFor(() => {
        expect(screen.getByText('Referenciales de Compraventas')).toBeInTheDocument();
      });
    });

    test('should filter invalid referenciales for export', async () => {
      const invalidReferencial = { id: '2' }; // Datos incompletos
      const mixedData = [...mockReferenciales, invalidReferencial];
      
      setupMocks({ referenciales: mixedData });
      
      render(<Page />);
      
      await waitFor(() => {
        // Debe mostrar solo 1 válido para exportar
        expect(screen.getByText(/Exportar XLSX \(1\)/)).toBeInTheDocument();
      });
    });
  });

  // ✅ TESTS DE PERFORMANCE
  describe('Performance', () => {
    test('should memoize search params calculation', async () => {
      const { rerender } = render(<Page />);
      
      // Re-render sin cambios en searchParams no debe disparar nueva consulta
      rerender(<Page />);
      
      await waitFor(() => {
        expect(fetchFilteredReferenciales).toHaveBeenCalledTimes(1);
      });
    });

    test('should memoize export data calculation', async () => {
      const mockBuffer = new ArrayBuffer(8);
      (exportReferencialesToXlsx as jest.Mock).mockResolvedValue(mockBuffer);
      
      render(<Page />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Exportar XLSX/));
      });
      
      // Segundo click no debe recalcular datos
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Exportar XLSX/));
      });
      
      expect(exportReferencialesToXlsx).toHaveBeenCalledTimes(2);
      
      // Verificar que los datos son los mismos
      const calls = (exportReferencialesToXlsx as jest.Mock).mock.calls;
      expect(calls[0][0]).toEqual(calls[1][0]);
    });
  });

  // ✅ TESTS DE ACCESIBILIDAD
  describe('Accessibility', () => {
    test('should have proper heading structure', async () => {
      render(<Page />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Referenciales de Compraventas');
      });
    });

    test('should have accessible error messages', async () => {
      const error = new Error('Test error');
      setupMocks({ referenciales: Promise.reject(error) });
      
      render(<Page />);
      
      await waitFor(() => {
        const errorRegion = screen.getByRole('region', { name: /error/i });
        expect(errorRegion).toBeInTheDocument();
      });
    });

    test('should have accessible loading states', () => {
      render(<Page />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

// ✅ TESTS DE UTILIDADES
describe('Utility Functions', () => {
  describe('safeBigIntToNumber', () => {
    // Estos tests estarían en un archivo separado para las utilidades
    test('should convert regular numbers correctly', () => {
      // Implementar tests para la función safeBigIntToNumber
    });

    test('should handle null values', () => {
      // Test para valores null
    });

    test('should handle very large BigInt values', () => {
      // Test para BigInt muy grandes
    });
  });

  describe('classifyError', () => {
    test('should classify network errors correctly', () => {
      // Test para clasificación de errores de red
    });

    test('should classify permission errors correctly', () => {
      // Test para errores de permisos
    });

    test('should classify validation errors correctly', () => {
      // Test para errores de validación
    });
  });
});

// ✅ TESTS DE INTEGRACIÓN
describe('Integration Tests', () => {
  test('should handle complete search flow', async () => {
    const searchParams = new URLSearchParams('query=Santiago');
    setupMocks({ searchParams });
    
    render(<Page />);
    
    await waitFor(() => {
      expect(fetchFilteredReferenciales).toHaveBeenCalledWith('Santiago', 1);
      expect(fetchReferencialesPages).toHaveBeenCalledWith('Santiago');
    });
  });

  test('should handle pagination with search', async () => {
    const searchParams = new URLSearchParams('query=Las Condes&page=3');
    setupMocks({ searchParams, pages: 5 });
    
    render(<Page />);
    
    await waitFor(() => {
      expect(fetchFilteredReferenciales).toHaveBeenCalledWith('Las Condes', 3);
      expect(fetchReferencialesPages).toHaveBeenCalledWith('Las Condes');
    });
  });

  test('should handle complete export flow with data transformation', async () => {
    const mockBuffer = new ArrayBuffer(8);
    (exportReferencialesToXlsx as jest.Mock).mockResolvedValue(mockBuffer);
    
    render(<Page />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText(/Exportar XLSX/));
    });
    
    await waitFor(() => {
      expect(exportReferencialesToXlsx).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            conservadorNombre: 'CBR Santiago',
            conservadorComuna: 'Santiago'
          })
        ]),
        expect.any(Array)
      );
    });
  });
});
