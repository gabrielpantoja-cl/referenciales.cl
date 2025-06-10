// app/page.tsx - VERSIÓN CORREGIDA SIN REDIRECTS AUTOMÁTICOS
"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import AcmeLogo from '../components/ui/common/AcmeLogo';
import OptimizedHeroImage from '../components/ui/common/OptimizedHeroImage';
import { lusitana } from '../lib/styles/fonts';
import Link from 'next/link';
import { fetchGithubStars } from '../lib/githubStars';

// Agregar icono de GitHub y contador de estrellas
const GITHUB_REPO_URL = 'https://github.com/TheCuriousSloth/referenciales.cl';
const GITHUB_STARS = 1; // Actualizar dinámicamente si se desea

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    fetchGithubStars('TheCuriousSloth/referenciales.cl').then(setGithubStars);
  }, []);

  // ✅ ELIMINADO: useEffect que causaba redirects automáticos
  // Ya no redirigimos automáticamente al dashboard, el usuario debe hacer clic

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

      // ✅ SIMPLIFICADO: Si hay URL, navegar allí
      if (result?.url) {
        window.location.href = result.url;
      } else {
        // Si no hay URL pero el signIn fue exitoso, ir al dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar navegación manual al dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
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
      {/* Header con Logo y GitHub */}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52 shadow-lg relative">
        <AcmeLogo />
        {/* GitHub badge en la esquina superior derecha */}
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 flex items-center gap-3 bg-white border-2 border-gray-300 rounded-full px-5 py-2 shadow-lg hover:bg-gray-100 transition-all z-20 min-w-[70px] min-h-[44px] text-base"
          title="Ver en GitHub"
        >
          {/* GitHub SVG grande */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" /></svg>
          <span className="text-gray-800 text-base font-semibold min-w-[32px] text-center">
            {githubStars !== null && githubStars >= 0 ? githubStars : <span className="animate-pulse">···</span>} <span className="ml-1">⭐</span>
          </span>
        </a>
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
          
          {/* ✅ NUEVO: Mostrar diferentes opciones según el estado de sesión */}
          <div className="flex flex-col gap-4">
            {session ? (
              // Usuario autenticado - mostrar opciones - MUY BUENA IDEA!!!
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ¡Hola, {session.user?.name}!
                  </p>
                  <p className="text-green-600 text-sm">
                    Ya tienes sesión iniciada.
                  </p>
                </div>
                
                <button
                  onClick={handleGoToDashboard}
                  className="flex items-center justify-center gap-3 self-start rounded-lg bg-primary hover:bg-primary/90 px-8 py-4 text-sm font-medium text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 md:text-base min-w-[200px]"
                >
                  <span>Ir al Dashboard</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-3 self-start rounded-lg bg-gray-600 hover:bg-gray-700 px-8 py-4 text-sm font-medium text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 md:text-base min-w-[200px]"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              // Usuario no autenticado - mostrar formulario de login
              <>
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
                  onClick={handleAuth}
                  className={`flex items-center justify-center gap-3 self-start rounded-lg px-8 py-4 text-sm font-medium transition-all duration-200 md:text-base min-w-[200px] ${
                    !acceptedTerms || isLoading 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600 shadow-none' 
                      : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                  disabled={!acceptedTerms || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Iniciar sesión con Google</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Panel de Imagen Optimizado */}
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full max-w-4xl">
            {/* Versión Desktop */}
            <div className="hidden md:block">
              <OptimizedHeroImage 
                isMobile={false}
                priority={true}
                className=""
              />
            </div>
            
            {/* Versión Mobile */}
            <div className="block md:hidden">
              <OptimizedHeroImage 
                isMobile={true}
                priority={true}
                className=""
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer con información adicional */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Base de datos colaborativa y open-source para tasaciones inmobiliarias en Chile
        </p>
      </div>

      {/* CSS adicional para el shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </main>
  );
}
