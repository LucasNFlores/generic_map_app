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
            .from('theme_settings')
            .select('*')
            .eq('is_active', true)
            .maybeSingle(); // Use maybeSingle() as it might be empty initially

        if (error) throw error;

        // If no theme exists, return null or default structure. 
        // Frontend handles null by using default CSS.
        return NextResponse.json(data || null);
    } catch (error: any) {
        console.error('Error fetching theme:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify SuperAdmin
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

        // Upsert logic: ensure is_active=true is set
        const { data, error } = await supabase
            .from('theme_settings')
            .upsert({
                is_active: true, // Force singleton
                colors: body.colors || {},
                radius: body.radius || '0.5rem',
                updated_at: new Date().toISOString()
            }, { onConflict: 'is_active' }) // Conflict on unique index
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error saving theme:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
