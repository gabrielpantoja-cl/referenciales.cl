'use client';

import dynamic from 'next/dynamic';

const EstadisticasAvanzadas = dynamic(() => import('@/components/ui/estadisticas/EstadisticasAvanzadas'), {
    ssr: false,
    loading: () => <div>Cargando estadísticas avanzadas...</div>
});

const EstadisticasPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Estadísticas Avanzadas</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    BETA
                </span>
            </div>
            <p className="text-gray-600">
                Análisis en tiempo real de propiedades con mapa interactivo y reportes de tasación.
            </p>
            <EstadisticasAvanzadas />
        </div>
    );
};

export default EstadisticasPage;