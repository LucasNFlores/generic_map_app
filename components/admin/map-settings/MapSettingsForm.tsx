'use client';

import { useState, useEffect } from 'react';
import type { MapConfiguration } from '@/types';
import { useMapStore } from '@/providers/map-store-provider';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Save, Globe } from 'lucide-react';
import { MapStyleSelector, MAPTILER_STYLES } from './MapStyleSelector';
import { InitialPositionControl } from './InitialPositionControl';
import { MapToolsConfig } from './MapToolsConfig';

interface Props {
    initialConfig: MapConfiguration | null;
    onChange: (config: MapConfiguration) => void;
    onPreviewClick?: () => void;
}

export function MapSettingsForm({ initialConfig, onChange, onPreviewClick }: Props) {
    const defaultState: MapConfiguration = {
        id: '',
        is_active: true,
        mapbox_style: MAPTILER_STYLES[0].url,
        initial_position_mode: 'custom',
        default_center: { lng: -58.3816, lat: -34.6037, zoom: 12 },
        role_overrides: {},
        enabled_controls: ['zoom', 'scale', 'geolocate', 'fullscreen'],
        allowed_shapes: ['point', 'line', 'polygon'],
        min_zoom: 0,
        max_zoom: 22
    };

    const [config, setConfig] = useState<MapConfiguration>(initialConfig || defaultState);
    const [isSaving, setIsSaving] = useState(false);

    // Style helper: manage custom mode state
    const [isCustomMode, setIsCustomMode] = useState(!MAPTILER_STYLES.some(s => s.url === config.mapbox_style));

    const viewState = useMapStore((state) => state.viewState);

    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        }
    }, [initialConfig]);

    const updateConfig = (updates: Partial<MapConfiguration>) => {
        const newConfig = { ...config, ...updates };

        // If a new style is provided and matches a preset, auto-exit custom mode
        if (updates.mapbox_style) {
            const isPreset = MAPTILER_STYLES.some(s => s.url === updates.mapbox_style);
            if (isPreset) setIsCustomMode(false);
        }

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
        <div className="space-y-8">
            {/* Style Selector */}
            <MapStyleSelector
                mapboxStyle={config.mapbox_style}
                onStyleChange={(url) => updateConfig({ mapbox_style: url })}
                isCustomMode={isCustomMode}
                onCustomModeToggle={setIsCustomMode}
            />

            <div className="h-px bg-border" />

            {/* Default Center & Mode Selector */}
            <InitialPositionControl
                initialPositionMode={config.initial_position_mode}
                defaultCenter={config.default_center}
                onModeChange={(mode) => updateConfig({ initial_position_mode: mode })}
                onCaptureView={handleCaptureView}
            />

            <div className="h-px bg-border" />

            {/* Controls & Shapes */}
            <MapToolsConfig
                enabledControls={config.enabled_controls || []}
                allowedShapes={config.allowed_shapes as string[] || []}
                onToggleControl={toggleControl}
                onToggleShape={toggleShape}
            />

            {/* Floating Save Button */}
            <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-background to-transparent pb-4 space-y-3">
                <Button
                    onClick={onPreviewClick}
                    variant="outline"
                    className="w-full lg:hidden bg-card text-primary border-primary/30 hover:bg-primary/10 hover:text-primary-foreground font-bold h-10"
                >
                    <Globe size={16} className="mr-2" />
                    Ver Mapa / Vista Previa
                </Button>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </div>
        </div>
    );
}
