// stores/map-store.ts
import { createStore } from 'zustand/vanilla';
import type { ViewState } from 'react-map-gl/maplibre';

// 1. Definimos los nuevos tipos de estado
export type MapMode = 'browse' | 'add-point' | 'add-line' | 'add-polygon' | 'edit-shape';
export type PendingPoint = { lat: number; lng: number } | null;

export type MapState = {
  viewState: ViewState;
  mode: MapMode;
  pendingPoint: PendingPoint;
};

// 2. Definimos las nuevas acciones
export type MapActions = {
  setViewState: (newViewState: ViewState) => void;
  setMode: (mode: MapMode) => void;
  setPendingPoint: (point: PendingPoint) => void;
};

export type MapStore = MapState & MapActions;

// 3. Actualizamos el estado inicial
export const defaultInitialState: MapState = {
  viewState: {
    longitude: -58.3816,
    latitude: -34.6037,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  },
  mode: 'browse', // El modo inicial es "navegar"
  pendingPoint: null, // No hay ningún punto temporal
};

// 4. Creamos la "fábrica" de stores
export const createMapStore = (
  initState: MapState = defaultInitialState,
) => {
  return createStore<MapStore>()((set) => ({
    ...initState,

    // Acciones
    setViewState: (newViewState) => set({ viewState: newViewState }),
    setMode: (mode) => set({ mode }),
    setPendingPoint: (point) => set({ pendingPoint: point }),
  }));
};

