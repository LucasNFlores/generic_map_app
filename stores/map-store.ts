import { createStore } from 'zustand/vanilla';
import type { ViewState } from 'react-map-gl/maplibre';
import type { ShapeWithPoints, Category } from '@/types';

// --- Definiciones de Estado ---
// 1. Añadimos el nuevo modo 'edit-shape'
export type MapMode = 'browse' | 'add-point' | 'add-line' | 'add-polygon' | 'edit-shape';
export type PendingPoints = Array<{ lat: number; lng: number }>;


// --- 1. MapState (Actualizado) ---
export type MapState = {
	viewState: ViewState;
	mode: MapMode;
	pendingPoints: PendingPoints;
	shapes: ShapeWithPoints[];
	categories: Category[]; // Nuevo: Lista de categorías dinámicas
	selectedCategory: Category | null; // Nuevo: Categoría seleccionada para creación
	isLoadingShapes: boolean;
	isLoadingCategories: boolean;
	// 2. Añadimos el estado para la shape seleccionada
	selectedShape: ShapeWithPoints | null;
};

// --- 2. MapActions (Actualizado) ---
export type MapActions = {
	setViewState: (newViewState: ViewState) => void;
	setMode: (mode: MapMode) => void;

	setPendingPoints: (points: PendingPoints) => void;
	addPendingPoint: (point: { lat: number; lng: number }) => void;
	clearPendingPoints: () => void;

	fetchShapes: () => Promise<void>;
	fetchCategories: () => Promise<void>;
	setSelectedCategory: (category: Category | null) => void;
	// 3. Añadimos la acción para seleccionar una shape
	setSelectedShape: (shape: ShapeWithPoints | null) => void;
};

export type MapStore = MapState & MapActions;

// --- 3. Estado Inicial (Actualizado) ---
export const defaultInitialState: MapState = {
	viewState: {
		longitude: -54.6612, // Misiones
		latitude: -27.0055,  // Misiones
		zoom: 10,
		bearing: 0,
		pitch: 0,
		padding: { top: 0, bottom: 0, left: 0, right: 0 }
	},
	mode: 'browse',
	pendingPoints: [],
	shapes: [],
	categories: [],
	selectedCategory: null,
	isLoadingShapes: false,
	isLoadingCategories: false,
	selectedShape: null, // 4. Estado inicial nulo
};

export const createMapStore = (
	initState: MapState = defaultInitialState,
) => {
	return createStore<MapStore>()((set) => ({
		...initState,

		setViewState: (newViewState) => set({ viewState: newViewState }),
		setMode: (mode) => set({ mode }),
		fetchShapes: async () => {
			// ... (tu lógica de fetch existente)
			try {
				set({ isLoadingShapes: true });
				const response = await fetch('/api/shapes');
				if (!response.ok) {
					throw new Error('Error al obtener las formas');
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

		fetchCategories: async () => {
			try {
				set({ isLoadingCategories: true });
				const response = await fetch('/api/categories');
				if (!response.ok) throw new Error('Error al obtener categorías');
				const data: Category[] = await response.json();
				set({ categories: data });
				if (data.length > 0 && !initState.selectedCategory) {
					set({ selectedCategory: data[0] });
				}
			} catch (error) {
				console.error('fetchCategories error:', error);
				set({ categories: [] });
			} finally {
				set({ isLoadingCategories: false });
			}
		},

		setSelectedCategory: (category) => set({ selectedCategory: category }),

		// --- ACCIONES DE PUNTOS PENDIENTES ---
		setPendingPoints: (points) => set({ pendingPoints: points }),
		addPendingPoint: (point) => set((state) => ({
			pendingPoints: [...state.pendingPoints, point]
		})),
		clearPendingPoints: () => set({ pendingPoints: [] }),

		// 5. Implementación de la nueva acción
		setSelectedShape: (shape) => set({ selectedShape: shape, mode: shape ? 'edit-shape' : 'browse' }),
	}));
};