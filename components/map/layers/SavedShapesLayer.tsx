'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import type { ShapeWithPoints, GeoJsonFeature, GeoJsonFeatureCollection, GeoJsonGeometry } from '@/types';
import { useEffect, useMemo } from 'react';
import { Source, Layer, type CircleLayerSpecification, type LineLayerSpecification, type FillLayerSpecification } from 'react-map-gl/maplibre';

// Solución al tipo 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;

// Estilos de capas guardadas
const pointLayerStyle: LayerStyleProps<CircleLayerSpecification> = { id: 'shapes-points', type: 'circle', filter: ['==', ['get', 'type'], 'point'], paint: { 'circle-radius': 6, 'circle-color': '#E91E63' } };
const lineLayerStyle: LayerStyleProps<LineLayerSpecification> = { id: 'shapes-lines', type: 'line', filter: ['==', ['get', 'type'], 'line'], paint: { 'line-color': '#E91E63', 'line-width': 3 } };
const polygonLayerStyle: LayerStyleProps<FillLayerSpecification> = { id: 'shapes-polygons', type: 'fill', filter: ['==', ['get', 'type'], 'polygon'], paint: { 'fill-color': '#E91E63', 'fill-opacity': 0.4, 'fill-outline-color': '#E91E63' } };


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