import React from 'react';
import SideNav from '@/components/ui/dashboard/sidenav';
import SignOutTestComponent from '@/components/ui/common/SignOutTestComponent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50">
      {/* Navegación lateral */}
      <div className="w-full flex-none md:w-64 border-r border-gray-200 bg-white shadow-sm">
        <div className="sticky top-0 w-64 h-full">
          <SideNav />
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex-grow flex flex-col min-h-screen">
        {/* Área de contenido scrolleable */}
        <div className="flex-grow p-6 md:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Grid system para mejor organización */}
            <div className="grid gap-6">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Componente de test solo en desarrollo */}
      <SignOutTestComponent />
    </div>
  );
}