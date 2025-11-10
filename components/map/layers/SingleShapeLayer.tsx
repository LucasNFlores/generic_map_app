import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { ShapeWithPoints, GeoJsonFeature, GeoJsonGeometry } from '@/types';
// Importamos el hook de estilos dinámicos que creamos
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

    // 1. Obtenemos los estilos únicos para ESTA shape, pasando su ID
    const { pointLayerStyle, lineLayerStyle, polygonLayerStyle } = useMapStyles(shape.id);

    // 2. El useMemo ahora es súper rápido, solo procesa una forma
    const geoJsonFeatureCollection = useMemo(() => {
        const feature = shapeToGeoJsonFeature(shape);
        return {
            type: 'FeatureCollection',
            features: [feature]
        };
    }, [shape]);

    return (
        // 3. Usamos el ID de la shape para que la Source sea única
        <Source id={`shape-source-${shape.id}`} type="geojson" data={geoJsonFeatureCollection as any}>

            {/* 4. Esta es la corrección clave para tu error (image_413848.jpg):
                 'interactive' es una prop de <Layer>, no una propiedad de estilo.
                 También usamos los estilos únicos (pointLayerStyle, etc.)
            */}
            <Layer {...pointLayerStyle} interactive={true} />
            <Layer {...lineLayerStyle} interactive={true} />
            <Layer {...polygonLayerStyle} interactive={true} />
        </Source>
    );
});