'use client';

import { Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
                            <div
                                key={control}
                                onClick={() => onToggleControl(control)}
                                className={`
                                    flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                    ${enabledControls.includes(control)
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-card border-transparent hover:border-border'}
                                `}
                            >
                                <Checkbox
                                    id={control}
                                    checked={enabledControls.includes(control)}
                                    onCheckedChange={() => { }}
                                    className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                />
                                <label
                                    htmlFor={control}
                                    className="text-xs font-semibold leading-none cursor-pointer text-muted-foreground capitalize group-hover:text-foreground transition-colors pointer-events-none"
                                >
                                    {control}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-foreground text-sm">Formas Permitidas</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['point', 'line', 'polygon'].map(shape => (
                            <div
                                key={shape}
                                onClick={() => onToggleShape(shape)}
                                className={`
                                    flex items-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                    ${allowedShapes.includes(shape)
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-card border-transparent hover:border-border'}
                                `}
                            >
                                <Checkbox
                                    id={shape}
                                    checked={allowedShapes.includes(shape)}
                                    onCheckedChange={() => { }}
                                    className="border-muted-foreground data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 pointer-events-none"
                                />
                                <label
                                    htmlFor={shape}
                                    className="text-[11px] font-bold leading-none cursor-pointer text-muted-foreground capitalize group-hover:text-foreground transition-colors pointer-events-none"
                                >
                                    {shape}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
