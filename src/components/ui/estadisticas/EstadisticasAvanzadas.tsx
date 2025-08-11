'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../mapa/mapa.css';
import { fetchReferencialesForMap } from '@/lib/mapData';
import { MapMarker, Point } from '@/components/ui/mapa/MapMarker';
import LocationButton from '@/components/ui/mapa/LocationButton';
import AdvancedRealEstateCharts from '@/components/ui/mapa/AdvancedRealEstateCharts';
import { Icon, Map, LatLng } from 'leaflet';
import { EditControl } from 'react-leaflet-draw';

const redIcon = new Icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const SearchField = (): null => {
    const map = useMap();
    
    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'es',
                countrycodes: 'cl',
            },
            searchUrl: '/api/geocode', 
        });

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar',
            searchLabel: 'Buscar dirección...',
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: true,
            showPopup: false,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            maxMarkers: 1,
            marker: {
                icon: redIcon 
            }
        });

        map.addControl(searchControl);
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};

const EstadisticasAvanzadas = () => {
    const [allData, setAllData] = useState<Point[]>([]);
    const [filteredData, setFilteredData] = useState<Point[]>([]);
    const [chartData, setChartData] = useState<Point[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedArea, setSelectedArea] = useState<string>('');
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        fetchReferencialesForMap()
            .then(response => {
                const points = response
                    .filter(point => point?.geom && Array.isArray(point.geom) && point.geom.length === 2)
                    .map(point => ({
                        ...point,
                        id: point.id,
                        latLng: [point.geom[1], point.geom[0]] as [number, number],
                        anio: point.anio?.toString() || '',
                        lat: point.lat,
                        lng: point.lng,
                        geom: point.geom,
                        fechaescritura: point.fechaescritura, 
                        monto: point.monto
                    } as Point));
                setAllData(points);
                setFilteredData(points);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    const handleCreate = (e: any) => {
        const { layerType, layer } = e;
        if (layerType === 'circle') {
            const center = layer.getLatLng();
            const radius = layer.getRadius();
            
            const pointsInCircle = allData.filter(point => {
                const pointLatLng = new LatLng(point.latLng[0], point.latLng[1]);
                return center.distanceTo(pointLatLng) <= radius;
            });
            
            setChartData(pointsInCircle);
            setSelectedArea(`Radio: ${Math.round(radius)}m - ${pointsInCircle.length} propiedades`);
            setIsSelecting(false);
        }
    };

    const handleDrawStart = () => {
        setIsSelecting(true);
        setSelectedArea('Dibujando área de selección...');
    };

    const handleDrawStop = () => {
        setIsSelecting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mapa compacto a la izquierda/arriba */}
            <div className="lg:col-span-1 space-y-4">
                {/* Status Indicator */}
                {selectedArea && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isSelecting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                            <span className="text-blue-800 font-medium text-sm">{selectedArea}</span>
                        </div>
                    </div>
                )}
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mapa Interactivo</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Dibuja un círculo para seleccionar propiedades y generar estadísticas
                    </p>
                    
                    <MapContainer 
                        center={[-33.4489, -70.6693]} 
                        zoom={10} 
                        style={{ 
                            height: "400px",
                            width: "100%",
                            borderRadius: "6px" 
                        }}
                        ref={mapRef}
                    >          
                        <FeatureGroup>
                            <EditControl
                                position="topright"
                                onCreated={handleCreate}
                                onDrawStart={handleDrawStart}
                                onDrawStop={handleDrawStop}
                                draw={{
                                    rectangle: false,
                                    polygon: false,
                                    polyline: false,
                                    marker: false,
                                    circlemarker: false,
                                    circle: true,
                                }}
                                edit={{ remove: true }}
                            />
                        </FeatureGroup>
                        <SearchField />
                        <LocationButton />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            maxZoom={19}
                            minZoom={5}      
                            tileSize={256}
                            keepBuffer={2}
                            updateWhenZooming={false}
                            updateWhenIdle={true}
                        />  
                        {filteredData.map(point => (
                            <MapMarker key={point.id} point={point} />
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Panel de estadísticas expandido a la derecha */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Análisis de Mercado</h3>
                            <p className="text-gray-600">Reportes detallados en tiempo real</p>
                        </div>
                        {chartData.length > 0 && (
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{chartData.length}</div>
                                <div className="text-sm text-gray-500">propiedades analizadas</div>
                            </div>
                        )}
                    </div>
                    
                    {chartData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Selecciona un área en el mapa
                            </h4>
                            <p className="text-gray-600">
                                Usa la herramienta de círculo para seleccionar propiedades y ver estadísticas detalladas
                            </p>
                        </div>
                    ) : (
                        <AdvancedRealEstateCharts data={chartData} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EstadisticasAvanzadas;