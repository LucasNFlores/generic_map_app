'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import type { ShapeWithPoints, GeoJsonFeature, GeoJsonFeatureCollection, GeoJsonGeometry } from '@/types';
import { useEffect, useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { pointLayerStyle, lineLayerStyle, polygonLayerStyle } from './styles';



export function SavedShapesLayer() {
    // 1. Obtenemos solo lo que necesitamos del store
    const shapes = useMapStore((state: MapStore) => state.shapes);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    // 2. El 'useEffect' para cargar datos ahora vive aquí
    useEffect(() => {
        fetchShapes();
    }, [fetchShapes]);

    // 3. La transformación de datos (useMemo) ahora vive aquí
    const savedShapesGeojson = useMemo(() => {
        const features: GeoJsonFeature[] = shapes.map((shape: ShapeWithPoints) => {
            const validShapePoints = shape.shape_points.filter(sp => sp.points !== null);
            const coordinates: [number, number][] = validShapePoints
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map(sp => [sp.points!.longitude, sp.points!.latitude] as [number, number]);

            let geometry: GeoJsonGeometry;
            if (shape.type === 'point') {
                geometry = { type: 'Point', coordinates: coordinates[0] || [0, 0] as [number, number] };
            } else if (shape.type === 'line') {
                geometry = { type: 'LineString', coordinates: coordinates };
            } else { // 'polygon'
                if (coordinates.length > 2 && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
                    coordinates.push(coordinates[0]);
                }
                geometry = { type: 'Polygon', coordinates: [coordinates] };
            }
            return { type: 'Feature', geometry: geometry, properties: shape };
        });
        return { type: 'FeatureCollection', features: features } as GeoJsonFeatureCollection;
    }, [shapes]);

    // 4. Renderizamos solo las capas guardadas
    return (
        <Source
            id="my-shapes"
            type="geojson"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={savedShapesGeojson as any}
        >
            <Layer {...pointLayerStyle} />
            <Layer {...lineLayerStyle} />
            <Layer {...polygonLayerStyle} />
        </Source>
    );
}