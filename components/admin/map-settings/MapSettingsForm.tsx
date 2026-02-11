'use client';

import { useState, useEffect } from 'react';
import type { MapConfiguration } from '@/types';
import { useMapStore } from '@/providers/map-store-provider';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { MapPin, Save, Globe, Eye, Layers, Settings2 } from 'lucide-react';

interface Props {
    initialConfig: MapConfiguration | null;
    onChange: (config: MapConfiguration) => void;
}

const MAPTILER_STYLES = [
    { name: 'Streets', url: 'https://api.maptiler.com/maps/streets-v2/style.json', img: '/images/style-streets.png' },
    { name: 'Satellite', url: 'https://api.maptiler.com/maps/satellite/style.json', img: '/images/style-satellite.png' },
    { name: 'Hybrid', url: 'https://api.maptiler.com/maps/hybrid/style.json', img: '/images/style-hybrid.png' },
    { name: 'Dark', url: 'https://api.maptiler.com/maps/dataviz-dark/style.json', img: '/images/style-dark.png' },
    { name: 'Light', url: 'https://api.maptiler.com/maps/dataviz-light/style.json', img: '/images/style-light.png' },
];

export function MapSettingsForm({ initialConfig, onChange }: Props) {
    const defaultState: MapConfiguration = {
        id: '',
        is_active: true,
        mapbox_style: MAPTILER_STYLES[0].url,
        default_center: { lng: -58.3816, lat: -34.6037, zoom: 12 },
        role_overrides: {},
        enabled_controls: ['zoom', 'scale', 'geolocate', 'fullscreen'],
        allowed_shapes: ['point', 'line', 'polygon'],
        min_zoom: 0,
        max_zoom: 22
    };

    const [config, setConfig] = useState<MapConfiguration>(initialConfig || defaultState);
    const [isSaving, setIsSaving] = useState(false);

    // Map Store access for capturing view
    const viewState = useMapStore((state) => state.viewState);

    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        }
    }, [initialConfig]);

    const updateConfig = (updates: Partial<MapConfiguration>) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);
        onChange(newConfig);
    };

    const handleCaptureView = () => {
        const newCenter = {
            lng: Number(viewState.longitude.toFixed(6)),
            lat: Number(viewState.latitude.toFixed(6)),
            zoom: Number(viewState.zoom.toFixed(2))
        };
        updateConfig({ default_center: newCenter });
        toast.success("Vista actual capturada como predeterminada");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/map-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Error al guardar configuración');

            toast.success("Configuración guardada exitosamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la configuración");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleControl = (control: string) => {
        const current = config.enabled_controls || [];
        const updated = current.includes(control)
            ? current.filter(c => c !== control)
            : [...current, control];
        updateConfig({ enabled_controls: updated });
    };

    const toggleShape = (shape: string) => {
        const current = config.allowed_shapes || [];
        // @ts-ignore
        const updated = current.includes(shape)
            ? current.filter(s => s !== shape)
            : [...current, shape];
        // @ts-ignore
        updateConfig({ allowed_shapes: updated });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Style Selector */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-wider">
                    <Layers size={14} />
                    Estilo del Mapa
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {MAPTILER_STYLES.map((style) => (
                        <div
                            key={style.name}
                            onClick={() => updateConfig({ mapbox_style: style.url })}
                            className={`
                                cursor-pointer rounded-xl border-2 p-3 transition-all hover:bg-[#1e293b]
                                ${config.mapbox_style === style.url
                                    ? 'border-blue-500 bg-[#1e293b] ring-2 ring-blue-500/20'
                                    : 'border-[#334155] bg-[#0f172a] opacity-70 hover:opacity-100'}
                            `}
                        >
                            <div className="aspect-video bg-gray-800 rounded-lg mb-2 overflow-hidden relative">
                                {/* Placeholder for image if we had one */}
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 bg-[#020617]">
                                    {style.name} Preview
                                </div>
                            </div>
                            <span className="text-sm font-medium text-white block text-center">{style.name}</span>
                        </div>
                    ))}
                </div>
                {/* Custom URL Input */}
                <div className="mt-2 space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">URL Personalizada (MapTiler/Mapbox)</Label>
                    <Input
                        value={config.mapbox_style}
                        onChange={(e) => updateConfig({ mapbox_style: e.target.value })}
                        className="bg-[#1e293b] border-[#334155] text-white text-xs h-10 px-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg selection:bg-blue-500/30"
                        placeholder="https://api.maptiler.com/maps/..."
                    />
                </div>
            </section>

            <div className="h-px bg-[#1e293b]" />

            {/* Default Center */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-wider">
                        <MapPin size={14} />
                        Posición Inicial
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCaptureView}
                        className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                        <Eye size={12} className="mr-1.5" />
                        Capturar Vista Actual
                    </Button>
                </div>

                <Card className="bg-[#1e293b]/50 border-[#334155]">
                    <CardContent className="p-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block">Latitud</span>
                            <span className="text-sm text-white font-mono">{config.default_center.lat}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block">Longitud</span>
                            <span className="text-sm text-white font-mono">{config.default_center.lng}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block">Zoom</span>
                            <span className="text-sm text-white font-mono">{config.default_center.zoom}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-2">
                    <Label className="text-sm text-white mb-2 block">Excepciones por Rol</Label>
                    <div className="p-3 rounded-lg border border-dashed border-[#334155] bg-[#0f172a]/50 text-center">
                        <p className="text-xs text-gray-500">
                            Próximamente: Configurar vistas específicas para Supervisores o Invitados.
                        </p>
                    </div>
                </div>
            </section>

            <div className="h-px bg-[#1e293b]" />

            {/* Controls & Shapes */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-wider">
                    <Settings2 size={14} />
                    Interfaz y Herramientas
                </div>

                <div className="grid gap-4">
                    <div className="space-y-3">
                        <Label className="text-white text-sm">Controles Visibles</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['zoom', 'scale', 'geolocate', 'fullscreen'].map(control => (
                                <div
                                    key={control}
                                    onClick={() => toggleControl(control)}
                                    className={`
                                        flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                        ${(config.enabled_controls || []).includes(control)
                                            ? 'bg-blue-500/10 border-blue-500/30'
                                            : 'bg-[#1e293b] border-transparent hover:border-[#334155]'}
                                    `}
                                >
                                    <Checkbox
                                        id={control}
                                        checked={(config.enabled_controls || []).includes(control)}
                                        onCheckedChange={() => { }} // Controlado por el div
                                        className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 pointer-events-none"
                                    />
                                    <label
                                        htmlFor={control}
                                        className="text-xs font-semibold leading-none cursor-pointer text-gray-300 capitalize group-hover:text-white transition-colors pointer-events-none"
                                    >
                                        {control}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-white text-sm">Formas Permitidas</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['point', 'line', 'polygon'].map(shape => (
                                <div
                                    key={shape}
                                    onClick={() => toggleShape(shape)}
                                    className={`
                                        flex items-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                        ${(config.allowed_shapes || []).includes(shape as any)
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-[#1e293b] border-transparent hover:border-[#334155]'}
                                    `}
                                >
                                    <Checkbox
                                        id={shape}
                                        checked={(config.allowed_shapes || []).includes(shape as any)}
                                        onCheckedChange={() => { }} // Controlado por el div
                                        className="border-gray-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 pointer-events-none"
                                    />
                                    <label
                                        htmlFor={shape}
                                        className="text-[11px] font-bold leading-none cursor-pointer text-gray-300 capitalize group-hover:text-white transition-colors pointer-events-none"
                                    >
                                        {shape}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Save Button (Mobile/Desktop) */}
            <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#0f172a] to-transparent pb-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 shadow-lg shadow-blue-900/20"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </div>
        </div>
    );
}
