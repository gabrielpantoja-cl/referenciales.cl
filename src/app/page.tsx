// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import AcmeLogo from '@/components/ui/common/AcmeLogo';
import { lusitana } from '@/lib/styles/fonts';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-black border-l-transparent border-r-transparent" />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            Bienvenido a <strong>referenciales.cl</strong><br />
            Una base de datos para la tasación.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                He leído y acepto los <Link href="/terms" className="text-primary underline">Términos de Servicio</Link> y <Link href="/privacy" className="text-primary underline">Política de Privacidad</Link>
              </label>
            </div>
            <button
              onClick={session ? handleSignOut : handleAuth}
              className={`flex items-center gap-5 self-start rounded-lg px-6 py-3 text-sm font-medium transition-colors md:text-base ${
                !acceptedTerms && !session || isLoading 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
              disabled={!acceptedTerms && !session || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span>{session ? 'Cerrar sesión' : 'Iniciar sesión'}</span>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full">
            {/* Versión Desktop */}
            <div className="relative hidden md:block aspect-[1000/760]">
              <Image
                src="/images/hero-desktop.png"
                alt="Panel de control versión escritorio"
                fill
                quality={100}
                priority
                style={{ objectFit: 'contain' }}
                sizes="(min-width: 768px) 1000px, 100vw"
              />
            </div>
            {/* Versión Mobile */}
            <div className="relative block md:hidden aspect-[560/620]">
              <Image
                src="/images/hero-mobile.png"
                alt="Panel de control versión móvil"
                fill
                quality={100}
                priority
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 560px, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}