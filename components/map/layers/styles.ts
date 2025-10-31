import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import type { CircleLayerSpecification, LineLayerSpecification, FillLayerSpecification } from 'react-map-gl/maplibre';

// Solución al tipo 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;

// --- 1. Helper para leer la variable CSS desde el DOM ---
// Devuelve el HSL/HWB string formateado que MapLibre entiende
const getCssVariable = (varName: string): string => {
    // Devuelve un valor por defecto si estamos en SSR (Server-Side Rendering)
    if (typeof window === 'undefined') {
        return 'hsl(0, 84.2%, 60.2%)'; // Default (light mode destructive)
    }

    // Obtenemos el valor computado de la variable CSS
    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

    // El valor de CSS es "0 84.2% 60.2%"
    // MapLibre necesita "hsl(0, 84.2%, 60.2%)"
    return `hsl(${hslValue})`;
};

// --- 2. Hook de Estilos Dinámico ---
// Este hook reemplaza tus 'const' exportadas
export function useMapStyles() {
    // Obtenemos el tema actual (light/dark) de next-themes
    const { resolvedTheme } = useTheme();

    // Creamos un estado para almacenar el color resuelto
    const [destructiveColor, setDestructiveColor] = useState(getCssVariable('--destructive'));

    // --- 3. Efecto que se ejecuta cuando el tema cambia ---
    useEffect(() => {
        // Cuando el tema (light/dark) cambia, 'resolvedTheme' se actualiza.
        // Esperamos un instante para que el DOM se actualice con las nuevas variables CSS
        // y luego leemos el *nuevo* valor de --destructive.
        const timer = setTimeout(() => {
            setDestructiveColor(getCssVariable('--destructive'));
        }, 50); // 50ms es un pequeño buffer seguro

        return () => clearTimeout(timer);
    }, [resolvedTheme]); // Esta es la dependencia clave

    // --- 4. Memoizamos los objetos de estilo ---
    // Esto asegura que solo recalculamos los estilos cuando el color realmente cambia
    const mapStyles = useMemo(() => ({
        pointLayerStyle: {
            id: 'shapes-points',
            type: 'circle',
            filter: ['==', ['get', 'type'], 'point'],
            paint: {
                'circle-radius': 6,
                'circle-color': destructiveColor // Usamos el color del estado
            }
        } as LayerStyleProps<CircleLayerSpecification>,

        lineLayerStyle: {
            id: 'shapes-lines',
            type: 'line',
            filter: ['==', ['get', 'type'], 'line'],
            paint: {
                'line-color': destructiveColor, // Usamos el color del estado
                'line-width': 3
            }
        } as LayerStyleProps<LineLayerSpecification>,

        polygonLayerStyle: {
            id: 'shapes-polygons',
            type: 'fill',
            filter: ['==', ['get', 'type'], 'polygon'],
            paint: {
                'fill-color': destructiveColor, // Usamos el color del estado
                'fill-opacity': 0.4,
                'fill-outline-color': destructiveColor // Usamos el color del estado
            }
        } as LayerStyleProps<FillLayerSpecification>,

        pendingLineStyle: {
            id: 'pending-line-preview',
            type: 'line',
            paint: {
                'line-color': destructiveColor, // Usamos el color del estado
                'line-width': 2,
                'line-dasharray': [2, 1]
            }
        } as LayerStyleProps<LineLayerSpecification>
    }), [destructiveColor]); // El 'useMemo' depende del color en estado

    return mapStyles;
}

