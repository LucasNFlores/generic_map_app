import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { ShapeWithPoints, GeoJsonFeature, GeoJsonGeometry } from '@/types';
import { useMapStyles } from './styles';

// Función para convertir UNA shape a UN GeoJsonFeature
function shapeToGeoJsonFeature(shape: ShapeWithPoints): GeoJsonFeature {
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
            coordinates.push(coordinates[0]); // Cierra el polígono
        }
        geometry = { type: 'Polygon', coordinates: [coordinates] };
    }
    return { type: 'Feature', geometry: geometry, properties: shape };
}

type Props = {
    shape: ShapeWithPoints;
};

// React.memo evitará que esta forma se redibuje si su prop 'shape' no cambia
export const SingleShapeLayer = React.memo(function SingleShapeLayer({ shape }: Props) {

    // 1. Obtenemos el color de la categoría (con join desde el backend)
    // @ts-expect-error La categoría viene del join en el API
    const categoryColor = shape.category?.color;

    // 2. Obtenemos los estilos únicos para ESTA shape
    const { pointLayerStyle, lineLayerStyle, polygonLayerStyle } = useMapStyles(shape.id, categoryColor);

    // 3. El useMemo ahora es súper rápido, solo procesa una forma
    const geoJsonFeatureCollection = useMemo(() => {
        const feature = shapeToGeoJsonFeature(shape);
        return {
            type: 'FeatureCollection',
            features: [feature]
        };
    }, [shape]);

    return (
        <Source id={`shape-source-${shape.id}`} type="geojson" data={geoJsonFeatureCollection as any}>
            {/* @ts-expect-error El prop 'interactive' es válido en tiempo de ejecución */}
            <Layer {...pointLayerStyle} interactive={true} />
            {/* @ts-expect-error */}
            <Layer {...lineLayerStyle} interactive={true} />
            {/* @ts-expect-error */}
            <Layer {...polygonLayerStyle} interactive={true} />
        </Source>
    );
});