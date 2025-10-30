import type { CircleLayerSpecification, LineLayerSpecification, FillLayerSpecification } from 'react-map-gl/maplibre';

// Solución al tipo 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;

// --- Capas Guardadas ---

export const pointLayerStyle: LayerStyleProps<CircleLayerSpecification> = {
    id: 'shapes-points',
    type: 'circle',
    filter: ['==', ['get', 'type'], 'point'],
    paint: { 'circle-radius': 6, 'circle-color': '#E91E63' }
};

export const lineLayerStyle: LayerStyleProps<LineLayerSpecification> = {
    id: 'shapes-lines',
    type: 'line',
    filter: ['==', ['get', 'type'], 'line'],
    paint: { 'line-color': '#E91E63', 'line-width': 3 }
};

export const polygonLayerStyle: LayerStyleProps<FillLayerSpecification> = {
    id: 'shapes-polygons',
    type: 'fill',
    filter: ['==', ['get', 'type'], 'polygon'],
    paint: { 'fill-color': '#E91E63', 'fill-opacity': 0.4, 'fill-outline-color': '#E91E63' }
};

// --- Capas Pendientes (Previsualización) ---

export const pendingLineStyle: LayerStyleProps<LineLayerSpecification> = {
    id: 'pending-line-preview',
    type: 'line',
    paint: {
        'line-color': '#E91E63',
        'line-width': 2,
        'line-dasharray': [2, 1]
    }
};