//components/map/buttons/AddLine.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { toast } from 'react-hot-toast';

export default function AddLine() {
    const [isLoading, setIsLoading] = useState(false);

    // --- 1. Leemos todos los estados y acciones necesarios del store ---
    const mode = useMapStore((state: MapStore) => state.mode);
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const setSelectedShape = useMapStore((state: MapStore) => state.setSelectedShape);
    const pendingPoints = useMapStore((state: MapStore) => state.pendingPoints);
    const clearPendingPoints = useMapStore((state: MapStore) => state.clearPendingPoints);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    // --- 2. Lógica de Clic Adaptada para LÍNEA ---
    const handleClick = useCallback(async () => {

        // --- CASO 1: Estamos en modo 'browse', queremos empezar a añadir una línea ---
        if (mode === 'browse') {
            setMode('add-line'); // Cambiamos al modo 'add-line'
            return;
        }

        // --- CASO 2: Estamos en modo 'add-line', queremos confirmar y abrir formulario ---
        if (mode === 'add-line') {
            if (pendingPoints.length < 2) {
                toast.error('Necesitas al menos 2 puntos para una línea.');
                return;
            }

            const draftShape: any = {
                id: '',
                type: 'line',
                name: '',
                description: '',
                metadata: {},
                shape_points: pendingPoints.map((p, i) => ({
                    sequence_order: i + 1,
                    points: { latitude: p.lat, longitude: p.lng }
                }))
            };

            setSelectedShape(draftShape);
            return;
        }

    }, [mode, isLoading, setMode, pendingPoints, clearPendingPoints, fetchShapes]);


    // --- 3. Lógica para el Texto y Estado del Botón (Dinámico) ---
    const { buttonText, isDisabled } = useMemo(() => {
        if (isLoading) {
            return { buttonText: 'Guardando...', isDisabled: true };
        }

        if (mode === 'add-line') {
            if (pendingPoints.length === 0) {
                return { buttonText: 'Clickea el 1er punto', isDisabled: true };
            }
            if (pendingPoints.length === 1) {
                return { buttonText: 'Clickea el 2do punto', isDisabled: true };
            }
            // Si ya hay 2 o más puntos, habilitamos la confirmación
            return { buttonText: `Confirmar Línea (${pendingPoints.length} puntos)`, isDisabled: false };
        }

        // Estado por defecto (modo 'browse')
        return { buttonText: 'Nueva Línea', isDisabled: false };

    }, [mode, isLoading, pendingPoints]);


    // --- 4. Renderizado del Botón ---

    // Este botón solo se muestra si estamos en modo 'browse' o 'add-line'
    if (mode !== 'browse' && mode !== 'add-line') {
        return null;
    }

    return (
        <button
            type="button"
            className="flex items-center 
                       gap-2 rounded-md bg-background pr-3 h-full w-full text-sm group cursor-pointer select-none
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/80 transition-all"
            onClick={handleClick}
            disabled={isDisabled}
        >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary group-hover:bg-primary/80 text-primary-foreground">
                {/* Icono de Línea (Polyline) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15.75l4.5-4.5 4.5 4.5 4.5-4.5" />
                </svg>
            </span>
            <span className=" overflow-hidden transition-all duration-100 opacity-100 max-w-full">
                {buttonText} {/* Texto dinámico */}
            </span>
        </button>
    );
}
