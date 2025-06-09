// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import AcmeLogo from '../components/ui/common/AcmeLogo';
import { lusitana } from '../lib/styles/fonts';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Manejar redirección y mensajes
  useEffect(() => {
    // Si hay sesión activa, redirigir al dashboard
    if (session) {
      router.push('/dashboard');
      return;
    }

    // Verificar mensaje de cierre de sesión
    const signOutMessage = localStorage.getItem('signOutMessage');
    if (signOutMessage) {
      toast.success(signOutMessage, { 
        duration: 5000,
        position: 'bottom-center'
      });
      localStorage.removeItem('signOutMessage');
      
      // Limpiar cookies y estado local
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
    }
  }, [session, router]);

  // Manejar autenticación
  const handleAuth = async () => {
    if (!acceptedTerms) return;
    
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });

      if (result?.error) {
        console.error('Error de autenticación:', result.error);
        toast.error('Error al iniciar sesión. Por favor, intente nuevamente.');
        return;
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  // Manejar errores de imagen
  const handleImageError = () => {
    setImageError(true);
  };

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6 bg-gray-50">
      {/* Header con Logo */}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52 shadow-lg">
        <AcmeLogo />
      </div>
      
      {/* Contenido Principal */}
      <div className="mt-6 flex grow flex-col gap-6 md:flex-row">
        {/* Panel de Información y Login */}
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white px-6 py-10 md:w-2/5 md:px-20 shadow-lg border border-gray-200">
          <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-primary border-l-transparent border-r-transparent" />
          
          <div className="space-y-4">
            <h1 className={`${lusitana.className} text-2xl text-gray-800 md:text-4xl md:leading-normal font-bold`}>
              Bienvenido a <span className="text-primary">referenciales.cl</span>
            </h1>
            <p className="text-lg text-gray-600 md:text-xl">
              Una base de datos colaborativa para la tasación inmobiliaria en Chile.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                He leído y acepto los{' '}
                <Link href="/terms" className="text-primary underline hover:text-primary/80 transition-colors">
                  Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link href="/privacy" className="text-primary underline hover:text-primary/80 transition-colors">
                  Política de Privacidad
                </Link>
              </label>
            </div>
            
            <button
              onClick={session ? handleSignOut : handleAuth}
              className={`flex items-center justify-center gap-3 self-start rounded-lg px-8 py-4 text-sm font-medium transition-all duration-200 md:text-base min-w-[200px] ${
                !acceptedTerms && !session || isLoading 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-600 shadow-none' 
                  : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
              disabled={!acceptedTerms && !session || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{session ? 'Cerrar sesión' : 'Iniciar sesión con Google'}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Panel de Imagen */}
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full max-w-4xl">
            {!imageError ? (
              <>
                {/* Versión Desktop */}
                <div className="relative hidden md:block aspect-[1000/760] rounded-lg overflow-hidden shadow-2xl border border-gray-200">
                  <Image
                    src="/images/hero-desktop.png"
                    alt="Panel de control versión escritorio - Dashboard de referenciales.cl"
                    fill
                    quality={85}
                    priority
                    style={{ objectFit: 'cover' }}
                    sizes="(min-width: 768px) 1000px, 100vw"
                    onError={handleImageError}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Versión Mobile */}
                <div className="relative block md:hidden aspect-[560/620] rounded-lg overflow-hidden shadow-2xl border border-gray-200">
                  <Image
                    src="/images/hero-mobile.png"
                    alt="Panel de control versión móvil - Dashboard de referenciales.cl"
                    fill
                    quality={85}
                    priority
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 560px, 100vw"
                    onError={handleImageError}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </>
            ) : (
              /* Fallback cuando las imágenes fallan */
              <div className="relative aspect-[1000/760] md:block hidden bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center shadow-lg">
                <div className="text-center p-8">
                  <div className="text-primary/60 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Vista Previa del Dashboard</h3>
                  <p className="text-gray-500">Sistema de tasaciones inmobiliarias</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer con información adicional */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Base de datos colaborativa y open-source para tasaciones inmobiliarias en Chile
        </p>
      </div>
    </main>
  );
}