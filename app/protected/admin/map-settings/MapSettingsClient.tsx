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
    loading: () => <div className="w-full h-full flex items-center justify-center bg-[#050912] text-gray-500">Cargando mapa...</div>
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
            <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#0a0e17]">

                {/* Left Panel: Settings Form */}
                {/* Left Panel: Settings Form */}
                <div className={`
                    w-full h-full lg:w-[400px] xl:w-[450px] flex-none bg-[#0f172a] border-b lg:border-b-0 lg:border-r border-[#1e293b] flex flex-col z-20 shadow-2xl transition-all
                    ${showMobileMap ? 'hidden lg:flex' : 'flex'}
                `}>
                    <div className="p-6 border-b border-[#1e293b] bg-[#131c2e]">
                        <div className='flex gap-2 items-center'>
                            <Link
                                href="/protected/admin"
                                className="p-2.5 hover:bg-[#1e293b] rounded-xl transition-all border border-[#1e293b] bg-[#0f172a] shadow-lg group"
                                title="Volver al panel de administración"
                            >
                                <ArrowLeft size={20} className="text-[#94a3b8] group-hover:text-white transition-colors" />
                            </Link>
                            <h1 className="text-2xl font-extrabold text-white">Configuración</h1>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Personaliza la experiencia del mapa</p>
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
                                className="bg-[#0f172a] border border-[#1e293b] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm"
                            >
                                <ArrowLeft size={16} />
                                Volver a Configuración
                            </button>
                        </div>
                    )}
                    {/* Toolbar overlay */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white text-xs font-bold capitalize tracking-wider shadow-lg flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Vista Previa
                        </div>

                        {/* Mock device toggles (Visual only for now) */}
                        <div className="flex gap-2 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg pointer-events-auto">
                            <button className="p-2 hover:bg-white/10 rounded-md text-white transition-colors" title="Vista Desktop">
                                <Monitor size={16} />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors" title="Vista Móvil">
                                <Smartphone size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative bg-[#050912]">
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
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </MapStoreProvider>
    );
}
