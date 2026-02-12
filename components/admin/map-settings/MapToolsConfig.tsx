'use client';

import { Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ToggleCard } from '@/components/ui/toggle-card';

interface MapToolsConfigProps {
    enabledControls: string[];
    allowedShapes: string[];
    onToggleControl: (control: string) => void;
    onToggleShape: (shape: string) => void;
}

export function MapToolsConfig({
    enabledControls,
    allowedShapes,
    onToggleControl,
    onToggleShape
}: MapToolsConfigProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider">
                <Settings2 size={14} />
                Interfaz y Herramientas
            </div>

            <div className="grid gap-4">
                <div className="space-y-3">
                    <Label className="text-foreground text-sm">Controles Visibles</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {['zoom', 'scale', 'geolocate', 'fullscreen'].map(control => (
                            <ToggleCard
                                key={control}
                                id={control}
                                label={control}
                                checked={enabledControls.includes(control)}
                                onToggle={() => onToggleControl(control)}
                                variant="default"
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-foreground text-sm">Formas Permitidas</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['point', 'line', 'polygon'].map(shape => (
                            <ToggleCard
                                key={shape}
                                id={shape}
                                label={shape}
                                checked={allowedShapes.includes(shape)}
                                onToggle={() => onToggleShape(shape)}
                                variant="success"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
