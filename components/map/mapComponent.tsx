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
import CancelAddPoints from './buttons/CancelAddPoints';
import type { MapStore } from '@/stores/map-store';
import type { ShapeWithPoints, GeoJsonFeature, GeoJsonFeatureCollection, GeoJsonGeometry } from '@/types'; // Importamos GeoJsonGeometry

// --- COMPONENTE INTERNO ---

function TemporaryMarker() {
    return (
        <div style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)'
        }}
            className="w-4 h-4 bg-pink-600 border-2 border-white rounded-full cursor-pointer" />
    );
}

// --- SOLUCIÓN A LOS ERRORES DE TIPO "source" ---
// Creamos tipos locales que son idénticos a los de MapLibre, pero sin la propiedad 'source'
type LayerStyleProps<T> = Omit<T, 'source'>;
// ------------------------------------------

// --- COMPONENTE PRINCIPAL ---

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- HOOKS DE ZUSTAND (SEPARADOS) ---
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

    // Convertimos los datos de la API (shapes) a GeoJSON (para el mapa)
    const geojson = useMemo(() => {

        const features: GeoJsonFeature[] = shapes.map((shape: ShapeWithPoints) => {

            const validShapePoints = shape.shape_points.filter(sp => sp.points !== null);

            // Le decimos a TypeScript que el resultado de este map es un array de tuplas [number, number]
            const coordinates: [number, number][] = validShapePoints
                .sort((a, b) => a.sequence_order - b.sequence_order)
                .map(sp => [sp.points!.longitude, sp.points!.latitude] as [number, number]); // Cast explícito

            let geometry: GeoJsonGeometry;

            if (shape.type === 'point') {
                geometry = {
                    type: 'Point',
                    // Le decimos a TypeScript que este fallback también es una tupla
                    coordinates: coordinates[0] || [0, 0] as [number, number]
                };
            } else if (shape.type === 'line') {
                geometry = {
                    type: 'LineString',
                    coordinates: coordinates // Esto ahora es [number, number][] y coincide
                };
            } else { // 'polygon'
                if (coordinates.length > 2 &&
                    (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
                        coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
                    coordinates.push(coordinates[0]);
                }
                geometry = {
                    type: 'Polygon',
                    coordinates: [coordinates] // Esto ahora es [[number, number][]] y coincide
                };
            }
            // --------------------------------------------

            return {
                type: 'Feature',
                geometry: geometry,
                properties: shape
            };
        });

        const featureCollection: GeoJsonFeatureCollection = {
            type: 'FeatureCollection',
            features: features
        };


        return featureCollection;
    }, [shapes]);


    // 4. Definimos los estilos para las capas GeoJSON
    // Usamos nuestros tipos 'Omit' para que no pidan la propiedad 'source'
    const pointLayerStyle: LayerStyleProps<CircleLayerSpecification> = {
        id: 'shapes-points',
        type: 'circle',
        filter: ['==', ['get', 'type'], 'point'],
        paint: {
            'circle-radius': 6,
            'circle-color': '#E91E63'
        }
    };
    const lineLayerStyle: LayerStyleProps<LineLayerSpecification> = {
        id: 'shapes-lines',
        type: 'line',
        filter: ['==', ['get', 'type'], 'line'],
        paint: {
            'line-color': '#E91E63',
            'line-width': 3
        }
    };
    const polygonLayerStyle: LayerStyleProps<FillLayerSpecification> = {
        id: 'shapes-polygons',
        type: 'fill',
        filter: ['==', ['get', 'type'], 'polygon'],
        paint: {
            'fill-color': '#E91E63',
            'fill-opacity': 0.4,
            'fill-outline-color': '#E91E63'
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
                {/* Renderizamos las formas cargadas desde la API */}
                <Source
                    id="my-shapes"
                    type="geojson"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={geojson as any}
                // Mantenemos los estilos que tenías
                >
                    <Layer {...pointLayerStyle} />
                    <Layer {...lineLayerStyle} />
                    <Layer {...polygonLayerStyle} />
                </Source>

                {/* Renderizamos los marcadores temporales */}
                {pendingPoints.map((point, index) => (
                    <Marker
                        key={index}
                        longitude={point.lng}
                        latitude={point.lat}
                        anchor="center"
                    >
                        <TemporaryMarker />
                    </Marker>
                ))}

                {isLoadingShapes && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded shadow-md z-10">
                        Cargando formas...
                    </div>
                )}

                <Container>
                    <AddPoint />
                    <CancelAddPoints />
                </Container>

            </Map>
        </div>
    );
}

