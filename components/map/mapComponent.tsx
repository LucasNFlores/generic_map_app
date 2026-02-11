// MapComponent.tsx
'use client';

import * as React from 'react';
import Map, {
    type MapLayerMouseEvent,
    type ViewStateChangeEvent
} from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import { useCallback, useMemo, useEffect } from 'react';
import type { MapStore } from '@/stores/map-store';
import type { MapConfiguration, ShapeWithPoints } from '@/types';
import maplibregl from 'maplibre-gl';

import { SavedShapesLayer } from './layers/SavedShapesLayer';
import { PendingDrawLayer } from './layers/PendingDrawLayer';
import { MapUI } from './ui/MapUI';

interface MapComponentProps {
    isReadOnly?: boolean;
    customConfig?: MapConfiguration | null;
}

export default function MapComponent({ isReadOnly = false, customConfig = null }: MapComponentProps) {
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

    // --- Configuración del Mapa ---
    const mapConfig = useMapStore((state: MapStore) => state.mapConfig);
    const fetchMapConfig = useMapStore((state: MapStore) => state.fetchMapConfig);

    useEffect(() => {
        // Fetch global config if not yet loaded and no custom config provided
        if (!mapConfig && !customConfig) {
            fetchMapConfig();
        }
    }, [mapConfig, customConfig, fetchMapConfig]);

    const activeConfig = customConfig || mapConfig;

    // --- LOGIC: Initial Position Modes ---
    useEffect(() => {
        if (!activeConfig) return;

        const mode = activeConfig.initial_position_mode;

        if (mode === 'custom') {
            setViewState({
                ...viewState,
                longitude: activeConfig.default_center.lng,
                latitude: activeConfig.default_center.lat,
                zoom: activeConfig.default_center.zoom,
            });
        } else if (mode === 'current_location') {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setViewState({
                            ...viewState,
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude,
                            zoom: 14, // Default zoom for current location
                        });
                    },
                    (error) => {
                        console.warn("Geolocation permission denied or error:", error);
                    }
                );
            }
        } else if (mode === 'fit_shapes' && shapes.length > 0) {
            try {
                const bounds = new maplibregl.LngLatBounds();
                let hasPoints = false;

                shapes.forEach((shape: ShapeWithPoints) => {
                    shape.shape_points?.forEach(sp => {
                        if (sp.points) {
                            bounds.extend([sp.points.longitude, sp.points.latitude]);
                            hasPoints = true;
                        }
                    });
                });

                if (hasPoints) {
                    // We don't have easy access to the map instance here unless we use a ref
                    // But we can approximate center/zoom or use jumpTo if we had the map ref.
                    // For now, let's just calculate the center.
                    const center = bounds.getCenter();
                    setViewState({
                        ...viewState,
                        longitude: center.lng,
                        latitude: center.lat,
                        zoom: 12, // Approximate zoom or we could calculate fitBounds zoom
                    });
                }
            } catch (e) {
                console.error("Error calculating bounds:", e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConfig?.initial_position_mode]);
    // We only trigger when activeConfig.id changes or when the mode changes explicitly.
    // Actually, usually we want this only ONCE when the app loads or config is fetched.

    // --- 2. (NUEVO) Generar la lista de IDs de capas interactivas ---
    const interactiveLayerIds = useMemo(() => {
        if (!shapes || isReadOnly) return []; // No interactivo si es solo lectura
        return shapes.flatMap(shape => [
            `shape-point-${shape.id}`,
            `shape-line-${shape.id}`,
            `shape-polygon-${shape.id}`
        ]);
    }, [shapes, isReadOnly]);

    // --- MANEJADORES DE EVENTOS ---
    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);

    const handleMapClick = useCallback((evt: MapLayerMouseEvent) => {
        if (isReadOnly) return;

        const { lng, lat } = evt.lngLat;

        if (evt.features && evt.features.length > 0) {
            const clickedFeature = evt.features[0];
            const shapeId = clickedFeature.properties?.id;

            if (shapeId) {
                const shapeToSelect = shapes.find(s => s.id === shapeId);
                if (shapeToSelect) {
                    setSelectedShape(shapeToSelect);
                    return;
                }
            }
        }

        if (mode === 'add-point') {
            setPendingPoints([{ lng, lat }]);
        }
        if (mode === 'add-line' || mode === 'add-polygon') {
            addPendingPoint({ lng, lat });
        }
    }, [mode, shapes, setPendingPoints, addPendingPoint, setSelectedShape, isReadOnly]);

    // --- RENDERIZADO ---

    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    // Determine Map Style
    const baseStyleUrl = activeConfig?.mapbox_style || `https://api.maptiler.com/maps/streets-v2/style.json`;
    const mapStyle = baseStyleUrl.includes('key=') ? baseStyleUrl : `${baseStyleUrl}?key=${mapTilerKey}`;

    return (
        <div id="mapContainer" className="relative w-full h-full flex-1 overflow-hidden">
            <Map
                {...viewState}
                onMove={handleMove}
                onClick={handleMapClick}
                cursor={isReadOnly ? 'grab' : (mode.startsWith('add-') ? 'pointer' : 'grab')}
                style={{ width: '100%', height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
                interactiveLayerIds={interactiveLayerIds}
            >
                <SavedShapesLayer />
                {!isReadOnly && <PendingDrawLayer />}
            </Map>
            <MapUI isReadOnly={isReadOnly} config={activeConfig} />
        </div>
    );
}