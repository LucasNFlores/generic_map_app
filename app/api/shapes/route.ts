// app/api/shapes/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Importa desde /lib
import type { CreateShapePayload } from '@/types'; // Importa el tipo desde /types

export async function POST(request: Request) {
    // 1. Crear cliente y verificar autenticación
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('API Shapes POST: Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Obtener y validar el cuerpo de la petición
        const payload: CreateShapePayload = await request.json();

        // Validación básica
        if (!payload.type || !payload.points || !Array.isArray(payload.points) || payload.points.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: type and points array are required.' }, { status: 400 });
        }
        for (const point of payload.points) {
            if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                return NextResponse.json({ error: 'Invalid point data: latitude and longitude must be numbers.' }, { status: 400 });
            }
        }

        // 3. Llamar a la función RPC de PostgreSQL
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_shape_with_points', {
            shape_type: payload.type,
            shape_name: payload.name ?? null,
            shape_description: payload.description ?? null,
            points_data: payload.points
        });

        // 4. Manejar errores de la función RPC
        if (rpcError) {
            console.error('API Shapes POST: RPC error:', rpcError);
            // Si el error viene de nuestra validación dentro de la función SQL
            // @ts-expect-error (Aunque nuestra función RPC actual no devuelve rpcData.error en caso de rpcError, lo dejamos por si acaso)
            if (rpcData && rpcData.error) { // @ts-expect-error rpcData suele contener una propiedad 'error' 
                return NextResponse.json({ error: rpcData.error }, { status: 400 });
            }
            // Otro error inesperado de la base de datos
            return NextResponse.json({ error: rpcError.message || 'Database error' }, { status: 500 });
        }

        // Si la función RPC devuelve un objeto con la clave 'error' (nuestras validaciones internas de la función SQL)
        if (rpcData && rpcData.error) {
            console.error('API Shapes POST: RPC validation error:', rpcData.error);
            return NextResponse.json({ error: rpcData.error }, { status: 400 });
        }

        // 5. Éxito: Devolver la nueva shape creada
        return NextResponse.json(rpcData, { status: 201 });

    } catch (error) {
        console.error('API Shapes POST: Unexpected error:', error);
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    // Creamos un cliente (puede ser anónimo o auth, RLS lo manejará)
    const supabase = await createClient();

    try {
        // 1. Intentamos obtener las shapes con sus puntos anidados
        // Esta consulta le dice a Supabase que:
        // 1. Seleccione todas las columnas de 'shapes' (*).
        // 2. Para cada shape, traiga todas las 'shape_points' relacionadas.
        // 3. Para cada 'shape_point', traiga el 'points' (lat, lng) relacionado.
        // 4. Ordene los 'shape_points' por 'sequence_order' para dibujar en orden.

        const { data, error } = await supabase
            .from('shapes')
            .select(`
                *,
                shape_points (
                    sequence_order,
                    points (
                        latitude,
                        longitude
                    )
                )
            `)
            .order('sequence_order', { foreignTable: 'shape_points' }); // Ordena los puntos anidados


        if (error) {
            console.error('API Shapes GET: Database error:', error);
            throw error; // Pasa al bloque catch
        }

        // 2. Éxito: Devolver los datos
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Shapes GET: Unexpected error:', error);
        // @ts-expect-error No tenglo la estructura del error asegurada
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

