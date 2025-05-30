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

// Mock de next/navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            refresh: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            pathname: '/',
            route: '/',
            query: {},
            asPath: '/',
        };
    },
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock de revalidatePath y redirect de Next.js
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock adicional para next/navigation (consolidado)
jest.mock('next/navigation', () => ({
    ...jest.requireActual('next/navigation'),
    redirect: jest.fn(),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        pathname: '/',
        route: '/',
        query: {},
        asPath: '/',
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock de next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated',
    })),
    SessionProvider: ({ children }) => children,
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
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
