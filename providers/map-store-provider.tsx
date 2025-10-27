// providers/map-store-provider.tsx
'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';
// 1. Importamos la lógica del store desde el otro archivo
import {
    type MapStore,
    createMapStore,
    defaultInitialState
} from '@/stores/map-store';

export type MapStoreApi = ReturnType<typeof createMapStore>;

// 2. Creamos el Contexto de React
export const MapStoreContext = createContext<MapStoreApi | undefined>(
    undefined,
);

export interface MapStoreProviderProps {
    children: ReactNode;
}

// 3. Creamos el Componente Provider
export const MapStoreProvider = ({
    children,
}: MapStoreProviderProps) => {
    const storeRef = useRef<MapStoreApi | null>(null);
    if (storeRef.current === null) {
        // Usamos la fábrica importada para crear el store
        storeRef.current = createMapStore(defaultInitialState);
    }

    return (
        <MapStoreContext.Provider value={storeRef.current}>
            {children}
        </MapStoreContext.Provider>
    );
};

// 4. ¡AQUÍ ESTÁ EL HOOK!
// Definimos y exportamos el hook 'useMapStore' que tus componentes usarán.
export const useMapStore = <T,>(
    selector: (store: MapStore) => T,
): T => {
    const mapStoreContext = useContext(MapStoreContext);

    if (!mapStoreContext) {
        throw new Error(`useMapStore must be used within MapStoreProvider`);
    }

    return useStore(mapStoreContext, selector);
};

