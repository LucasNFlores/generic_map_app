// components/map/MapComponent.tsx

'use client';

import Map from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useCallback } from 'react';

export default function MapComponent() {
    // --- DEFINIR VARIABLES SIMPLES PRIMERO ---
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const viewState = useMapStore((state) => state.viewState);
    const setViewState = useMapStore((state) => state.setViewState);

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);
    // --- FIN DE LA ZONA DE HOOKS ---


    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    return (
        // Ajustamos el contenedor para que tenga una altura explícita.
        // Si tu layout tiene una barra de navegación de 4rem (h-16),
        // usamos calc(100vh - 4rem). Adapta el valor si tu nav tiene otra altura.
        <div id="mapContainer" className="px-5 rounded-s-3xl overflow-hidden h-[calc(100vh-4rem)]">
            <Map
                {...viewState}
                onMove={handleMove}
                // Aseguramos que el mapa ocupe todo el contenedor
                style={{ width: '100%', minWidth: "90vw", height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
            >
                {/* Aquí podrás agregar tus capas <Source> y <Layer> en el futuro */}
            </Map>
        </div>
    );
}