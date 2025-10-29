// types/index.ts

// Tipos ENUM basados en tu base de datos
export type ShapeType = 'point' | 'line' | 'polygon';
export type UserRole = 'superadmin' | 'admin' | 'supervisor' | 'invited';

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
    first_name: string | null; // Añadido basado en tu último SQL
    last_name: string | null;  // Añadido basado en tu último SQL
}

// Interfaz extendida que podrías usar en el frontend, combinando Shape y sus Points
export interface ShapeWithPoints extends Shape {
    points: Point[]; // O Array<{ latitude: number, longitude: number }> si prefieres
}

// Interfaz para el payload que espera tu API POST /api/shapes
// (La movimos desde route.ts para reutilizarla)
export interface CreateShapePayload {
    type: ShapeType;
    name?: string;
    description?: string;
    // Ojo: La API espera { latitude, longitude }, no el objeto Point completo
    points: Array<{ latitude: number; longitude: number }>;
}
