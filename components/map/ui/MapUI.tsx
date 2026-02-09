'use client';

import * as React from 'react'; // Para el 'React is not defined'
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';

// Importar el formulario universal
import { ShapeForm } from "@/components/map/ui/ShapeInfo/ShapeForm";

// Importar el contenedor de botones y los botones
import { Container } from '../buttons/Container';
import AddPoint from '../buttons/AddPoint';
import AddLine from '../buttons/AddLine';
import CancelAddPoint from '../buttons/CancelAddPoints';
import AddPolygon from '../buttons/AddPolygon';

interface MapUIProps {
    isReadOnly?: boolean;
}

export function MapUI({ isReadOnly = false }: MapUIProps) {
    const isLoadingShapes = useMapStore((state: MapStore) => state.isLoadingShapes);
    const fetchCategories = useMapStore((state: MapStore) => state.fetchCategories);
    const selectedShape = useMapStore((state: MapStore) => state.selectedShape);
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoints = useMapStore((state: MapStore) => state.pendingPoints);

    // Cargar categorías al montar la UI
    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Si es solo lectura, no mostramos NADA de la UI de edición
    if (isReadOnly) {
        return null;
    }

    return (
        <>
            {/* 1. Indicador de Carga */}
            {isLoadingShapes && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded shadow-md z-10">
                    Cargando formas...
                </div>
            )}

            {/* 3. Lógica condicional */}
            {selectedShape ? (
                // Si hay una shape seleccionada (edición o creación confirmada)
                <ShapeForm
                    shape={selectedShape}
                    isNew={!selectedShape.id}
                />
            ) : (
                // Si no hay nada seleccionado, mostramos los botones de creación
                <Container>
                    <AddPoint />
                    <AddLine />
                    <AddPolygon />
                    <CancelAddPoint />
                </Container>
            )}
        </>
    );
}