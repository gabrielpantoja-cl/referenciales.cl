import React from 'react';
import Navbar from '@/components/ui/dashboard/navbar';
import SignOutTestComponent from '@/components/ui/common/SignOutTestComponent';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación superior */}
      <Navbar />

      {/* Contenedor principal - Ahora con ancho completo */}
      <main className="flex-1">
        {/* Área de contenido con máximo aprovechamiento del ancho */}
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-none">
            {/* Sin restricción de max-width para aprovechar pantalla completa */}
            {children}
          </div>
        </div>
      </main>
      
      {/* Componente de test solo en desarrollo */}
      <SignOutTestComponent />
    </div>
  );
}