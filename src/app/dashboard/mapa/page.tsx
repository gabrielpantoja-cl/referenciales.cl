'use client';

import dynamic from 'next/dynamic';

const Mapa = dynamic(() => import('@/components/ui/mapa/mapa'), {
    ssr: false,
    loading: () => <div>Cargando mapa...</div>
});

const MapPage = () => {
    return (
        <div id="map-container">
            <Mapa />
        </div>
    );
};

export default MapPage;