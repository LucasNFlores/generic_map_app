'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { Container } from '../buttons/Container';
import AddPoint from '../buttons/AddPoint';
import AddLine from '../buttons/AddLine';
import CancelAddPoint from '../buttons/CancelAddPoints';
import AddPolygon from '../buttons/AddPolygon';

export function MapUI() {
    const isLoadingShapes = useMapStore((state: MapStore) => state.isLoadingShapes);

    return (
        <>
            {/* 1. Indicador de Carga */}
            {isLoadingShapes && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded shadow-md z-10">
                    Cargando formas...
                </div>
            )}

            {/* 2. Botones */}
            <Container>
                <AddPoint />
                <AddLine />
                <AddPolygon />
                <CancelAddPoint />
            </Container>
        </>
    );
}