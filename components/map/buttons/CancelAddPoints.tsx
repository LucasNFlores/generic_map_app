// components/map/buttons/CancelAddPoints.tsx
'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { useCallback } from 'react';

export default function CancelAddPoint() {
    // 1. Leemos el estado y acciones con selectores separados (evita bucles)
    const mode = useMapStore((state: MapStore) => state.mode);
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const setPendingPoints = useMapStore((state: MapStore) => state.setPendingPoints);

    // 2. Función genérica para limpiar CUALQUIER modo de edición
    const handleCancel = useCallback(() => {
        setMode('browse');
        setPendingPoints([]); // Limpiamos el array de puntos pendientes
    }, [setMode, setPendingPoints]);

    // 3. El botón se muestra si estamos en CUALQUIER modo "add-"
    if (!mode.startsWith('add-')) {
        return null; // No mostrar nada si estamos en modo 'browse'
    }

    return (
        <button
            type="button"
            className="flex items-center 
                        gap-2 rounded-lg bg-red-700 text-white pr-3 w-full text-sm h-full group cursor-pointer select-none
                        hover:bg-red-800 "
            onClick={handleCancel}
        >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-red-600">
                {/* Ícono de X (cancelar) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </span>
            <span className="overflow-hidden transition-all duration-100 opacity-100 max-w-full">
                Cancelar
            </span>
        </button>
    );
}

