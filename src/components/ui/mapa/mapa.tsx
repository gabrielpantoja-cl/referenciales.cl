'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import './mapa.css';
import { fetchReferencialesForMap } from '@/lib/mapData';
import { MapMarker, Point } from '@/components/ui/mapa/MapMarker';
import LocationButton from '@/components/ui/mapa/LocationButton';
import { Icon } from 'leaflet';

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

const Mapa = () => {
    const [filteredData, setFilteredData] = useState<Point[]>([]);

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
                setFilteredData(points);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);



    return (
        <div className="relative w-full">
            <MapContainer 
                center={[-33.4489, -70.6693]} 
                zoom={10} 
                style={{ 
                    height: "85vh",    
                    width: "100%",      
                    borderRadius: "8px" 
                }}
            >          
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
    );
};

export default Mapa;