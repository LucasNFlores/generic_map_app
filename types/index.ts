// types/index.ts

// --- 1. CONFIGURACIÓN DINÁMICA DE FORMULARIOS ---

export type FormFieldType = 'auto_id' | 'text' | 'number' | 'select' | 'boolean' | 'date';

export interface FormFieldDefinition {
    id: string;
    label: string;
    type: FormFieldType;
    options?: string[]; // Solo para tipo 'select'
    required?: boolean;
    visible?: boolean; // Solo para tipo 'auto_id' - define si se muestra en la UI
    placeholder?: string;
    defaultValue?: any;
}

// --- 2. TIPOS BASE DE LA BASE DE DATOS ---

export type ShapeType = 'point' | 'line' | 'polygon';
export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'invited';

// Interfaz para la tabla 'categories'
export interface Category {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string;
    fields_definition: FormFieldDefinition[];
    created_at: string;
}

// Interfaz para la tabla 'points'
export interface Point {
    id: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

// Interfaz para la tabla 'shapes' (Actualizada)
export interface Shape {
    id: string;
    category_id: string | null;
    type: ShapeType;
    name: string | null;
    description: string | null;
    location_address: string | null;

    // Metadata dinámica según la definición de la categoría
    metadata: Record<string, any>;

    creator_id: string;
    created_at: string;
    updated_at: string;
}

// Interfaz para la tabla 'profiles'
export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: UserRole;
    config: Record<string, any>;
    updated_at: string;
}

// --- 3. PAYLOADS Y RESPUESTAS DE API ---

export interface CreateShapePayload {
    category_id: string;
    type: ShapeType;
    name?: string;
    description?: string;
    location_address?: string;
    metadata: Record<string, any>;
    points: Array<{ latitude: number; longitude: number }>;
}

export type ShapePointData = {
    latitude: number;
    longitude: number;
}

export interface ShapeWithPoints extends Shape {
    shape_points: {
        sequence_order: number;
        points: ShapePointData | null;
    }[];
    category?: Category; // Opcional si se hace join
}

// --- 4. TIPOS GEOJSON PARA EL MAPA ---

export type GeoJsonGeometry = {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates:
    | [number, number]
    | [number, number][]
    | Array<Array<[number, number]>>;
};

export type GeoJsonFeature = {
    type: 'Feature';
    geometry: GeoJsonGeometry;
    properties: Shape & { category?: Category };
};

export type GeoJsonFeatureCollection = {
    type: 'FeatureCollection';
    features: GeoJsonFeature[];
};
