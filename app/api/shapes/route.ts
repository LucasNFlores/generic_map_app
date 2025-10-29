import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Importamos el tipo específico desde nuestro archivo centralizado de tipos
import type { CreateShapePayload } from '@/app/types';

// Ya no necesitamos la interfaz inline porque la importamos desde @/types
// interface CreateShapePayload { ... }


export async function POST(request: Request) {

    const supabase = await createClient();

    // 1. Verificar si el usuario está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('API Shapes POST: Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Obtener y validar el cuerpo de la petición
        // Ahora usamos el tipo importado
        const payload: CreateShapePayload = await request.json();

        // Validación básica (puedes añadir más con librerías como Zod)
        if (!payload.type || !payload.points || !Array.isArray(payload.points) || payload.points.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: type and points array are required.' }, { status: 400 });
        }
        // Validar coordenadas dentro del array points
        for (const point of payload.points) {
            if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
                return NextResponse.json({ error: 'Invalid point data: latitude and longitude must be numbers.' }, { status: 400 });
            }
        }


        // 3. Llamar a la función RPC de PostgreSQL
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_shape_with_points', {
            // Pasamos los argumentos que espera la función SQL
            shape_type: payload.type,
            shape_name: payload.name ?? null, // Usar null si no viene
            shape_description: payload.description ?? null,
            points_data: payload.points // El array de puntos se pasa directamente
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
        console.log('API Shapes POST: Shape created successfully:', rpcData);
        // Usamos status 201 Created para indicar que se creó un recurso
        return NextResponse.json(rpcData, { status: 201 });

    } catch (error) {
        console.error('API Shapes POST: Unexpected error:', error);
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        // Manejo de errores genéricos (ej: JSON mal formado)
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const supabase = await createClient(); // Creamos cliente (puede ser anónimo o auth)

    try {
        // 1. Intentamos obtener las shapes
        // La consulta respeta las RLS definidas en Supabase.
        // Si no hay RLS o permiten SELECT a anónimos/autenticados, devolverá datos.
        const { data: shapes, error } = await supabase
            .from('shapes')
            .select('*') // Selecciona todas las columnas de la tabla 'shapes'
            .order('created_at', { ascending: false }); // Opcional: ordenar por fecha

        // 2. Manejar errores de la base de datos
        if (error) {
            console.error('API Shapes GET: Database error:', error);
            // Puede ser un error de RLS si el usuario no tiene permiso
            return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
        }

        // 3. Éxito: Devolver las shapes encontradas
        return NextResponse.json(shapes);

    } catch (error) {
        console.error('API Shapes GET: Unexpected error:', error);
        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

