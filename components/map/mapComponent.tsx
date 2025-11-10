'use client';

// 1. Importaciones reducidas
import * as React from 'react';
import Map, {
    type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useCallback } from 'react';
import type { MapStore } from '@/stores/map-store';

// 2. Importamos los nuevos componentes especializados
import { SavedShapesLayer } from './layers/SavedShapesLayer';
import { PendingDrawLayer } from './layers/PendingDrawLayer';
import { MapUI } from './ui/MapUI';

// --- COMPONENTE PRINCIPAL ---

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- HOOKS DE ZUSTAND (Solo los necesarios para el mapa base) ---
    const viewState = useMapStore((state: MapStore) => state.viewState);
    const setViewState = useMapStore((state: MapStore) => state.setViewState);
    const mode = useMapStore((state: MapStore) => state.mode);
    const setPendingPoints = useMapStore((state: MapStore) => state.setPendingPoints);
    const addPendingPoint = useMapStore((state: MapStore) => state.addPendingPoint);

    // --- Traemos las shapes y la acción de seleccionar ---
    const shapes = useMapStore((state: MapStore) => state.shapes);
    const setSelectedShape = useMapStore((state: MapStore) => state.setSelectedShape);

    // --- MANEJADORES DE EVENTOS ---
    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);

    const handleMapClick = useCallback((evt: MapLayerMouseEvent) => {
        const { lng, lat } = evt.lngLat;

        // Primero, vemos si el clic fue sobre una 'feature' (capa interactiva)
        if (evt.features && evt.features.length > 0) {
            const clickedFeature = evt.features[0];
            const shapeId = clickedFeature.properties?.id;

            if (shapeId) {
                const shapeToSelect = shapes.find(s => s.id === shapeId);
                if (shapeToSelect) {
                    setSelectedShape(shapeToSelect); // ¡La seleccionamos en el store!
                    return; // Detenemos la ejecución
                }
            }
        }

        // Si no se hizo clic en ninguna feature, continuamos con la lógica de dibujo
        if (mode === 'add-point') {
            setPendingPoints([{ lng, lat }]);
        }
        if (mode === 'add-line' || mode === 'add-polygon') {
            addPendingPoint({ lng, lat });
        }
    }, [mode, shapes, setPendingPoints, addPendingPoint, setSelectedShape]);

    // --- RENDERIZADO ---

    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    return (
        <div id="mapContainer" className="relative px-5 rounded-s-3xl overflow-hidden h-[calc(100vh-6rem)]">
            <Map
                {...viewState}
                onMove={handleMove}
                onClick={handleMapClick}
                cursor={mode.startsWith('add-') ? 'pointer' : 'grab'}
                style={{ width: '100%', minWidth: "90vw", height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
            >
                {/* 1. Capas de datos guardados (se encarga de su propio fetch) */}
                <SavedShapesLayer />

                {/* 2. Capas y marcadores de dibujo pendientes */}
                <PendingDrawLayer />

                {/* Otras capas o componentes del mapa pueden ir aquí */}
            </Map>

            {/* 3. UI (Botones, loading, etc.) por encima del Mapa */}
            <MapUI />
        </div>
    );
}