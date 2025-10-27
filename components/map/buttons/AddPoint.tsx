'use client';

import { useState, useCallback } from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store'; // Importamos el TIPO

export default function AddPoint() {
    const [isLoading, setIsLoading] = useState(false);

    // --- CORRECCIÓN: Leemos MÁS ESTADO del store ---
    // Necesitamos saber el 'mode' actual y el 'pendingPoint'
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoint = useMapStore((state: MapStore) => state.pendingPoint);

    // Y las acciones para cambiar el modo y limpiar el punto
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const setPendingPoint = useMapStore((state: MapStore) => state.setPendingPoint);
    // --- FIN DE LA CORRECCIÓN ---


    // TODO (Próximo paso): Agregar acción 'fetchShapes' para refrescar
    // const fetchShapes = useMapStore((state) => state.fetchShapes);

    const handleClick = useCallback(async () => {
        if (isLoading) return;

        // --- CORRECCIÓN: Lógica de dos pasos ---
        if (mode === 'browse') {
            // Si estamos navegando, entramos en modo añadir punto
            setMode('add-point');
            setPendingPoint(null); // Limpiamos cualquier punto anterior
        } else if (mode === 'add-point' && pendingPoint) {
            // Si estamos añadiendo y YA hay un punto seleccionado, lo guardamos
            setIsLoading(true);
            try {
                // Usamos las coordenadas del pendingPoint, NO del viewState
                const { lat: latitude, lng: longitude } = pendingPoint;

                console.log(pendingPoint);


                const payload = {
                    type: 'point',
                    name: `Punto (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, // Nombre descriptivo
                    description: '',
                    points: [{ latitude, longitude }]
                };

                const response = await fetch('/api/shapes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al guardar el punto');
                }

                console.log('Punto guardado con éxito');
                // Salimos del modo 'add-point' y limpiamos
                setMode('browse');
                setPendingPoint(null);

                // TODO: Refrescar el mapa llamando a fetchShapes();

            } catch (error) {
                console.error(error);
                // Notificar error al usuario
            } finally {
                setIsLoading(false);
            }
        } else if (mode === 'add-point' && !pendingPoint) {
            // Si estamos en modo añadir pero AÚN NO se hizo clic en el mapa,
            // no hacemos nada (o podríamos mostrar un mensaje).
            console.log("Por favor, haz clic en el mapa para seleccionar la ubicación.");
        }
        // --- FIN DE LA CORRECCIÓN ---

    }, [mode, pendingPoint, isLoading, setMode, setPendingPoint]); // Añadimos dependencias

    // --- CORRECCIÓN: Texto y estado 'disabled' dinámicos ---
    const buttonText = mode === 'add-point'
        ? (pendingPoint ? (isLoading ? 'Guardando...' : 'Confirmar Punto') : 'Selecciona ubicación...')
        : 'Nuevo Punto';

    // Deshabilitamos si está cargando, o si estamos en modo 'add-point' SIN un punto seleccionado
    const isDisabled = isLoading || (mode === 'add-point' && !pendingPoint);
    // --- FIN DE LA CORRECCIÓN ---

    return (
        <button
            type="button"
            className="flex items-center 
                        gap-2 rounded-md border bg-background px-3 text-sm lg:h-9 lg:px-2 group cursor-pointer select-none
                        disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClick}
            disabled={isDisabled} // Usamos el estado dinámico
        >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {/* Cambiamos el ícono si estamos confirmando */}
                {mode === 'add-point' && pendingPoint ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path fillRule="evenodd" d="M12 5.25a.75.75 0 0 1 .75.75v5.25h5.25a.75.75 0 0 1 0 1.5H12.75v5.25a.75.75 0 0 1-1.5 0V12.75H5.25a.75.75 0 0 1 0-1.5h5.25V6a.75.75 0 0 1 .75-.75z" clipRule="evenodd" />
                    </svg>
                )}
            </span>
            <span className="opacity-0 max-w-0 overflow-hidden transition-all duration-100 group-hover:opacity-100 group-hover:max-w-full">
                {buttonText} {/* Usamos el texto dinámico */}
            </span>
        </button>
    );
}

