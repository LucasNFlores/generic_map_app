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

        // --- CASO 2: Estamos en modo 'add-line', queremos confirmar y guardar ---
        if (mode === 'add-line') {

            // Verificación: ¿Hay al menos 2 puntos seleccionados?
            if (pendingPoints.length < 2) {
                toast.error('Necesitas al menos 2 puntos para una línea.');
                return;
            }

            if (isLoading) return;
            setIsLoading(true);
            const toastId = toast.loading('Guardando línea...');

            try {
                // Preparamos el payload para nuestra API
                const payload = {
                    type: 'line', // Tipo 'line'
                    name: `Línea (${pendingPoints.length} puntos)`,
                    description: '',
                    // Enviamos TODOS los puntos del array
                    points: pendingPoints.map(p => ({ latitude: p.lat, longitude: p.lng }))
                };

                // Llamamos al endpoint de la API
                const response = await fetch('/api/shapes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al guardar la línea');
                }

                toast.success('Línea guardada con éxito', { id: toastId });

                // Reseteamos el estado a 'browse'
                setMode('browse');
                clearPendingPoints(); // Limpiamos los puntos temporales
                fetchShapes(); // Recargamos las formas en el mapa

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
                toast.error(errorMessage, { id: toastId });
                console.error(error);
            } finally {
                setIsLoading(false); // Reactivar el botón
            }
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
                       gap-2 rounded-md border bg-background px-3 text-sm lg:h-9 lg:px-2 group cursor-pointer select-none
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/80 transition-all"
            onClick={handleClick}
            disabled={isDisabled}
        >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary group-hover:bg-primary/80 text-primary-foreground">
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
