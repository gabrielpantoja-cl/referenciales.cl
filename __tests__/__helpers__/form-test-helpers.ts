// __tests__/__helpers__/form-test-helpers.ts
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export interface FormTestData {
  fojas: string;
  numero: string;
  anno: string;
  cbr: string;
  comuna: string;
  fechaEscritura: string;
  latitud: string;
  longitud: string;
  predio: string;
  vendedor: string;
  comprador: string;
  superficie: string;
  monto: string;
  rolAvaluo: string;
  observaciones?: string;
}

export const validFormData: FormTestData = {
  fojas: '123',
  numero: '456',
  anno: '2023',
  cbr: 'TEST_Conservador Santiago',
  comuna: 'Santiago',
  fechaEscritura: '2023-06-15',
  latitud: '-33.4489',
  longitud: '-70.6693',
  predio: 'TEST_Predio Los Álamos',
  vendedor: 'TEST_Carlos Mendoza',
  comprador: 'TEST_Ana Rivera',
  superficie: '120.5',
  monto: '75000000',
  rolAvaluo: 'TEST_98765-43',
  observaciones: 'GENERATED_BY_TEST - Propiedad en excelente estado'
};

export const fillFormFields = async (formData: Partial<FormTestData> = {}) => {
  const user = userEvent.setup();
  const data = { ...validFormData, ...formData };

  if (data.fojas) {
    await user.type(screen.getByLabelText(/fojas/i), data.fojas);
  }
  if (data.numero) {
    await user.type(screen.getByLabelText(/número/i), data.numero);
  }
  if (data.anno) {
    await user.type(screen.getByLabelText(/año/i), data.anno);
  }
  if (data.cbr) {
    await user.type(screen.getByLabelText(/conservador.*bienes.*raíces/i), data.cbr);
  }
  if (data.comuna) {
    await user.type(screen.getByLabelText(/comuna/i), data.comuna);
  }
  if (data.rolAvaluo) {
    await user.type(screen.getByLabelText(/rol.*avalúo/i), data.rolAvaluo);
  }
  if (data.predio) {
    await user.type(screen.getByLabelText(/predio/i), data.predio);
  }
  if (data.vendedor) {
    await user.type(screen.getByLabelText(/vendedor/i), data.vendedor);
  }
  if (data.comprador) {
    await user.type(screen.getByLabelText(/comprador/i), data.comprador);
  }
  if (data.superficie) {
    await user.type(screen.getByLabelText(/superficie/i), data.superficie);
  }
  if (data.monto) {
    await user.type(screen.getByLabelText(/monto/i), data.monto);
  }
  if (data.fechaEscritura) {
    await user.type(screen.getByLabelText(/fecha.*escritura/i), data.fechaEscritura);
  }
  if (data.latitud) {
    await user.type(screen.getByLabelText(/latitud/i), data.latitud);
  }
  if (data.longitud) {
    await user.type(screen.getByLabelText(/longitud/i), data.longitud);
  }
  if (data.observaciones) {
    await user.type(screen.getByLabelText(/observaciones/i), data.observaciones);
  }

  return user;
};

export const getFormFields = () => ({
  fojas: screen.getByLabelText(/fojas/i),
  numero: screen.getByLabelText(/número/i),
  anno: screen.getByLabelText(/año/i),
  cbr: screen.getByLabelText(/conservador.*bienes.*raíces/i),
  comuna: screen.getByLabelText(/comuna/i),
  rolAvaluo: screen.getByLabelText(/rol.*avalúo/i),
  predio: screen.getByLabelText(/predio/i),
  vendedor: screen.getByLabelText(/vendedor/i),
  comprador: screen.getByLabelText(/comprador/i),
  superficie: screen.getByLabelText(/superficie/i),
  monto: screen.getByLabelText(/monto/i),
  fechaEscritura: screen.getByLabelText(/fecha.*escritura/i),
  latitud: screen.getByLabelText(/latitud/i),
  longitud: screen.getByLabelText(/longitud/i),
  observaciones: screen.getByLabelText(/observaciones/i),
  submitButton: screen.getByRole('button', { name: /crear referencial/i }),
  cancelLink: screen.getByRole('link', { name: /cancelar/i })
});

export const generateUniqueFormData = (testSuffix: string): FormTestData => ({
  fojas: `TEST_${testSuffix}_123`,
  numero: `${Date.now()}`.slice(-6), // Últimos 6 dígitos del timestamp
  anno: '2023',
  cbr: `TEST_${testSuffix}_Conservador Santiago`,
  comuna: 'Santiago',
  fechaEscritura: '2023-06-15',
  latitud: '-33.4489',
  longitud: '-70.6693',
  predio: `TEST_${testSuffix}_Predio Los Álamos`,
  vendedor: `TEST_${testSuffix}_Carlos Mendoza`,
  comprador: `TEST_${testSuffix}_Ana Rivera`,
  superficie: '120.5',
  monto: '75000000',
  rolAvaluo: `TEST_${testSuffix}_98765-43`,
  observaciones: `GENERATED_BY_TEST_${testSuffix} - Propiedad de prueba para integración`
});

export const createMockSession = (userId = 'test-user-id') => ({
  data: {
    user: {
      id: userId,
      name: 'Test User',
      email: 'test@example.com'
    }
  },
  status: 'authenticated' as const,
  update: jest.fn()
});

export const createMockRouter = () => ({
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn()
});

export const createMockValidationResult = (isValid = true, errors = {}) => ({
  isValid,
  errors,
  message: isValid ? null : 'Validation failed'
});

export const createMockActionResult = (success = true, errors = {}) => ({
  success,
  ...(success ? { message: 'Success' } : { errors, message: 'Error occurred' })
});
