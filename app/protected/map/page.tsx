'use client'; // Importante: esta página debe ser un Client Component

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function MapaPage() {
    // 1. Usamos useMemo y dynamic para importar el componente del mapa
    //    sin que se renderice en el servidor (ssr: false).
    const Map = useMemo(() => dynamic(
        () => import('@/components/map/MapComponent'), // 2. Esta es la ruta a tu componente
        {
            loading: () => <p>Cargando mapa...</p>, // 3. Texto mientras carga
            ssr: false // 4. Deshabilita el Server-Side Rendering para el mapa
        }
    ), []); // El array vacío asegura que esto solo se ejecute una vez

    // 5. La página ahora solo renderiza el componente del mapa
    //    que importamos dinámicamente.
    return <Map />;
}
