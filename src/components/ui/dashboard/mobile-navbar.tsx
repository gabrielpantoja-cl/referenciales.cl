"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowUpTrayIcon,
  PowerIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AcmeLogo from '@/components/ui/common/AcmeLogo';
import { useDeleteAccount } from '@/lib/hooks/useDeleteAccount';
import { Dialog } from '@/components/ui/dialog';
import { robustSignOut } from '@/lib/auth-utils';

const links = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  { name: 'Referenciales', href: '/dashboard/referenciales', icon: DocumentDuplicateIcon },
  { name: 'Mapa', href: '/dashboard/mapa', icon: MapPinIcon },
  { name: 'Subir Referenciales', href: '/dashboard/referenciales/create', icon: ArrowUpTrayIcon },
  { name: 'Conservadores', href: '/dashboard/conservadores', icon: BuildingOfficeIcon },
];

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
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
        source: 'mobile-navbar'
      });
    } catch (error: any) {
      // El error ya está loggeado por robustSignOut
      console.error('SignOut failed in mobile navbar:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleOpenChatbot = () => {
    window.open('/chatbot', '_blank', 'width=800,height=600');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md">
        {/* Aumentado el padding horizontal y añadido espacio más generoso */}
        <div className="flex items-center justify-between px-4 md:px-6 py-2 h-16">
          {/* Ajustado el contenedor del logo */}
          <div className="flex-1 flex justify-start ml-2">
            {/* Contenedor con anchura y ajustes específicos para el logo */}
            <div className="w-40 flex items-center">
              <AcmeLogo />
            </div>
          </div>
          
          {/* Botón de menú con padding mejorado */}
          <button 
            onClick={toggleMenu}
            className="p-2 ml-3 rounded-md text-white hover:bg-primary-dark focus:outline-none"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Navegación móvil - desplegable */}
      <div 
        className={`
          fixed top-16 left-0 right-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-y-0' : '-translate-y-full'}
        `}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center space-x-3 p-3 rounded-md text-sm font-medium
                  ${pathname === link.href 
                    ? 'bg-sky-100 text-blue-600' 
                    : 'bg-gray-50 hover:bg-sky-100 hover:text-blue-600'}
                `}
              >
                <LinkIcon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          {/* Botón de Ayuda */}
          <button
            onClick={() => {
              handleOpenChatbot();
              setMenuOpen(false);
            }}
            className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-600"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
            <span>Ayuda</span>
          </button>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={() => {
              handleSignOut();
              setMenuOpen(false);
            }}
            disabled={isDeleting || isSigningOut}
            className={`
              flex items-center space-x-3 p-3 rounded-md bg-gray-50 text-sm font-medium
              ${(isDeleting || isSigningOut) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-100 hover:text-blue-600'}
            `}
          >
            <PowerIcon className={`w-5 h-5 ${isSigningOut ? 'animate-spin' : ''}`} />
            <span>{isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
          </button>

          {/* Botón de Eliminar Cuenta */}
          <button
            onClick={() => {
              deleteAccount();
              setMenuOpen(false);
            }}
            disabled={isDeleting}
            className={`
              flex items-center space-x-3 p-3 rounded-md bg-red-50 text-sm font-medium
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-600'}
            `}
          >
            <ExclamationTriangleIcon className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
            <span>{isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}</span>
          </button>
        </nav>
      </div>

      {/* Overlay para cerrar el menú al tocar fuera - Ahora con accesibilidad */}
      {menuOpen && (
        <button 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 cursor-default"
          onClick={handleCloseMenu}
          onKeyDown={handleKeyDown}
          aria-label="Cerrar menú"
          tabIndex={0}
        />
      )}

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