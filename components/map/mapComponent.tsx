'use client';

// 1. Importamos los nuevos componentes y tipos necesarios
import Map, {
    Marker,
    type MapLayerMouseEvent,
    Source,
    Layer,
    type CircleLayerSpecification,
    type LineLayerSpecification,
    type FillLayerSpecification,
} from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent } from 'react-map-gl/maplibre';
import { useCallback, useEffect, useMemo } from 'react';
import { Container } from './buttons/Container';
import AddPoint from './buttons/AddPoint';
import AddLine from './buttons/AddLine';
import CancelAddPoint from './buttons/CancelAddPoints';
import type { MapStore } from '@/stores/map-store';
import type { Shape, ShapeWithPoints, GeoJsonFeature, GeoJsonFeatureCollection, GeoJsonGeometry } from '@/types'; // Importamos GeoJsonGeometry

// --- COMPONENTES INTERNOS PARA MARCADORES ---

// Marcador grande para el modo 'add-point'
function PendingPointMarker() {
    return (
        <div style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)'
        }}
            className="w-4 h-4 bg-pink-600 border-2 border-white rounded-full cursor-pointer" />
    );
}

// Marcador pequeño para los vértices de 'add-line' y 'add-polygon'
// function PendingVertexMarker() {
//     return (
//         <div style={{
//             position: 'absolute',
//             transform: 'translate(-50%, -50%)'
//         }}
//             className="w-2 h-2 bg-pink-600 border-2 border-white rounded-full cursor-pointer" />
//     );
// }
// ------------------------------------------

// --- SOLUCIÓN A LOS ERRORES DE TIPO "source" ---
type LayerStyleProps<T> = Omit<T, 'source'>;
// ------------------------------------------

// --- COMPONENTE PRINCIPAL ---

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- HOOKS DE ZUSTAND ---
    const viewState = useMapStore((state: MapStore) => state.viewState);
    const setViewState = useMapStore((state: MapStore) => state.setViewState);
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoints = useMapStore((state: MapStore) => state.pendingPoints);
    const setPendingPoints = useMapStore((state: MapStore) => state.setPendingPoints);
    const addPendingPoint = useMapStore((state: MapStore) => state.addPendingPoint);
    const shapes = useMapStore((state: MapStore) => state.shapes);
    const isLoadingShapes = useMapStore((state: MapStore) => state.isLoadingShapes);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    // --- HOOKS DE REACT ---
    useEffect(() => {
        fetchShapes();
    }, [fetchShapes]);

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);

    const handleMapClick = useCallback((evt: MapLayerMouseEvent) => {
        const { lng, lat } = evt.lngLat;

        if (mode === 'add-point') {
            setPendingPoints([{ lng, lat }]);
        }

        if (mode === 'add-line' || mode === 'add-polygon') {
            addPendingPoint({ lng, lat });
        }

    }, [mode, setPendingPoints, addPendingPoint]);


    // --- TRANSFORMACIÓN DE DATOS (useMemo) ---

    // 1. Convierte las formas (shapes) de la API a GeoJSON para las capas guardadas
    const savedShapesGeojson = useMemo(() => {
        const features: GeoJsonFeature[] = shapes.map((shape: ShapeWithPoints) => {
            const validShapePoints = shape.shape_points.filter(sp => sp.points !== null);
            const coordinates: [number, number][] = validShapePoints
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map(sp => [sp.points!.longitude, sp.points!.latitude] as [number, number]);

            let geometry: GeoJsonGeometry;
            // ... (lógica de 'point', 'line', 'polygon' que ya tenías)
            if (shape.type === 'point') {
                geometry = { type: 'Point', coordinates: coordinates[0] || [0, 0] as [number, number] };
            } else if (shape.type === 'line') {
                geometry = { type: 'LineString', coordinates: coordinates };
            } else { // 'polygon'
                if (coordinates.length > 2 && (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
                    coordinates.push(coordinates[0]);
                }
                geometry = { type: 'Polygon', coordinates: [coordinates] };
            }
            return { type: 'Feature', geometry: geometry, properties: shape };
        });
        return { type: 'FeatureCollection', features: features } as GeoJsonFeatureCollection;
    }, [shapes]);

    // 2. Convierte los puntos pendientes (pendingPoints) a GeoJSON para la previsualización
    const pendingPreviewGeojson = useMemo(() => {
        // Si no hay puntos o estamos en modo 'add-point' (que usa <Marker>), no dibujamos línea.
        if (pendingPoints.length < 2 || mode === 'add-point') {
            return null;
        }

        // Convertimos los puntos pendientes en coordenadas [lng, lat]
        const coordinates = pendingPoints.map(p => [p.lng, p.lat]) as [number, number][];

        // Si es un polígono, mostramos la línea de cierre
        if (mode === 'add-polygon') {
            coordinates.push(coordinates[0]); // Cierra el polígono
        }

        const feature: GeoJsonFeature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: {} as Shape
        };

        return {
            type: 'FeatureCollection',
            features: [feature]
        } as GeoJsonFeatureCollection;

    }, [pendingPoints, mode]);


    // --- ESTILOS DE CAPAS ---

    // Capas para las formas guardadas (color principal)
    const pointLayerStyle: LayerStyleProps<CircleLayerSpecification> = { id: 'shapes-points', type: 'circle', filter: ['==', ['get', 'type'], 'point'], paint: { 'circle-radius': 6, 'circle-color': '#E91E63' } };
    const lineLayerStyle: LayerStyleProps<LineLayerSpecification> = { id: 'shapes-lines', type: 'line', filter: ['==', ['get', 'type'], 'line'], paint: { 'line-color': '#E91E63', 'line-width': 3 } };
    const polygonLayerStyle: LayerStyleProps<FillLayerSpecification> = { id: 'shapes-polygons', type: 'fill', filter: ['==', ['get', 'type'], 'polygon'], paint: { 'fill-color': '#E91E63', 'fill-opacity': 0.4, 'fill-outline-color': '#E91E63' } };

    // (NUEVO) Estilo para la línea de previsualización (punteada)
    const pendingLineStyle: LayerStyleProps<LineLayerSpecification> = {
        id: 'pending-line-preview',
        type: 'line',
        paint: {
            'line-color': '#E91E63', // Mismo color rosa
            'line-width': 2,
            'line-dasharray': [2, 1] // Esto la hace punteada/dashed
        }
    };

    // --- RENDERIZADO ---

    if (!mapTilerKey) {
        console.error("MapTiler key no está configurada en .env.local");
        return <div>Error: Falta la API Key del mapa.</div>;
    }

    const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    return (
        <div id="mapContainer" className="relative px-5 rounded-s-3xl overflow-hidden h-[calc(100vh-6rem)]">
            <Map
                {...viewState}
                onMove={handleMove}
                onClick={handleMapClick}
                cursor={mode.startsWith('add-') ? 'pointer' : 'grab'}
                style={{ width: '100%', minWidth: "90vw", height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
            >
                {/* 1. Capas para las formas guardadas */}
                <Source
                    id="my-shapes"
                    type="geojson"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={savedShapesGeojson as any}
                >
                    <Layer {...pointLayerStyle} />
                    <Layer {...lineLayerStyle} />
                    <Layer {...polygonLayerStyle} />
                </Source>

                {/* 2. Capa para la LÍNEA de previsualización de AddLines */}
                {pendingPreviewGeojson && (
                    <Source
                        id="pending-preview-shape"
                        type="geojson"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data={pendingPreviewGeojson as any}
                    >
                        <Layer {...pendingLineStyle} />
                    </Source>
                )}

                {/* 3. (ACTUALIZADO) Marcadores temporales para los VÉRTICES */}
                {/* Marcador grande solo para 'add-point' */}
                {mode === 'add-point' && pendingPoints[0] && (
                    <Marker
                        longitude={pendingPoints[0].lng}
                        latitude={pendingPoints[0].lat}
                        anchor="center"
                    >
                        <PendingPointMarker />
                    </Marker>
                )}

                {/* Marcadores pequeños para 'add-line' y 'add-polygon' */}
                {(mode === 'add-line' || mode === 'add-polygon') && pendingPoints.map((point, index) => (
                    <Marker
                        key={index}
                        longitude={point.lng}
                        latitude={point.lat}
                        anchor="center"
                    >
                        <PendingPointMarker />
                    </Marker>
                ))}

                {/* Indicador de Carga */}
                {isLoadingShapes && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded shadow-md z-10">
                        Cargando formas...
                    </div>
                )}

                {/* Botones */}
                <Container>
                    <AddPoint />
                    <AddLine /> {/* Asegúrate de haber añadido este componente al 'Container' */}
                    <CancelAddPoint />
                </Container>

            </Map>
        </div>
    );
}

