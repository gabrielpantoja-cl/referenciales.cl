'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AcmeLogo from '@/components/ui/common/AcmeLogo';
import Link from 'next/link';

// ✅ COMPONENTE LOADING SKELETON
function SignInSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Skeleton */}
        <div className="text-center">
          <div className="mx-auto h-20 w-48 flex items-center justify-center bg-gray-200 animate-pulse rounded-lg p-4">
          </div>
          <div className="mt-6 h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded mx-8"></div>
        </div>

        {/* Button Skeleton */}
        <div className="mt-8 space-y-6">
          <div className="h-12 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-16 bg-gray-50 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE INTERNO QUE USA useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ OBTENER PARÁMETROS DE URL DE FORMA SEGURA
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const urlError = searchParams.get('error');

  // ✅ MANEJO DE ERRORES DE URL
  useEffect(() => {
    if (urlError) {
      console.log('🔴 [SIGNIN] URL Error detected:', urlError);
      
      // Mapear errores comunes a mensajes más amigables
      const errorMessages: Record<string, string> = {
        'Callback': 'Error en el proceso de autenticación. Intenta nuevamente.',
        'OAuthCallback': 'Error de OAuth. Verifica tu cuenta de Google.',
        'AccessDenied': 'Acceso denegado. Verifica que tengas permisos.',
        'Configuration': 'Error de configuración. Contacta al administrador.',
        'Default': 'Error de autenticación. Intenta nuevamente.'
      };
      
      const friendlyMessage = errorMessages[urlError] || errorMessages['Default'];
      setError(friendlyMessage);
    }
  }, [urlError]);

  // ✅ VERIFICACIÓN DE SESIÓN EXISTENTE (Solo informativa)
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await getSession();
        if (session) {
          console.log('✅ [SIGNIN] Existing session found:', session.user?.email);
          // No redirigir automáticamente para evitar bucles
        }
      } catch (error) {
        console.log('ℹ️ [SIGNIN] No existing session found');
      }
    };

    checkExistingSession();
  }, []);

  const clearError = () => {
    setError(null);
    // Limpiar el error de la URL sin causar re-render innecesario
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    setError(null);
    
    try {
      console.log('🔐 [SIGNIN] Initiating Google Sign In...', {
        callbackUrl,
        timestamp: new Date().toISOString()
      });
      
      // ✅ CONFIGURACIÓN OPTIMIZADA PARA VERCEL
      const result = await signIn('google', {
        callbackUrl,
        redirect: true // Permitir redirección automática en producción
      });

      // Este código solo se ejecutará si redirect: false
      console.log('🔐 [SIGNIN] SignIn result:', result);

      if (result?.error) {
        console.error('❌ [SIGNIN] Error:', result.error);
        setError(`Error de autenticación: ${result.error}`);
        setIsSigningIn(false);
      } else if (result?.ok) {
        console.log('✅ [SIGNIN] Success, redirecting to:', callbackUrl);
        // No es necesario manejar redirección manual si redirect: true
      }
    } catch (error: any) {
      console.error('❌ [SIGNIN] Unexpected error:', error);
      setError(`Error inesperado: ${error.message || 'Error desconocido'}`);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y descripción del sitio */}
        <div className="text-center">
          <div className="mx-auto h-20 w-48 flex items-center justify-center bg-primary rounded-lg p-4">
            <div className="text-white">
              <AcmeLogo />
            </div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Referenciales.cl
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Plataforma colaborativa y open-source de datos inmobiliarios públicos de Chile
          </p>
        </div>

        {/* Qué es este sitio */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">¿Qué es Referenciales.cl?</p>
          <p className="text-blue-700">
            Base de datos de transacciones de suelo del Conservador de Bienes Raíces de Chile.
            Proyecto de código abierto sin fines de lucro para tasadores, corredores e investigadores.
          </p>
        </div>

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-sm text-red-600 hover:text-red-500 underline mt-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón OAuth */}
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Accede con tu cuenta de Google. Serás redirigido a{' '}
            <span className="font-medium text-gray-800">accounts.google.com</span>{' '}
            para autenticarte de forma segura.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className={`group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md
              ${isSigningIn
                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                : 'bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              } transition-colors duration-200 shadow-sm`}
            aria-describedby={error ? 'signin-error' : undefined}
          >
            {isSigningIn ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2" aria-hidden="true"></div>
                Redirigiendo a Google...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </div>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <Link href="/terms" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
              Términos de Servicio
            </Link>
            {' '}y{' '}
            <Link href="/privacy" className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
              Política de Privacidad
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-6 space-y-2">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
          >
            ← Volver al inicio
          </Link>
          <p className="text-xs text-gray-400">
            Proyecto open-source —{' '}
            <a
              href="https://github.com/gabrielpantoja-cl/referenciales.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Ver código fuente
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL CON SUSPENSE BOUNDARY
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}
