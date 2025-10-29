'use client';

// 1. Importamos los nuevos componentes y hooks necesarios
import Map, { Marker, type MapLayerMouseEvent, Source, Layer } from 'react-map-gl/maplibre';
import { useMapStore } from '@/providers/map-store-provider';
import type { ViewStateChangeEvent, CircleLayerSpecification, LineLayerSpecification, FillLayerSpecification } from 'react-map-gl/maplibre'; // Importamos tipos para las capas
import { useCallback, useEffect, useMemo } from 'react'; // Importamos useEffect y useMemo
import { Container } from './buttons/Container';
import AddPoint from './buttons/AddPoint';
import CancelAddPoint from './buttons/CancelAddPoint';
import type { MapStore } from '@/stores/map-store';
import type { ShapeWithPoints, GeoJSONFeature, GeoJSONFeatureCollection } from '@/types'; // Importamos nuestros tipos GeoJSON

// --- COMPONENTES INTERNOS ---

// Marcador temporal (cuando se está añadiendo un punto)
function TemporaryMarker() {
    return (
        <div style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)' // Centrado CSS
        }}
            className="w-4 h-4 bg-pink-600 border-2 border-white rounded-full cursor-pointer" />
    );
}

// (Este componente no se usa, pero lo dejamos como estaba en tu archivo)
function PointBetweenMarkers() {
    return (
        <div className="w-2 h-2 bg-pink-600 border-2 border-white rounded-full" />
    );
}

// --- COMPONENTE PRINCIPAL ---

export default function MapComponent() {
    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- HOOKS DE ZUSTAND (SEPARADOS PARA EVITAR BUCLES) ---
    // (Esta es la corrección para el error 'Maximum update depth exceeded')

    // Estado de la vista del mapa
    const viewState = useMapStore((state: MapStore) => state.viewState);
    const setViewState = useMapStore((state: MapStore) => state.setViewState);

    // Estado del modo de edición
    const mode = useMapStore((state: MapStore) => state.mode);
    const pendingPoint = useMapStore((state: MapStore) => state.pendingPoint);
    const setPendingPoint = useMapStore((state: MapStore) => state.setPendingPoint);

    // Estado de carga de datos (Paso 4)
    const shapes = useMapStore((state: MapStore) => state.shapes);
    const isLoadingShapes = useMapStore((state: MapStore) => state.isLoadingShapes);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);


    // --- HOOKS DE REACT ---

    // 2. Llamamos a fetchShapes() solo una vez, cuando el componente se monta
    useEffect(() => {
        fetchShapes();
    }, [fetchShapes]); // fetchShapes es estable, por lo que esto solo se ejecuta al inicio


    // Callbacks existentes (para mover el mapa y hacer clic)
    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
    }, [setViewState]);

    const handleMapClick = useCallback((evt: MapLayerMouseEvent) => {
        if (mode === 'add-point') {
            const { lng, lat } = evt.lngLat;
            setPendingPoint({ lng, lat });
        }
    }, [mode, setPendingPoint]);


    // 3. Convertimos los datos de la API (shapes) a GeoJSON (para el mapa)
    // Usamos useMemo para que esta conversión solo se ejecute si el array 'shapes' cambia.
    const geojson = useMemo(() => {
        const features: GeoJSONFeature[] = shapes.map((shape: ShapeWithPoints) => {
            // Mapeamos los puntos a coordenadas [lng, lat]
            const coordinates = shape.shape_points
                .sort((a, b) => a.sequence_order - b.sequence_order) // Aseguramos el orden
                .map(sp => [sp.points.longitude, sp.points.latitude]);

            let geometry: GeoJSONFeature['geometry'];

            if (shape.type === 'point') {
                geometry = {
                    type: 'Point',
                    coordinates: coordinates[0] || [0, 0] // Un punto
                };
            } else if (shape.type === 'line') {
                geometry = {
                    type: 'LineString',
                    coordinates: coordinates // Un array de puntos
                };
            } else { // 'polygon'
                // Un polígono de GeoJSON debe estar "cerrado" (el primer y último punto son iguales)
                if (coordinates.length > 2 &&
                    (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
                        coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
                    coordinates.push(coordinates[0]); // Cerramos el polígono
                }
                geometry = {
                    type: 'Polygon',
                    coordinates: [coordinates] // Los polígonos van envueltos en un array extra
                };
            }

            return {
                type: 'Feature',
                geometry: geometry,
                properties: { // Aquí pasamos datos extra (el id, nombre, y nuestro 'type' interno)
                    id: shape.id,
                    name: shape.name,
                    type: shape.type // Usamos esto para filtrar las capas
                }
            };
        });

        return {
            type: 'FeatureCollection',
            features: features
        };
    }, [shapes]); // Esta función solo se re-ejecuta si 'shapes' cambia


    // 4. Definimos los estilos para las capas GeoJSON
    // (Usamos 'as any' para simplificar los tipos, puedes importar los tipos de MapLibre si prefieres)
    const pointLayerStyle: any = {
        id: 'shapes-points',
        type: 'circle',
        filter: ['==', ['get', 'type'], 'point'], // Solo renderiza si la propiedad 'type' es 'point'
        paint: {
            'circle-radius': 6,
            'circle-color': '#E91E63' // Mismo color rosa/pink de tu marcador
        }
    };
    const lineLayerStyle: any = {
        id: 'shapes-lines',
        type: 'line',
        filter: ['==', ['get', 'type'], 'line'],
        paint: {
            'line-color': '#E91E63',
            'line-width': 3
        }
    };
    const polygonLayerStyle: any = {
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
                cursor={mode === 'add-point' ? 'pointer' : 'grab'}
                style={{ width: '100%', minWidth: "90vw", height: '100%', minHeight: '400px' }}
                mapStyle={mapStyle}
            >
                {/* 5. Renderizamos las formas cargadas desde la API */}
                <Source id="my-shapes" type="geojson" data={geojson}>
                    <Layer {...pointLayerStyle} />
                    <Layer {...lineLayerStyle} />
                    <Layer {...polygonLayerStyle} />
                </Source>

                {/* Marcador temporal para añadir punto */}
                {pendingPoint && (
                    <Marker
                        longitude={pendingPoint.lng}
                        latitude={pendingPoint.lat}
                        anchor="center"
                    >
                        <TemporaryMarker />
                    </Marker>
                )}

                {/* Indicador de carga */}
                {isLoadingShapes && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded shadow-md z-10">
                        Cargando formas...
                    </div>
                )}

                {/* Botones de control */}
                <Container>
                    <AddPoint />
                    <CancelAddPoint />
                </Container>

            </Map>
        </div>
    );
}

