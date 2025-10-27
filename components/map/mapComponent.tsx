'use client';

// 1. Importamos el <Marker> y el tipo 'MapLayerMouseEvent'
import Map, { Marker, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useCallback } from 'react';
import { Container } from './buttons/Container';
import AddPoint from './buttons/AddPoint';
// Importamos el nuevo botón de cancelar
import CancelAddPoint from './buttons/CancelAddPoint';
import type { MapStore } from '@/stores/map-store'; // Importamos el TIPO

// Un componente simple para el marcador temporal
function TemporaryMarker() {
    return (
        <div style={{
            position: 'absolute', // Aseguramos que se posicione respecto al mapa
            transform: 'translate(-50%, -50%)' // Centrado manual
        }}
            className="w-4 h-4 bg-pink-600 border-2 border-white rounded-full cursor-pointer -translate-x-1/2 -translate-y-1/2" />
    );
}

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- 2. SEPARAMOS LOS SELECTORES ---
    // Seleccionamos cada pieza del estado por separado para evitar re-renders infinitos.
    const viewState = useMapStore((state: MapStore) => state.viewState);
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoint = useMapStore((state: MapStore) => state.pendingPoint);

    // Las funciones de set son estables, se pueden seleccionar juntas o separadas.
    const setViewState = useMapStore((state: MapStore) => state.setViewState);
    const setPendingPoint = useMapStore((state: MapStore) => state.setPendingPoint);

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);

    // --- 3. Nueva función para manejar el clic en el mapa ---
    const handleMapClick = useCallback((evt: MapLayerMouseEvent) => {
        // Solo hacemos algo si estamos en modo 'add-point'
        if (mode === 'add-point') {
            const { lng, lat } = evt.lngLat;
            setPendingPoint({ lng, lat });
        }
    }, [mode, setPendingPoint]);

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
                onClick={handleMapClick} // 4. Añadimos el listener de clic
                // Cambiamos el cursor si estamos en modo 'add-point'
                cursor={mode === 'add-point' ? 'pointer' : 'grab'}
                style={{ width: '100%', minWidth: "90vw", height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
            >
                {/* 5. Renderizamos el marcador temporal si existe */}
                {pendingPoint && (
                    <Marker
                        longitude={pendingPoint.lng}
                        latitude={pendingPoint.lat}
                        anchor="center"
                    >
                        <TemporaryMarker />
                    </Marker>
                )}

                <Container>
                    {/* Estos componentes tienen su propia lógica interna */}
                    <AddPoint />
                    <CancelAddPoint />
                </Container>

            </Map>
        </div>
    );
}

