// __tests__/lib/validation.test.ts
import { validateReferencial, REQUIRED_FIELDS } from '@/lib/validation';

describe('validateReferencial Function Tests', () => {
  const createFormDataWithValues = (values: Record<string, string>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value);
    });
    return formData;
  };

  const validData = {
    userId: 'test-user-123',
    fojas: '123',
    numero: '456',
    anno: '2023',
    cbr: 'Conservador Santiago',
    comuna: 'Santiago',
    fechaEscritura: '2023-06-15',
    latitud: '-33.4489',
    longitud: '-70.6693',
    predio: 'Predio Los Álamos',
    vendedor: 'Carlos Mendoza',
    comprador: 'Ana Rivera',
    superficie: '120.5',
    monto: '75000000',
    rolAvaluo: '98765-43',
    observaciones: 'Observaciones de prueba'
  };

  describe('Basic Validation', () => {
    it('should return valid for complete valid data', () => {
      const formData = createFormDataWithValues(validData);
      const result = validateReferencial(formData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.message).toBeUndefined();
    });

    it('should require userId for authentication', () => {
      const formData = createFormDataWithValues({
        ...validData,
        userId: '' // Empty userId
      });

      const result = validateReferencial(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.userId).toContain('Se requiere un usuario autenticado para crear un referencial');
      expect(result.message).toBe('Se requiere autenticación');
    });

    it('should validate all required fields', () => {
      const formData = new FormData();
      formData.set('userId', 'test-user-123');
      // Omitir todos los campos requeridos

      const result = validateReferencial(formData);

      expect(result.isValid).toBe(false);
      
      // Verificar que todos los campos requeridos están en los errores
      REQUIRED_FIELDS.forEach(field => {
        expect(result.errors[field]).toBeDefined();
        expect(result.errors[field]).toContain(expect.stringContaining('obligatorio'));
      });

      expect(result.message).toContain('errores en el formulario');
    });

    it('should handle empty string values as missing', () => {
      const dataWithEmptyStrings = {
        ...validData,
        fojas: '',
        cbr: '   ', // Solo espacios
        predio: ''
      };

      const formData = createFormDataWithValues(dataWithEmptyStrings);
      const result = validateReferencial(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.fojas).toBeDefined();
      expect(result.errors.cbr).toBeDefined();
      expect(result.errors.predio).toBeDefined();
    });
  });

  describe('Fojas Validation', () => {
    it('should accept valid fojas formats', () => {
      const validFormats = ['123', '456v', '789V', '111 v', '222 V', '333vta', '444vuelta'];

      validFormats.forEach(fojas => {
        const formData = createFormDataWithValues({
          ...validData,
          fojas
        });

        const result = validateReferencial(formData);
        
        expect(result.errors.fojas).toBeUndefined();
      });
    });

    it('should reject invalid fojas formats', () => {
      const invalidFormats = ['abc', '123x', 'v123', '123 abc', '123-456'];

      invalidFormats.forEach(fojas => {
        const formData = createFormDataWithValues({
          ...validData,
          fojas
        });

        const result = validateReferencial(formData);
        
        expect(result.errors.fojas).toBeDefined();
        expect(result.errors.fojas).toContain(expect.stringContaining('formato'));
      });
    });
  });

  describe('Numeric Fields Validation', () => {
    it('should validate numero field', () => {
      const testCases = [
        { value: '123', shouldBeValid: true },
        { value: 'abc', shouldBeValid: false },
        { value: '123.45', shouldBeValid: true }, // Números decimales deberían ser válidos
        { value: '', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          numero: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.numero).toBeUndefined();
        } else {
          expect(result.errors.numero).toBeDefined();
        }
      });
    });

    it('should validate anno field', () => {
      const testCases = [
        { value: '2023', shouldBeValid: true },
        { value: 'abc', shouldBeValid: false },
        { value: '1999', shouldBeValid: true },
        { value: '', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          anno: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.anno).toBeUndefined();
        } else {
          expect(result.errors.anno).toBeDefined();
        }
      });
    });
  });

  describe('Geographic Coordinates Validation', () => {
    it('should validate latitude range', () => {
      const testCases = [
        { value: '-33.4489', shouldBeValid: true },
        { value: '0', shouldBeValid: true },
        { value: '90', shouldBeValid: true },
        { value: '-90', shouldBeValid: true },
        { value: '91', shouldBeValid: false }, // Fuera de rango
        { value: '-91', shouldBeValid: false }, // Fuera de rango
        { value: 'abc', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          latitud: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.latitud).toBeUndefined();
        } else {
          expect(result.errors.latitud).toBeDefined();
          if (value !== 'abc') {
            expect(result.errors.latitud).toContain(expect.stringContaining('-90 y 90'));
          }
        }
      });
    });

    it('should validate longitude range', () => {
      const testCases = [
        { value: '-70.6693', shouldBeValid: true },
        { value: '0', shouldBeValid: true },
        { value: '180', shouldBeValid: true },
        { value: '-180', shouldBeValid: true },
        { value: '181', shouldBeValid: false }, // Fuera de rango
        { value: '-181', shouldBeValid: false }, // Fuera de rango
        { value: 'abc', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          longitud: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.longitud).toBeUndefined();
        } else {
          expect(result.errors.longitud).toBeDefined();
          if (value !== 'abc') {
            expect(result.errors.longitud).toContain(expect.stringContaining('-180 y 180'));
          }
        }
      });
    });
  });

  describe('Superficie and Monto Validation', () => {
    it('should validate superficie positive values', () => {
      const testCases = [
        { value: '120.5', shouldBeValid: true },
        { value: '1', shouldBeValid: true },
        { value: '0', shouldBeValid: false }, // Debe ser mayor que cero
        { value: '-10', shouldBeValid: false }, // No puede ser negativo
        { value: 'abc', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          superficie: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.superficie).toBeUndefined();
        } else {
          expect(result.errors.superficie).toBeDefined();
        }
      });
    });

    it('should validate monto positive values', () => {
      const testCases = [
        { value: '75000000', shouldBeValid: true },
        { value: '1', shouldBeValid: true },
        { value: '0', shouldBeValid: false }, // Debe ser mayor que cero
        { value: '-1000', shouldBeValid: false }, // No puede ser negativo
        { value: 'abc', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          monto: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.monto).toBeUndefined();
        } else {
          expect(result.errors.monto).toBeDefined();
        }
      });
    });
  });

  describe('Date Validation', () => {
    it('should validate date format', () => {
      const testCases = [
        { value: '2023-06-15', shouldBeValid: true },
        { value: '2020-12-31', shouldBeValid: true },
        { value: 'invalid-date', shouldBeValid: false },
        { value: '2023/06/15', shouldBeValid: true }, // Formato alternativo que Date.parse puede manejar
        { value: '', shouldBeValid: false }
      ];

      testCases.forEach(({ value, shouldBeValid }) => {
        const formData = createFormDataWithValues({
          ...validData,
          fechaEscritura: value
        });

        const result = validateReferencial(formData);
        
        if (shouldBeValid) {
          expect(result.errors.fechaEscritura).toBeUndefined();
        } else {
          expect(result.errors.fechaEscritura).toBeDefined();
        }
      });
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const formData = createFormDataWithValues({
        ...validData,
        fechaEscritura: futureDateString
      });

      const result = validateReferencial(formData);
      
      expect(result.errors.fechaEscritura).toBeDefined();
      expect(result.errors.fechaEscritura).toContain(expect.stringContaining('futura'));
    });
  });

  describe('Text Fields Validation', () => {
    it('should validate text fields are not empty after trimming', () => {
      const textFields = ['cbr', 'comuna', 'predio', 'vendedor', 'comprador', 'rolAvaluo'];

      textFields.forEach(field => {
        const formData = createFormDataWithValues({
          ...validData,
          [field]: '   ' // Solo espacios
        });

        const result = validateReferencial(formData);
        
        expect(result.errors[field]).toBeDefined();
        expect(result.errors[field]).toContain(expect.stringContaining('vacío'));
      });
    });
  });

  describe('Error Messages', () => {
    it('should provide informative error messages', () => {
      const formData = createFormDataWithValues({
        userId: 'test-user',
        fojas: 'invalid',
        numero: 'not-a-number',
        latitud: '200', // Fuera de rango
        superficie: '-5' // Negativo
      });

      const result = validateReferencial(formData);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('errores en el formulario');
      
      // Verificar que los mensajes son informativos
      expect(result.errors.fojas?.[0]).toContain('formato');
      expect(result.errors.numero?.[0]).toContain('numérico');
      expect(result.errors.latitud?.[0]).toContain('entre -90 y 90');
      expect(result.errors.superficie?.[0]).toContain('mayor que cero');
    });

    it('should count errors correctly in message', () => {
      // Test con 1 error
      const oneErrorData = createFormDataWithValues({
        ...validData,
        fojas: ''
      });

      const oneErrorResult = validateReferencial(oneErrorData);
      expect(oneErrorResult.message).toContain('un error');

      // Test con múltiples errores
      const multipleErrorsData = createFormDataWithValues({
        ...validData,
        fojas: '',
        numero: '',
        cbr: ''
      });

      const multipleErrorsResult = validateReferencial(multipleErrorsData);
      expect(multipleErrorsResult.message).toContain('3 errores');
    });
  });

  describe('Optional Fields', () => {
    it('should handle optional observaciones field', () => {
      const formDataWithoutObservaciones = createFormDataWithValues({
        ...validData
      });
      formDataWithoutObservaciones.delete('observaciones'); // Remover el campo opcional

      const result = validateReferencial(formDataWithoutObservaciones);

      expect(result.isValid).toBe(true);
      expect(result.errors.observaciones).toBeUndefined();
    });

    it('should accept empty observaciones', () => {
      const formData = createFormDataWithValues({
        ...validData,
        observaciones: ''
      });

      const result = validateReferencial(formData);

      expect(result.isValid).toBe(true);
      expect(result.errors.observaciones).toBeUndefined();
    });
  });
});
