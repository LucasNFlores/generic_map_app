// stores/map-store.ts
import { createStore } from 'zustand/vanilla';
import type { ViewState } from 'react-map-gl/maplibre';
import type { ShapeWithPoints } from '@/types';

// --- Definiciones de Estado  ---
export type MapMode = 'browse' | 'add-point' | 'add-line' | 'add-polygon' | 'edit-shape';
export type PendingPoints = Array<{ lat: number; lng: number }>;


// --- 1. MapState ---
export type MapState = {
	viewState: ViewState;
	mode: MapMode;
	pendingPoints: PendingPoints;
	shapes: ShapeWithPoints[]; // Para guardar las formas de la DB
	isLoadingShapes: boolean; // Para saber si estamos cargando
};

// --- 2. MapActions ---
export type MapActions = {
	setViewState: (newViewState: ViewState) => void;
	setMode: (mode: MapMode) => void;

	setPendingPoints: (points: PendingPoints) => void;
	addPendingPoint: (point: { lat: number; lng: number }) => void;
	clearPendingPoints: () => void;

	fetchShapes: () => Promise<void>; // Acción para llamar a la API
};

export type MapStore = MapState & MapActions;

// --- 3. Estado Inicial ---
export const defaultInitialState: MapState = {
	viewState: {
		longitude: -58.3816, // Coordenadas de Buenos Aires
		latitude: -34.6037,
		zoom: 12,
		bearing: 0,
		pitch: 0,
		padding: { top: 0, bottom: 0, left: 0, right: 0 }
	},
	mode: 'browse',
	pendingPoints: [],
	shapes: [],
	isLoadingShapes: false, // No estamos cargando al inicio
};

export const createMapStore = (
	initState: MapState = defaultInitialState,
) => {
	return createStore<MapStore>()((set) => ({
		...initState,

		setViewState: (newViewState) => set({ viewState: newViewState }),
		setMode: (mode) => set({ mode }),
		fetchShapes: async () => {

			try {
				set({ isLoadingShapes: true });
				const response = await fetch('/api/shapes');
				if (!response.ok) {
					const err = await response.json();
					throw new Error(err.error || 'Error al obtener las formas');
				}
				const data: ShapeWithPoints[] = await response.json();
				set({ shapes: data });
			} catch (error) {
				console.error('fetchShapes error:', error);
				set({ shapes: [] });
			} finally {
				set({ isLoadingShapes: false });
			}
		},

		// --- ACCIONES ACTUALIZADAS ---
		setPendingPoints: (points) => set({ pendingPoints: points }),

		// Añade un punto al array existente (para líneas/polígonos)
		addPendingPoint: (point) => set((state) => ({
			pendingPoints: [...state.pendingPoints, point]
		})),

		// Limpia todos los puntos pendientes (para el botón Cancelar)
		clearPendingPoints: () => set({ pendingPoints: [] }),
	}));
};

