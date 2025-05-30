"use client";

import { lusitana } from '@/lib/styles/fonts';
import { useState, useEffect } from 'react';
import { BuildingOfficeIcon, MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

// Tipo temporal para conservadores - esto debería ser importado de types cuando esté disponible
interface Conservador {
  id: string;
  nombre: string;
  comuna: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ConservadoresPage() {
  const [conservadores, setConservadores] = useState<Conservador[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConservadores = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/conservadores');
        
        if (!response.ok) {
          throw new Error('Error al cargar conservadores');
        }
        
        const data = await response.json();
        setConservadores(data);
      } catch (error) {
        console.error('Error fetching conservadores:', error);
        setError('Error al cargar los datos de conservadores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConservadores();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between mb-8">
          <h1 className={`${lusitana.className} text-2xl`}>Conservadores de Bienes Raíces</h1>
        </div>
        <div className="animate-pulse">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between mb-8">
          <h1 className={`${lusitana.className} text-2xl`}>Conservadores de Bienes Raíces</h1>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-8">
        <h1 className={`${lusitana.className} text-2xl`}>Conservadores de Bienes Raíces</h1>
      </div>

      <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
        <p className="text-sm">
          Directorio completo de Conservadores de Bienes Raíces en Chile. 
          Aquí encontrarás la información de contacto y ubicación de cada conservador.
        </p>
      </div>

      {conservadores.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conservadores disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Los datos de conservadores se están actualizando.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {conservadores.map((conservador) => (
            <div
              key={conservador.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {conservador.nombre}
                  </h3>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{conservador.comuna}</span>
                      {conservador.region && (
                        <span className="ml-1 text-gray-400">({conservador.region})</span>
                      )}
                    </div>
                    
                    {conservador.direccion && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{conservador.direccion}</span>
                      </div>
                    )}
                    
                    {conservador.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`mailto:${conservador.email}`}
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {conservador.email}
                        </a>
                      </div>
                    )}
                    
                    {conservador.telefono && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <a 
                          href={`tel:${conservador.telefono}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {conservador.telefono}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-500">
        Total de conservadores: {conservadores.length}
      </div>
    </div>
  );
}