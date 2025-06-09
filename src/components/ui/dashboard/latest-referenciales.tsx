"use client";

import React from 'react';
import Link from 'next/link';

interface Referencial {
  id?: string;
  fojas: string;
  numero: number | string;
  anio: number | string;
  cbr: string;
  createdAt?: Date;
  fechaescritura?: Date;
  user?: {
    name?: string;
  };
}

interface LatestReferencialesProps {
  referenciales?: Referencial[];
  data?: Referencial[]; // Soporte para 'data' también
  isLoading?: boolean;
}

export default function LatestReferenciales({ 
  referenciales = [], 
  data = [],
  isLoading = false 
}: LatestReferencialesProps) {
  // Combinamos referenciales y data para soportar ambas props
  const items = referenciales.length > 0 ? referenciales : data;

  if (isLoading) {
    return (
      <div className="w-full md:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Últimos agregados a la base de datos</div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Caso sin datos
  if (!items || items.length === 0) {
    return (
      <div className="w-full md:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Últimos agregados a la base de datos</div>
        </div>
        <div className="p-4">
          <p className="text-gray-500 italic">No hay registros disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="text-lg font-medium">Últimos agregados a la base de datos</div>
      </div>
      <div className="p-4 space-y-4 divide-y divide-gray-100">
        {items.map((ref, index) => (
          <div 
            key={ref.id || index} 
            className={`pt-4 pb-2 ${index === 0 ? 'pt-0 border-t-0' : ''}`}
          >
            <div className="space-y-2">
              {/* CBR en negrita en la parte superior */}
              <div className="font-bold text-primary">
                CBR: {ref.cbr}
              </div>
              
              {/* Datos básicos de la inscripción agrupados */}
              <div className="flex flex-wrap gap-x-4 text-sm">
                <div>
                  <span className="font-medium">Fojas:</span> {ref.fojas}
                </div>
                <div>
                  <span className="font-medium">Número:</span> {ref.numero}
                </div>
                <div>
                  <span className="font-medium">Año:</span> {ref.anio}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-6">
          <Link 
            href="/dashboard/referenciales" 
            className="text-sm text-primary hover:text-primary-dark hover:underline"
          >
            Ver todos los referenciales →
          </Link>
        </div>
      </div>
    </div>
  );
}