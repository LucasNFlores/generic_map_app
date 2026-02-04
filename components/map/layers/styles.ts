import type { CircleLayerSpecification, LineLayerSpecification, FillLayerSpecification } from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';

// Solución al tipo 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;

// --- 1. Helper para leer la variable CSS desde el DOM ---
const getCssVariable = (varName: string): string => {
    if (typeof window === 'undefined') {
        return 'hsl(0, 84.2%, 60.2%)';
    }
    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!hslValue) {
        return 'hsl(0, 84.2%, 60.2%)';
    }
    return `hsl(${hslValue.replace(/\s/g, ', ')})`;
};

// --- 2. CONVERTIMOS LOS ESTILOS EN FUNCIONES ---

const getPointLayerStyle = (id: string, color: string): LayerStyleProps<CircleLayerSpecification> => ({
    id: `shape-point-${id}`,
    type: 'circle',
    filter: ['==', ['get', 'type'], 'point'],
    paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
    }
});

const getLineLayerStyle = (id: string, color: string): LayerStyleProps<LineLayerSpecification> => ({
    id: `shape-line-${id}`,
    type: 'line',
    filter: ['==', ['get', 'type'], 'line'],
    paint: {
        'line-color': color,
        'line-width': 3
    }
});

const getPolygonLayerStyle = (id: string, color: string): LayerStyleProps<FillLayerSpecification> => ({
    id: `shape-polygon-${id}`,
    type: 'fill',
    filter: ['==', ['get', 'type'], 'polygon'],
    paint: {
        'fill-color': color,
        'fill-opacity': 0.4,
        'fill-outline-color': color
    }
});

// --- Capas Pendientes (Previsualización) ---
export const pendingLineStyle: LayerStyleProps<LineLayerSpecification> = {
    id: 'pending-line-preview',
    type: 'line',
    paint: {
        'line-color': 'hsl(0, 84.2%, 60.2%)',
        'line-width': 2,
        'line-dasharray': [2, 1]
    }
};

// --- 3. EL HOOK (ACTUALIZADO) ---
export const useMapStyles = (shapeId: string, categoryColor?: string) => {
    const { theme } = useTheme();
    const [color, setColor] = useState(categoryColor || 'hsl(0, 84.2%, 60.2%)');
    const selectedShapeId = useMapStore((state: MapStore) => state.selectedShape?.id);

    useEffect(() => {
        // Prioridad: Selección > Color Categoría > Default
        if (selectedShapeId === shapeId) {
            setColor(getCssVariable('--primary'));
        } else if (categoryColor) {
            setColor(categoryColor);
        } else {
            setColor(getCssVariable('--destructive'));
        }
    }, [theme, selectedShapeId, shapeId, categoryColor]);

    const styles = useMemo(() => ({
        pointLayerStyle: getPointLayerStyle(shapeId, color),
        lineLayerStyle: getLineLayerStyle(shapeId, color),
        polygonLayerStyle: getPolygonLayerStyle(shapeId, color),
    }), [shapeId, color]);

    return styles;
};