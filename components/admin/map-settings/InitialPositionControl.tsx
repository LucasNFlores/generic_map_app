'use client';

import { MapPin, Globe, Eye, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SelectableCard } from '@/components/ui/selectable-card';

interface InitialPositionControlProps {
    initialPositionMode: 'custom' | 'current_location' | 'fit_shapes';
    defaultCenter: { lng: number; lat: number; zoom: number };
    onModeChange: (mode: 'custom' | 'current_location' | 'fit_shapes') => void;
    onCaptureView: () => void;
}

export function InitialPositionControl({
    initialPositionMode,
    defaultCenter,
    onModeChange,
    onCaptureView
}: InitialPositionControlProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider">
                <MapPin size={14} />
                Posición Inicial
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                    { id: 'custom', label: 'Personalizado', icon: <Settings2 size={16} /> },
                    { id: 'current_location', label: 'Ubicación actual (gps)', icon: <MapPin size={16} /> },
                    { id: 'fit_shapes', label: 'Vista General', icon: <Globe size={16} /> },
                ].map((mode) => (
                    <SelectableCard
                        key={mode.id}
                        selected={initialPositionMode === mode.id}
                        onClick={() => onModeChange(mode.id as any)}
                        icon={mode.icon}
                        label={mode.label}
                        className="h-full"
                    />
                ))}
            </div>

            {initialPositionMode === 'custom' && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCaptureView}
                            className="h-7 w-full text-xs bg-primary/10 text-primary border-primary/20 hover:bg-transparent hover:border-primary/40 hover:text-primary transition-all font-bold"
                        >
                            <Eye size={12} className="mr-1.5" />
                            Capturar Vista Actual
                        </Button>
                    </div>
                    <Card className="bg-muted/50 border-border">
                        <CardContent className="p-3 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <span className="text-[10px] uppercase text-muted-foreground font-bold block">Latitud</span>
                                <span className="text-sm text-foreground font-mono">{defaultCenter.lat}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-muted-foreground font-bold block">Longitud</span>
                                <span className="text-sm text-foreground font-mono">{defaultCenter.lng}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-muted-foreground font-bold block">Zoom</span>
                                <span className="text-sm text-foreground font-mono">{defaultCenter.zoom}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </section>
    );
}
