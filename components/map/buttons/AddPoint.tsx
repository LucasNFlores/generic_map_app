//components/map/buttons/AddLine.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { toast } from 'react-hot-toast';

export default function AddPoint() {
    const [isLoading, setIsLoading] = useState(false);

    // --- 1. Leemos todos los estados y acciones necesarios del store ---
    const mode = useMapStore((state: MapStore) => state.mode);
    const setMode = useMapStore((state: MapStore) => state.setMode);

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

        // --- CASO 2: Estamos en modo 'add-point', queremos confirmar y guardar ---
        if (mode === 'add-point') {

            // Verificación: ¿Hay un punto seleccionado?
            if (pendingPoints.length === 0) {
                toast.error('Por favor, haz clic en el mapa para seleccionar una ubicación.');
                return;
            }

            if (isLoading) return; // Evitar doble clic
            setIsLoading(true);
            const toastId = toast.loading('Guardando punto...');

            try {
                // Tomamos el primer (y único) punto del array
                const point = pendingPoints[0];

                // Preparamos el payload para nuestra API
                const payload = {
                    type: 'point',
                    name: `Punto (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`,
                    description: '',
                    points: [{ latitude: point.lat, longitude: point.lng }]
                };

                // Llamamos al endpoint de la API
                const response = await fetch('/api/shapes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al guardar el punto');
                }

                toast.success('Punto guardado con éxito', { id: toastId });

                // Reseteamos el estado a 'browse'
                setMode('browse');
                clearPendingPoints(); // Limpiamos el punto temporal
                fetchShapes(); // Recargamos las formas en el mapa

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
                toast.error(errorMessage, { id: toastId });
                console.error(error);
            } finally {
                setIsLoading(false); // Reactivar el botón
            }
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
                        gap-2 rounded-md border bg-background pr-3 h-9 w-full text-sm group cursor-pointer select-none
                        disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/80 transition-all" // Estilos para deshabilitado
            onClick={handleClick}
            disabled={isDisabled} // Estado de deshabilitado dinámico
        >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary group-hover:bg-primary/80 text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M12 5.25a.75.75 0 0 1 .75.75v5.25h5.25a.75.75 0 0 1 0 1.5H12.75v5.25a.75.75 0 0 1-1.5 0V12.75H5.25a.75.75 0 0 1 0-1.5h5.25V6a.75.75 0 0 1 .75-.75z" clipRule="evenodd" />
                </svg>
            </span>
            <span className=" overflow-hidden transition-all duration-100 opacity-100 max-w-full">
                {buttonText} {/* Texto dinámico */}
            </span>
        </button>
    );
}

