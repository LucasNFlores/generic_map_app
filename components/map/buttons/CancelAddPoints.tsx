// components/map/buttons/CancelAddPoints.tsx
'use client';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { useCallback } from 'react';
import { X } from 'lucide-react';

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
                        gap-2 rounded-md bg-background pr-3 h-full w-full text-sm group cursor-pointer select-none
                        hover:bg-background/80 transition-all"
            onClick={handleCancel}
        >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-destructive group-hover:bg-destructive/80 text-destructive-foreground">
                <X className="h-5 w-5" />
            </span>
            <span className="overflow-hidden transition-all duration-100 opacity-100 max-w-full">
                Cancelar
            </span>
        </button>
    );
}

