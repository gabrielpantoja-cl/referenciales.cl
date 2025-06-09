import animate from 'tailwindcss-animate';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Incluir todo el directorio src
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Compatibilidad con pages
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Compatibilidad legacy
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Compatibilidad legacy
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00204A',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#00204A',
        },
        'primary-foreground': '#ffffff',
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        background: '#ffffff',
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fef2f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out'
      },
      maxWidth: {
        'screen-2xl': '1536px',
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    }
  },
  plugins: [animate],
  // Configuración adicional para purgar estilos no utilizados
  safelist: [
    'text-xs',
    'text-sm', 
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'w-4',
    'w-5',
    'w-6',
    'w-8',
    'w-10',
    'w-12',
    'h-4',
    'h-5',
    'h-6',
    'h-8',
    'h-10',
    'h-12',
  ]
};

export default config;