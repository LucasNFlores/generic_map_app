// types/index.ts

export const WASTE_TYPES_LIST = [
    { value: 'vidrio', label: 'Vidrio' },
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel_carton', label: 'Papel/Cartón' },
    { value: 'organico', label: 'Orgánico' },
    { value: 'otro', label: 'Otro' },
] as const;

// Tipos ENUM basados en tu base de datos
export type ShapeType = 'point' | 'line' | 'polygon';
export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'invited';
export type WasteType = (typeof WASTE_TYPES_LIST)[number]['value'];

// Interfaz para la tabla 'points'
export interface Point {
    id: string; // uuid
    latitude: number;
    longitude: number;
    created_at: string; // timestamptz
}

// Interfaz para la tabla 'shapes'
export interface Shape {
    id: string; // uuid
    type: ShapeType;
    name: string | null;
    description: string | null;
    location_address: string | null;
    waste_type: WasteType | null;
    image_url: string | null; // (Para el futuro)

    creator_id: string; // uuid (FK a auth.users)
    created_at: string; // timestamptz

}

// Interfaz para la tabla 'shape_points' (relación)
export interface ShapePoint {
    shape_id: string; // uuid (FK a shapes)
    point_id: string; // uuid (FK a points)
    sequence_order: number; // integer
}

// Interfaz para la tabla 'profiles'
export interface Profile {
    id: string; // uuid (FK a auth.users)
    full_name: string | null;
    role: UserRole;
    config: Record<string, unknown> | null; // jsonb
    tutorials_switch: boolean;
    updated_at: string; // timestamptz
    first_name: string | null;
    last_name: string | null;
}

// Interfaz para el payload que espera tu API POST /api/shapes
export interface CreateShapePayload {
    type: ShapeType;
    name?: string;
    description?: string;
    location_address?: string;
    waste_type?: WasteType;

    points: Array<{ latitude: number; longitude: number }>;
}


// --- 1. NUEVOS TIPOS PARA LA RESPUESTA GET ---

// Tipo para un punto individual (que viene de la tabla 'points')
export type ShapePointData = {
    latitude: number;
    longitude: number;
}

// Tipo para la respuesta de nuestra API GET /api/shapes
// Coincide con la consulta de Supabase: shapes(*, shape_points(*, points(*)))
export interface ShapeWithPoints extends Shape {
    shape_points: {
        sequence_order: number;
        points: ShapePointData | null; // El 'point' anidado
    }[];
}


// --- 2. NUEVOS TIPOS PARA GEOJSON (Frontend) ---

// Tipo para la geometría de GeoJSON
export type GeoJsonGeometry = {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates:
    | [number, number] // Point: [lng, lat]
    | [number, number][] // LineString: Array<[lng, lat]>
    | Array<Array<[number, number]>>; // Polygon: Array<Array<[lng, lat]>> (array of linear rings)
};

// Una 'Feature' de GeoJSON combina la geometría con las propiedades
export type GeoJsonFeature = {
    type: 'Feature';
    geometry: GeoJsonGeometry;
    properties: Shape; // Guardamos la 'Shape' original en las propiedades
};

// Una colección de 'Features'
export type GeoJsonFeatureCollection = {
    type: 'FeatureCollection';
    features: GeoJsonFeature[];
};

