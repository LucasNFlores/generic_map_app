'use client'; // Importante: esta página debe ser un Client Component

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// 1. Move dynamic import outside component
const Map = dynamic(
    () => import('@/components/map/mapComponent'),
    {
        loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/10"><p className="text-muted-foreground animate-pulse">Cargando mapa...</p></div>,
        ssr: false
    }
);

export default function MapaPage() {
    // 2. Component is now cleaner and doesn't re-create the import on render
    return <Map />;
}
