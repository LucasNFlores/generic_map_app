'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapSettingsForm } from '@/components/admin/map-settings/MapSettingsForm';
import { MapStoreProvider } from '@/providers/map-store-provider';
import type { MapConfiguration } from '@/types';
import { Smartphone, Monitor, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MapComponent = dynamic(() => import('@/components/map/mapComponent'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/10 text-muted-foreground">Cargando mapa...</div>
});

interface Props {
    initialConfig: MapConfiguration | null;
}

export function MapSettingsClient({ initialConfig }: Props) {
    // Only use initialConfig for the very first render if needed.
    // Actually, MapSettingsForm manages the preview state and updates MapComponent via prop.
    // We lift the state here.
    const [previewConfig, setPreviewConfig] = useState<MapConfiguration | null>(initialConfig);
    const [showMobileMap, setShowMobileMap] = useState(false);

    return (
        <MapStoreProvider>
            <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-background">

                {/* Left Panel: Settings Form */}
                {/* Left Panel: Settings Form */}
                <div className={`
                    w-full h-full lg:w-[400px] xl:w-[450px] flex-none bg-card border-b lg:border-b-0 lg:border-r border-border flex flex-col z-20 shadow-2xl transition-all
                    ${showMobileMap ? 'hidden lg:flex' : 'flex'}
                `}>
                    <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
                        <div className='flex gap-2 items-center'>
                            <Link
                                href="/protected/admin"
                                className="p-2.5 hover:bg-muted rounded-xl transition-all border border-border bg-card shadow-lg group"
                                title="Volver al panel de administración"
                                aria-label="Volver al panel de administración"
                            >
                                <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                            </Link>
                            <h1 className="text-2xl font-extrabold text-foreground">Configuración</h1>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">Personaliza la experiencia del mapa</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <MapSettingsForm
                            initialConfig={initialConfig}
                            onChange={setPreviewConfig}
                            onPreviewClick={() => setShowMobileMap(true)}
                        />
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className={`
                    flex-1 relative flex-col
                    ${showMobileMap ? 'flex' : 'hidden lg:flex'}
                `}>
                    {/* Mobile Back Button */}
                    {showMobileMap && (
                        <div className="absolute top-4 left-4 z-50 lg:hidden">
                            <button
                                onClick={() => setShowMobileMap(false)}
                                className="bg-card border border-border text-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm"
                                aria-label="Volver a la configuración"
                            >
                                <ArrowLeft size={16} aria-hidden="true" />
                                Volver a Configuración
                            </button>
                        </div>
                    )}
                    {/* Toolbar overlay */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                        <div className="bg-background/80 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full text-foreground text-xs font-bold capitalize tracking-wider shadow-lg flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Vista Previa
                        </div>

                    </div>

                    <div className="flex-1 relative bg-muted/20">
                        {/* We pass customConfig to force the map to use our preview settings */}
                        <MapComponent isReadOnly={false} customConfig={previewConfig} />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--border));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--muted-foreground));
                }
            `}</style>
        </MapStoreProvider>
    );
}
