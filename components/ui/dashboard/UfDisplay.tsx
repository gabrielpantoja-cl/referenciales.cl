'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';

interface UfData {
  valor: number;
  fecha: string;
}

export default function UfDisplay() {
  const [ufData, setUfData] = useState<UfData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUf = async () => {
      try {
        const response = await fetch('/api/uf', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener el valor de la UF');
        }
        
        const data = await response.json();
        setUfData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUf();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-400">Cargando Valor UF...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
          <p className="text-sm text-gray-400 mt-2">Actualizando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-600">Error: Valor UF</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-2">Intente recargar la página</p>
        </CardContent>
      </Card>
    );
  }

  if (!ufData) return null;

  const formattedDate = new Date(ufData.fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Valor UF</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">
          {formatCurrency(ufData.valor)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Fecha: {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}