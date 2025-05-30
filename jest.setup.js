// jest.setup.js
require('@testing-library/jest-dom');
require('whatwg-fetch');
const { TextEncoder, TextDecoder } = require('util');

// Configuración global de fetch
global.fetch = fetch;

// Configuración de codificadores de texto
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configuración de mocks globales
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
    jest.clearAllMocks();
});

// Configurar timeouts globales
jest.setTimeout(30000);

// Silenciar advertencias de consola específicas
const originalError = console.error;
console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
        return;
    }
    originalError.call(console, ...args);
};

// Mock adicional para archivos no JS
jest.mock('\\.(css|less|scss|sass)$', () => ({}), { virtual: true });
