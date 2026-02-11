import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const supabase = await createClient();

    // 1. Auth & Role check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!adminProfile || !['admin', 'superadmin'].includes(adminProfile.role)) {
        return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { role } = body;

        if (!role) {
            return NextResponse.json({ error: 'Rol es requerido' }, { status: 400 });
        }

        // 2. Update user role
        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API Admin User PATCH:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const supabase = await createClient();

    // 1. Auth & SuperAdmin check (Deleting users is dangerous)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!adminProfile || adminProfile.role !== 'superadmin') {
        return NextResponse.json({ error: 'Prohibido: Se requiere rol de SuperAdministrador para eliminar usuarios' }, { status: 403 });
    }

    if (id === user.id) {
        return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
    }

    try {
        // Delete profile (trigger ensures cleanup or DB handles cascade if set up)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Note: This only deletes from our 'profiles' table. 
        // We might need Supabase Admin SDK to delete from auth.users if needed.
        // For now, we just remove the access via profile deletion if RLS depends on it.

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Admin User DELETE:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
