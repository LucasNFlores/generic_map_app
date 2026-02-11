// app/protected/map/layout.tsx

import React from 'react';
import { MapStoreProvider } from '@/providers/map-store-provider';

// Este layout especial solo se aplicará a las páginas
// que estén dentro de la carpeta /map
export default function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Este layout simplemente importa el CSS y renderiza la página
    // que viene como "children".
    return <MapStoreProvider>{children}</MapStoreProvider>;
}