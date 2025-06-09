// components/ui/dashboard/TopComunasChart.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos de ejemplo para mostrar cuando no hay datos reales
const fallbackData = [
  { comuna: 'Santiago', count: 20 },
  { comuna: 'Las Condes', count: 15 },
  { comuna: 'Providencia', count: 12 },
  { comuna: 'Vitacura', count: 8 }
];

interface CommuneData {
  comuna: string;
  count: number;
}

export default function TopComunasChart() {
  const [data, setData] = useState<CommuneData[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/topComunas');
        
        if (!response.ok) {
          throw new Error('Error al cargar datos de comunas');
        }
        
        const result = await response.json();
        
        if (Array.isArray(result) && result.length > 0) {
          setData(result);
        } else {
          // Si no hay datos, usar datos de ejemplo
          console.log('No se encontraron datos de comunas, usando datos de ejemplo');
          setData(fallbackData);
        }
      } catch (err) {
        console.error('Error al cargar datos de comunas:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // En caso de error, mostrar datos de ejemplo
        setData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    }
    
    getData();
  }, []);

  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Top Comunas con más Referenciales</h2>
      </div>
      <div className="p-4 flex grow flex-col justify-between">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center bg-red-50 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="comuna" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#00204A" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}