'use client';

import { useMapStore } from '@/providers/map-store-provider'
import type { MapStore } from '@/stores/map-store'
import { useEffect } from 'react'
import { SingleShapeLayer } from './SingleShapeLayer'

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