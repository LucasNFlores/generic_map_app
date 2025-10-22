// providers/map-store-provider.tsx

'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';
import { MapStore, createMapStore, defaultInitialState } from '@/stores/map-store';

export type MapStoreApi = ReturnType<typeof createMapStore>;

export const MapStoreContext = createContext<MapStoreApi | undefined>(
    undefined,
);

export interface MapStoreProviderProps {
    children: ReactNode;
}

export const MapStoreProvider = ({
    children,
}: MapStoreProviderProps) => {
    const storeRef = useRef<MapStoreApi | null>(null);
    if (storeRef.current === null) {
        // Creamos el store una sola vez con el estado inicial
        storeRef.current = createMapStore(defaultInitialState);
    }

    return (
        <MapStoreContext.Provider value={storeRef.current}>
            {children}
        </MapStoreContext.Provider>
    );
};

// Este es el Hook personalizado que usarás en tus componentes
export const useMapStore = <T,>(
    selector: (store: MapStore) => T,
): T => {
    const mapStoreContext = useContext(MapStoreContext);

    if (!mapStoreContext) {
        throw new Error(`useMapStore must be used within MapStoreProvider`);
    }

    return useStore(mapStoreContext, selector);
};