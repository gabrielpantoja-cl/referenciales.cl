"use client";

import { useState } from 'react';
import Link from 'next/link';
import NavLinks from '@/components/ui/dashboard/nav-links';
import AcmeLogo from '@/components/ui/common/AcmeLogo';
import { PowerIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useDeleteAccount } from '@/lib/hooks/useDeleteAccount';
import { Dialog } from '@/components/ui/dialog';
import { robustSignOut } from '@/lib/auth-utils';

export default function SideNav() {
  const { 
    deleteAccount, 
    isDeleting, 
    showModal, 
    setShowModal, 
    handleConfirmDelete 
  } = useDeleteAccount();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await robustSignOut({
        callbackUrl: '/',
        redirect: true,
        source: 'desktop-sidenav'
      });
    } catch (error: any) {
      // El error ya está loggeado por robustSignOut
      console.error('SignOut failed in desktop sidenav:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // const handleOpenChatbot = () => {
  //   window.open('/chatbot', '_blank', 'width=800,height=600');
  // };

  return (
    <>
      <div className="flex h-full flex-col px-3 py-4 md:px-2">
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-primary p-4 md:h-40 group cursor-default">
          <div className="w-32 text-white md:w-40">
            <AcmeLogo />
          </div>
        </div>
        
        <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
          <NavLinks />
          <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
          
          {/* Botón de Ayuda - Chatbot (Comentado por decisión de no incluir IA por ahora) */}
          {/* 
          <button
            onClick={handleOpenChatbot}
            aria-label="Ayuda IA"
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <QuestionMarkCircleIcon className="w-6" />
            <div className="hidden md:block">Ayuda</div>
          </button>
          */}

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleSignOut}
            disabled={isDeleting || isSigningOut}
            aria-label={isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium 
              ${(isDeleting || isSigningOut) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-100 hover:text-blue-600'} 
              md:flex-none md:justify-start md:p-2 md:px-3`}
          >
            <PowerIcon className={`w-6 ${isSigningOut ? 'animate-spin' : ''}`} />
            <div className="hidden md:block">
              {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </div>
          </button>

          {/* Botón de Eliminar Cuenta */}
          <button
            onClick={deleteAccount}
            disabled={isDeleting}
            aria-label={isDeleting ? 'Eliminando cuenta...' : 'Eliminar cuenta'}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium 
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'} 
              md:flex-none md:justify-start md:p-2 md:px-3`}
          >
            <ExclamationTriangleIcon className={`w-6 ${isDeleting ? 'animate-pulse' : ''}`} />
            <div className="hidden md:block">
              {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
            </div>
          </button>
        </div>
        
        {/* Enlaces Legales */}
        <div className="hidden md:flex md:flex-col md:gap-1 md:px-2 md:py-2 md:border-t md:border-gray-200">
          <Link 
            href="/terms" 
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
          >
            Términos de Servicio
          </Link>
          <Link 
            href="/privacy" 
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
          >
            Política de Privacidad
          </Link>
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title="¿Estás seguro?"
        description="Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer."
        buttons={[
          {
            label: "Cancelar",
            onClick: () => setShowModal(false),
            variant: "secondary"
          },
          {
            label: isDeleting ? "Eliminando..." : "Eliminar Cuenta",
            onClick: handleConfirmDelete,
            variant: "danger"
          }
        ]}
      />
    </>
  );
}