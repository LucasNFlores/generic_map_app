// app/protected/map/layout.tsx

import React from 'react';
import { MapStoreProvider } from '@/providers/map-store-provider';
import { createClient } from '@/lib/supabase/server';

// Este layout especial solo se aplicará a las páginas
// que estén dentro de la carpeta /map
export default async function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch user role server-side to inject into the store
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRole = 'invited';
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile) {
            userRole = profile.role;
        }
    }

    return <MapStoreProvider userRole={userRole}>{children}</MapStoreProvider>;
}