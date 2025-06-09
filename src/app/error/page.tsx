'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AcmeLogo from '@/components/ui/common/AcmeLogo';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages = {
    Configuration: 'Error de configuración del servidor. Por favor, contacta al soporte.',
    AccessDenied: 'Acceso denegado. No tienes permisos para acceder a esta aplicación.',
    Verification: 'Error de verificación. El enlace puede haber expirado.',
    Default: 'Ha ocurrido un error durante la autenticación. Por favor, inténtalo de nuevo.'
  };

  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  // Log del error para debugging
  console.error('🚨 Auth Error:', { error, timestamp: new Date().toISOString() });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-20 w-48 flex items-center justify-center bg-red-600 rounded-lg p-4">
            <div className="text-white">
              <AcmeLogo />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-red-900">
            Error de Autenticación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {errorMessage}
          </p>
          {error && (
            <p className="mt-1 text-center text-xs text-red-500">
              Código de error: {error}
            </p>
          )}
        </div>

        {/* Información adicional basada en el tipo de error */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                ¿Qué puedes hacer?
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verifica que tu cuenta de Google sea válida</li>
                  <li>Intenta cerrar y abrir nuevamente el navegador</li>
                  <li>Si el problema persiste, contacta al soporte</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4">
          <Link
            href="/auth/signin"
            className="flex-1 text-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Intentar de Nuevo
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Ir al Inicio
          </Link>
        </div>

        {/* Información de contacto */}
        <div className="text-center border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="https://github.com/TheCuriousSloth/referenciales.cl/discussions" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-blue-600 hover:text-blue-500 underline">
              Contacta al soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}