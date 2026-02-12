import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // 1. Check if user is admin or superadmin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Prohibido: Se requiere rol de administrador' }, { status: 403 });
    }

    try {
        // 2. Fetch existing profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (profilesError) throw profilesError;

        // 3. Fetch pending invitations
        const { data: invitations, error: invitationsError } = await supabase
            .from('invitations')
            .select('*')
            .order('created_at', { ascending: false });

        if (invitationsError) throw invitationsError;

        return NextResponse.json({
            users: profiles,
            invitations: invitations
        });

    } catch (error: any) {
        console.error('API Admin Users GET:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Check if user is admin or superadmin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Prohibido: Se requiere rol de administrador' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { email, role } = body;

        if (!email || !role) {
            return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 });
        }

        // 2. Insert invitation
        const { data, error } = await supabase
            .from('invitations')
            .insert([{
                email,
                role,
                invited_by: user.id
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Este usuario ya tiene una invitación pendiente' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API Admin Users POST:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const supabase = await createClient();

    // 1. Check if user is admin or superadmin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Prohibido: Se requiere rol de administrador' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, first_name, last_name, role } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de usuario es requerido' }, { status: 400 });
        }

        // 2. Update profile
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: first_name || null,
                last_name: last_name || null,
                role: role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Admin Users PUT:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
