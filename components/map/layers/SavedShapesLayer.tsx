'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { useEffect } from 'react';
// 1. (ELIMINADO) Ya no importamos Source, Layer, ni los tipos de Geometría
// 2. (ELIMINADO) Ya no importamos useMapStyles
import { SingleShapeLayer } from './SingleShapeLayer'; // 3. (NUEVO) Importamos el nuevo componente

export function SavedShapesLayer() {
    const shapes = useMapStore((state: MapStore) => state.shapes);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    useEffect(() => {
        fetchShapes();
    }, [fetchShapes]);


    // mapeamos el array de shapes
    // y renderizamos un componente individual para cada una.
    return (
        <>
            {shapes.map(shape => (
                <SingleShapeLayer key={shape.id} shape={shape} />
            ))}
        </>
    );
}