import type { CircleLayerSpecification, LineLayerSpecification, FillLayerSpecification } from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';

// Solución al tipo 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;

// --- 1. Helper para leer la variable CSS desde el DOM ---
// (Este helper es de nuestra conversación anterior)
const getCssVariable = (varName: string): string => {
    if (typeof window === 'undefined') {
        return 'hsl(0, 84.2%, 60.2%)'; // Default (light mode destructive)
    }
    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!hslValue) {
        return 'hsl(0, 84.2%, 60.2%)';
    }
    // El valor de CSS es "0 84.2% 60.2%". MapLibre necesita "hsl(0, 84.2%, 60.2%)"
    return `hsl(${hslValue.replace(/\s/g, ', ')})`;
};


// --- 2. CONVERTIMOS LOS ESTILOS EN FUNCIONES ---

const getPointLayerStyle = (id: string, color: string): LayerStyleProps<CircleLayerSpecification> => ({
    id: `shape-point-${id}`, // ID único
    type: 'circle',
    filter: ['==', ['get', 'type'], 'point'],
    paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff' // Borde blanco
    }
});

const getLineLayerStyle = (id: string, color: string): LayerStyleProps<LineLayerSpecification> => ({
    id: `shape-line-${id}`, // ID único
    type: 'line',
    filter: ['==', ['get', 'type'], 'line'],
    paint: {
        'line-color': color,
        'line-width': 3
    }
});

const getPolygonLayerStyle = (id: string, color: string): LayerStyleProps<FillLayerSpecification> => ({
    id: `shape-polygon-${id}`, // ID único
    type: 'fill',
    filter: ['==', ['get', 'type'], 'polygon'],
    paint: {
        'fill-color': color,
        'fill-opacity': 0.4,
        'fill-outline-color': color
    }
});

// --- Capas Pendientes (Previsualización) ---
// (Esta puede mantener un ID estático porque solo hay una a la vez)
export const pendingLineStyle: LayerStyleProps<LineLayerSpecification> = {
    id: 'pending-line-preview',
    type: 'line',
    paint: {
        'line-color': getCssVariable('--destructive'), // Usamos el color base
        'line-width': 2,
        'line-dasharray': [2, 1]
    }
};


// --- 3. EL HOOK (ACTUALIZADO) ---
// Ahora el hook devuelve las *funciones* de estilo
export const useMapStyles = (shapeId: string) => {
    const { theme } = useTheme();
    const [color, setColor] = useState('hsl(0, 84.2%, 60.2%)');
    const selectedShapeId = useMapStore((state: MapStore) => state.selectedShape?.id);

    useEffect(() => {
        // Obtenemos el color destructivo (rojo/rosa)
        let newColor = getCssVariable('--destructive');

        // (Lógica de resaltado )
        if (selectedShapeId === shapeId) {
            newColor = getCssVariable('--primary'); // Resaltar con color primario
        }

        setColor(newColor);
    }, [theme, selectedShapeId, shapeId]); // Re-calcula si cambia el tema o la selección

    // Usamos useMemo para no recrear los objetos en cada render
    const styles = useMemo(() => ({
        pointLayerStyle: getPointLayerStyle(shapeId, color),
        lineLayerStyle: getLineLayerStyle(shapeId, color),
        polygonLayerStyle: getPolygonLayerStyle(shapeId, color),
    }), [shapeId, color]);

    return styles;
};