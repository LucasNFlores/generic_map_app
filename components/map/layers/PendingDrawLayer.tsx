'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import type { Shape, GeoJsonFeature, GeoJsonFeatureCollection } from '@/types';
import { useMemo } from 'react';
import { Source, Layer, Marker } from 'react-map-gl/maplibre';
import { useMapStyles } from './styles';


// Marcador para los vértices
function PendingPointMarker() {
    return (
        <div style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)'
        }}
            className="w-4 h-4 bg-pink-600 border-2 border-white rounded-full cursor-pointer" />
    );
}


export function PendingDrawLayer() {
    // 1. Obtenemos solo el estado de dibujo
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoints = useMapStore((state: MapStore) => state.pendingPoints);

    // 2. Lógica de 'useMemo' para la línea de previsualización
    const pendingPreviewGeojson = useMemo(() => {
        if (pendingPoints.length < 2 || mode === 'add-point') {
            return null;
        }
        const coordinates = pendingPoints.map(p => [p.lng, p.lat]) as [number, number][];
        if (mode === 'add-polygon') {
            coordinates.push(coordinates[0]);
        }
        const feature: GeoJsonFeature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: {} as Shape
        };
        return {
            type: 'FeatureCollection',
            features: [feature]
        } as GeoJsonFeatureCollection;
    }, [pendingPoints, mode]);

    // Obtenemos los estilos dinámicos
    const { pendingLineStyle } = useMapStyles();

    // 3. Renderizamos la línea de previsualización Y los marcadores
    return (
        <>
            {/* 3a. Capa para la LÍNEA de previsualización */}
            {pendingPreviewGeojson && (
                <Source
                    id="pending-preview-shape"
                    type="geojson"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={pendingPreviewGeojson as any}
                >
                    <Layer {...pendingLineStyle} />
                </Source>
            )}

            {/* 3b. Marcador grande solo para 'add-point' */}
            {mode === 'add-point' && pendingPoints[0] && (
                <Marker
                    longitude={pendingPoints[0].lng}
                    latitude={pendingPoints[0].lat}
                    anchor="center"
                >
                    <PendingPointMarker />
                </Marker>
            )}

            {/* 3c. Marcadores pequeños para 'add-line' y 'add-polygon' */}
            {(mode === 'add-line' || mode === 'add-polygon') && pendingPoints.map((point, index) => (
                <Marker
                    key={index}
                    longitude={point.lng}
                    latitude={point.lat}
                    anchor="center"
                >
                    <PendingPointMarker />
                </Marker>
            ))}
        </>
    );
}