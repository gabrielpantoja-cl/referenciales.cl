"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AcmeLogo from '@/components/ui/common/AcmeLogo';
import { 
  PowerIcon, 
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useDeleteAccount } from '@/lib/hooks/useDeleteAccount';
import { Dialog } from '@/components/ui/dialog';
import { robustSignOut } from '@/lib/auth-utils';
import { useSession } from 'next-auth/react';

const navigationLinks = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  { name: 'Referenciales', href: '/dashboard/referenciales', icon: DocumentDuplicateIcon },
  { name: 'Mapa', href: '/dashboard/mapa', icon: MapPinIcon },
  { name: 'Estadísticas', href: '/dashboard/estadisticas', icon: ChartBarIcon, badge: 'BETA' },
  { name: 'Subir Datos', href: '/dashboard/referenciales/create', icon: ArrowUpTrayIcon },
  { name: 'Conservadores', href: '/dashboard/conservadores', icon: BuildingOfficeIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { 
    deleteAccount, 
    isDeleting, 
    showModal, 
    setShowModal, 
    handleConfirmDelete 
  } = useDeleteAccount();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    setIsUserMenuOpen(false);
    try {
      await robustSignOut({
        callbackUrl: '/',
        redirect: true,
        source: 'navbar'
      });
    } catch (error: any) {
      console.error('SignOut failed in navbar:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsUserMenuOpen(false);
    deleteAccount();
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-[60]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y navegación principal */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <div className="w-8 h-8 text-blue-600">
                    <AcmeLogo />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                    Referenciales.cl
                  </span>
                </Link>
              </div>

              {/* Enlaces de navegación - Desktop */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigationLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <LinkIcon className="w-5 h-5 mr-2" />
                      {link.name}
                      {link.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Menú de usuario - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {session?.user && (
                <div className="text-sm text-gray-600">
                  Hola, <span className="font-medium">{session.user.name}</span>
                </div>
              )}
              
              {/* Dropdown de usuario */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  aria-label="Menú de usuario"
                >
                  {session?.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Avatar" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8" />
                  )}
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[60]">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${
                        isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <PowerIcon className={`w-4 h-4 mr-3 ${isSigningOut ? 'animate-spin' : ''}`} />
                      {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
                    </button>
                    
                    <div className="border-t border-gray-100"></div>
                    
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className={`w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ExclamationTriangleIcon className={`w-4 h-4 mr-3 ${isDeleting ? 'animate-pulse' : ''}`} />
                      {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link 
                        href="/terms" 
                        className="block px-4 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Términos de Servicio
                      </Link>
                      <Link 
                        href="/privacy" 
                        className="block px-4 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Política de Privacidad
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de menú móvil */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                aria-label="Abrir menú"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <LinkIcon className="w-5 h-5 mr-3" />
                    <div className="flex items-center">
                      {link.name}
                      {link.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {link.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              
              {/* Acciones de usuario en móvil */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {session?.user && (
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Conectado como <span className="font-medium">{session.user.name}</span>
                  </div>
                )}
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 ${
                    isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PowerIcon className={`w-5 h-5 mr-3 ${isSigningOut ? 'animate-spin' : ''}`} />
                  {isSigningOut ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ExclamationTriangleIcon className={`w-5 h-5 mr-3 ${isDeleting ? 'animate-pulse' : ''}`} />
                  {isDeleting ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay para cerrar menús */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMobileMenuOpen(false);
              setIsUserMenuOpen(false);
            }
          }}
          aria-label="Cerrar menú"
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title="¿Estás seguro?"
        description='Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.'
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