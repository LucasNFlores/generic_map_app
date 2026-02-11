import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('map_configuration')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Is SuperAdmin (Double check in API, RLS also handles this but good to fail fast)
    // We can query custom claim or profile, but RLS is safer source of truth.
    // However, to return 403 explicitly before DB try:
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden: SuperAdmin access required' }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Validate basic structure if needed
        // For JSONB fields like role_overrides, we trust the admin input or add schema validation library (zod) later.

        const { error } = await supabase
            .from('map_configuration')
            .update({
                mapbox_style: body.mapbox_style,
                initial_position_mode: body.initial_position_mode,
                default_center: body.default_center,
                role_overrides: body.role_overrides,
                enabled_controls: body.enabled_controls,
                allowed_shapes: body.allowed_shapes,
                min_zoom: body.min_zoom,
                max_zoom: body.max_zoom,
                updated_at: new Date().toISOString()
            })
            .eq('is_active', true);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
