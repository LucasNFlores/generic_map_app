// app/api/shapes/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateShapePayload, FormFieldDefinition } from '@/types';
import { getNextIdForCategory } from '@/lib/auto-id-generator';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload: CreateShapePayload = await request.json();

        // Validación básica (mínima para no bloquear la flexibilidad)
        if (!payload.type || !payload.points || !payload.category_id) {
            return NextResponse.json({ error: 'category_id, type and points are required.' }, { status: 400 });
        }

        // Obtener la categoría para procesar campos auto_id
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('fields_definition')
            .eq('id', payload.category_id)
            .single();

        if (catError) {
            console.error('Error fetching category:', catError);
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Procesar campos auto_id
        const metadata = payload.metadata ?? {};
        const fieldsDefinition = (category.fields_definition as FormFieldDefinition[]) ?? [];

        for (const field of fieldsDefinition) {
            if (field.type === 'auto_id') {
                // Generar el siguiente ID para este campo
                const nextId = await getNextIdForCategory(payload.category_id, field.id);
                metadata[field.id] = nextId;
            }
        }

        // Llamar a la función RPC actualizada con metadata completa
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_shape_with_points', {
            p_category_id: payload.category_id,
            p_shape_type: payload.type,
            p_name: payload.name ?? null,
            p_description: payload.description ?? null,
            p_location_address: payload.location_address ?? null,
            p_metadata: metadata,
            p_points_data: payload.points
        });

        if (rpcError) {
            console.error('API Shapes POST: RPC error:', rpcError);
            return NextResponse.json({ error: rpcError.message || 'Database error' }, { status: 500 });
        }

        return NextResponse.json(rpcData, { status: 201 });

    } catch (error) {
        console.error('API Shapes POST: Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    const supabase = await createClient();

    try {
        // Obtenemos shapes, sus puntos y su categoría asociada
        const { data, error } = await supabase
            .from('shapes')
            .select(`
                *,
                category:categories (*),
                shape_points (
                    sequence_order,
                    points (
                        latitude,
                        longitude
                    )
                )
            `)
            .order('sequence_order', { foreignTable: 'shape_points' });

        if (error) {
            console.error('API Shapes GET: Database error:', error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Shapes GET: Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
