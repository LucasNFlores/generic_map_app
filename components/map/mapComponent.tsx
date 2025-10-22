// src/components/map/MapComponent.tsx

'use client';

import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    // URL del estilo de mapa de MapTiler
    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    return (
        // MapProvider es opcional pero recomendado para hooks
        <Map
            mapLib={maplibregl} // <-- Le dice a react-map-gl que use MapLibre
            initialViewState={{
                longitude: -58.3816, // Coordenadas de Buenos Aires
                latitude: -34.6037,
                zoom: 12
            }}
            style={{ width: '100%', height: '100vh' }} // El mapa necesita un alto definido
            mapStyle={mapStyle}
        />
    );
} 