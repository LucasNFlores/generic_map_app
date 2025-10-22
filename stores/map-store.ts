// stores/map-store.ts

import { createStore } from 'zustand/vanilla';
// Importamos el tipo oficial de react-map-gl
import type { ViewState } from 'react-map-gl/maplibre';

// 1. Definimos el estado
export type MapState = {
  viewState: ViewState;
  // Aquí podrás agregar más cosas, como tus datos de GeoJSON
  // geojsonData: FeatureCollection | null; 
};

// 2. Definimos las acciones
export type MapActions = {
  setViewState: (newViewState: ViewState) => void;
  // fetchGeojsonData: () => Promise<void>;
};

// 3. Combinamos estado y acciones
export type MapStore = MapState & MapActions;

// 4. Definimos el estado inicial
export const defaultInitialState: MapState = {
  viewState: {
    longitude: -58.3816, // Coordenadas de Buenos Aires
    latitude: -34.6037,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  },
  // geojsonData: null,
};

// 5. Creamos la "fábrica" de stores
export const createMapStore = (
  initState: MapState = defaultInitialState,
) => {
  return createStore<MapStore>()((set) => ({
    ...initState,

    // Acción para actualizar el viewState
    setViewState: (newViewState) => set({ viewState: newViewState }),

    // Ejemplo de cómo agregarías una acción para tus datos
    // fetchGeojsonData: async () => {
    //   const data = await fetch('/api/shapes').then(res => res.json());
    //   set({ geojsonData: data });
    // }
  }));
};