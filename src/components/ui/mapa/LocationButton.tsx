// components/ui/mapa/LocationButton.tsx
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

const LocationButton = () => {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocationClick = () => {
        setLoading(true);

        // verificar si estamos en https
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
            alert('La geolocalización requiere una conexión segura (HTTPS)');
            setLoading(false);
            return;
        }

        // Verificar si la geolocalización está disponible
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 15, {
                    duration: 2
                });
                setLoading(false);
            },
            (error) => {
                setLoading(false);
                let errorMessage = 'No se pudo obtener tu ubicación';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso denegado para obtener ubicación';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Se agotó el tiempo de espera';
                        break;
                    default:
                        errorMessage = `Error desconocido: ${error.message}`;
                        break;
                }
                
                console.error('Error de geolocalización:', error.message);
                alert(errorMessage);
            },
            options
        );
    };

    return (
        <button 
            onClick={handleLocationClick}
            className="absolute z-[1000] bottom-8 right-8 bg-white bg-opacity-80 hover:bg-opacity-100 hover:bg-gray-200 text-black rounded-full p-2 shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            disabled={loading}
            title="Obtener mi ubicación"
        >
            {loading ? (
                <span className="animate-spin text-sm">⌛</span>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
                    <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" />
                    <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
            )}   
        </button>
    );
};

export default LocationButton;