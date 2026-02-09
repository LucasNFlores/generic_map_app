//components/map/buttons/AddLine.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { toast } from 'react-hot-toast';
import { Check, Plus } from 'lucide-react';

export default function AddPoint() {
    const [isLoading, setIsLoading] = useState(false);

    // --- 1. Leemos todos los estados y acciones necesarios del store ---
    const mode = useMapStore((state: MapStore) => state.mode);
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const setSelectedShape = useMapStore((state: MapStore) => state.setSelectedShape);

    // Usamos el nuevo array 'pendingPoints'
    const pendingPoints = useMapStore((state: MapStore) => state.pendingPoints);
    const clearPendingPoints = useMapStore((state: MapStore) => state.clearPendingPoints);

    // La acción para recargar el mapa después de guardar
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    // --- 2. Lógica de Clic Actualizada ---
    const handleClick = useCallback(async () => {

        // --- CASO 1: Estamos en modo 'browse', queremos empezar a añadir un punto ---
        if (mode === 'browse') {
            setMode('add-point');
            return; // No hacemos nada más, solo cambiamos de modo
        }

        // --- CASO 2: Estamos en modo 'add-point', queremos confirmar y abrir el formulario ---
        if (mode === 'add-point') {
            if (pendingPoints.length === 0) {
                toast.error('Por favor, haz clic en el mapa para seleccionar una ubicación.');
                return;
            }

            // En lugar de guardar directo, creamos una "shape" temporal y la seleccionamos
            const point = pendingPoints[0];
            const draftShape: any = {
                id: '', // Empty ID means it's a NEW shape
                type: 'point',
                name: '',
                description: '',
                metadata: {},
                shape_points: [
                    { sequence_order: 1, points: { latitude: point.lat, longitude: point.lng } }
                ]
            };

            // Seleccionamos la shape (esto abrirá el ShapeForm en MapUI)
            setSelectedShape(draftShape);
            return;
        }

        // Aquí se añadiría la lógica futura para 'add-line' y 'add-polygon'

    }, [mode, isLoading, setMode, pendingPoints, clearPendingPoints, fetchShapes]);


    // --- 3. Lógica para el Texto y Estado del Botón (Dinámico) ---
    // Usamos useMemo para calcular el texto y si está deshabilitado
    const { buttonText, isDisabled } = useMemo(() => {
        if (isLoading) {
            return { buttonText: 'Guardando...', isDisabled: true };
        }

        if (mode === 'add-point') {
            // Si estamos en modo 'add-point' pero no hemos seleccionado un punto...
            if (pendingPoints.length === 0) {
                return { buttonText: 'Selecciona ubicación...', isDisabled: true };
            }
            // Si ya seleccionamos un punto...
            return { buttonText: 'Confirmar Punto', isDisabled: false };
        }

        // Estado por defecto (modo 'browse')
        return { buttonText: 'Nuevo Punto', isDisabled: false };

    }, [mode, isLoading, pendingPoints]);


    // --- 4. Renderizado del Botón ---

    // Este botón solo se muestra si estamos en modo 'browse' o 'add-point'
    // (Se ocultará si estamos en 'add-line' o 'add-polygon')
    if (mode !== 'browse' && mode !== 'add-point') {
        return null;
    }

    return (
        <button
            type="button"
            className="flex items-center 
                        gap-2 rounded-md bg-background pr-3 h-full w-full text-sm group cursor-pointer select-none
                        disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/80 transition-all" // Estilos para deshabilitado
            onClick={handleClick}
            disabled={isDisabled} // Estado de deshabilitado dinámico
        >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary group-hover:bg-primary/80 text-primary-foreground">
                {mode === 'add-point' && pendingPoints.length > 0 ? (
                    <Check className="h-5 w-5" />
                ) : (
                    <Plus className="h-5 w-5" />
                )}
            </span>
            <span className=" overflow-hidden transition-all duration-100 opacity-100 max-w-full">
                {buttonText} {/* Texto dinámico */}
            </span>
        </button>
    );
}

