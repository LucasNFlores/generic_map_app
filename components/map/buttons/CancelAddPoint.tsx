'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store'; // Importamos el TIPO
import { useCallback } from 'react';

export default function CancelAddPoint() {
    // 1. Leemos el estado y acciones con selectores separados
    const mode = useMapStore((state: MapStore) => state.mode);
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const setPendingPoint = useMapStore((state: MapStore) => state.setPendingPoint);

    // 2. Función para limpiar el estado y volver al modo "browse"
    const handleCancel = useCallback(() => {
        setMode('browse');
        setPendingPoint(null);
    }, [setMode, setPendingPoint]);

    // 3. El botón solo se muestra si estamos en modo "add-point"
    if (mode !== 'add-point') {
        return null;
    }

    return (
        <button
            type="button"
            className="flex items-center 
                        gap-2 rounded-md border bg-red-600 text-white px-3 text-sm lg:h-9 lg:px-2 group cursor-pointer select-none
                        hover:bg-red-700 w-full p-6"
            onClick={handleCancel}
        >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-red-600">
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

