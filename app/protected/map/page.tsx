// components/map/MapComponent.tsx

'use client';

import Map from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useCallback } from 'react';

export default function MapComponent() {
    // --- 1. DEFINIR VARIABLES SIMPLES PRIMERO ---
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- 2. LLAMAR A TODOS LOS HOOKS (SIEMPRE ARRIBA) ---
    const viewState = useMapStore((state) => state.viewState);
    const setViewState = useMapStore((state) => state.setViewState);

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);
    // --- FIN DE LA ZONA DE HOOKS ---


    // --- 3. AHORA SÍ PODEMOS TENER RETORNOS TEMPRANOS ---
    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    return (
        // <- hola mundo ->
        <Map
            {...viewState}
            onMove={handleMove}
            style={{ width: '100vw', height: '1000px' }}
            mapStyle={mapStyle}
        >
            {/* Aquí podrás agregar tus capas <Source> y <Layer> en el futuro */}
        </Map>
    );
}