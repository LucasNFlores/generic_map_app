// app/api/shapes/[id]/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Definimos los parámetros que esperamos en la URL
interface RouteParams {
    params: {
        id: string;
    };
}

export async function PATCH(request: Request, { params }: RouteParams) {
    // 1. Autenticación 
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('API Shapes PATCH: Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener el ID de la URL
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Shape ID is required' }, { status: 400 });
    }

    try {
        // 3. Obtener los datos del formulario desde el body
        const body = await request.json();

        // Validación simple: no podemos actualizar una shape sin datos
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: 'Payload is empty' }, { status: 400 });
        }

        // 4. Actualizar la shape en Supabase
        const { data: updatedData, error: updateError } = await supabase
            .from('shapes')
            .update({
                name: body.name,
                description: body.description,
                location_address: body.location_address,
                metadata: body.metadata, // Soporte para campos dinámicos de categorías
                // (No actualizamos 'type', 'id' o 'creator_id', etc.)
            })
            .eq('id', id)  // Donde el ID coincida
            .select()       // Devuélveme la fila actualizada
            .single();      // Esperamos solo un resultado

        if (updateError) {
            console.error('API Shapes PATCH: Database error:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updatedData, { status: 200 });

    } catch (error) {
        console.error('API Shapes PATCH: Unexpected error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// Implementamos la función DELETE
export async function DELETE(request: Request, { params }: RouteParams) {
    // 1. Obtener el ID de la URL
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Shape ID is required' }, { status: 400 });
    }

    // 2. Autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('API Shapes DELETE: Auth error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 3. Intentar borrar la shape
        // RLS se encargará de la autorización. Si el 'user' actual
        // no es el 'creator_id' (o lo que sea que defina tu política),
        // esto fallará o no borrará nada, lo cual es perfecto.
        const { error: deleteError } = await supabase
            .from('shapes')
            .delete()
            .eq('id', id); // Borra la fila donde el 'id' coincida

        if (deleteError) {
            console.error('API Shapes DELETE: Database error:', deleteError);
            // Podría ser un error de RLS (permiso denegado) o un UUID mal formado
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // 4. Éxito
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('API Shapes DELETE: Unexpected error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}