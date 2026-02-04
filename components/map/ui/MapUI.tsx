'use client';

import * as React from 'react'; // Para el 'React is not defined'
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';

// Importar el formulario de edición
import { EditShapeForm } from "@/components/map/ui/ShapeInfo/EditShapeForm";

// Importar el contenedor de botones y los botones
import { Container } from '../buttons/Container';
import AddPoint from '../buttons/AddPoint';
import AddLine from '../buttons/AddLine';
import CancelAddPoint from '../buttons/CancelAddPoints';
import AddPolygon from '../buttons/AddPolygon';

export function MapUI() {
    const isLoadingShapes = useMapStore((state: MapStore) => state.isLoadingShapes);
    const fetchCategories = useMapStore((state: MapStore) => state.fetchCategories);
    const selectedShape = useMapStore((state: MapStore) => state.selectedShape);

    // Cargar categorías al montar la UI
    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
                // Si hay una shape seleccionada, mostramos el formulario de edición
                <EditShapeForm shape={selectedShape} />

            ) : (
                // Si no hay nada seleccionado, mostramos los botones de creación
                // (Este es el bloque que se había corrompido)
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