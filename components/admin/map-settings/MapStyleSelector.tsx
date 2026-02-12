'use client';

import { Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StyleOption {
    name: string;
    url: string;
    img: string;
}

interface MapStyleSelectorProps {
    mapboxStyle: string;
    onStyleChange: (url: string) => void;
    isCustomMode: boolean;
    onCustomModeToggle: (isCustom: boolean) => void;
}

const MAPTILER_STYLES: StyleOption[] = [
    { name: 'Streets', url: 'https://api.maptiler.com/maps/streets-v2/style.json', img: '/images/style-streets.png' },
    { name: 'Satellite', url: 'https://api.maptiler.com/maps/satellite/style.json', img: '/images/style-satellite.png' },
    { name: 'Hybrid', url: 'https://api.maptiler.com/maps/hybrid/style.json', img: '/images/style-hybrid.png' },
    { name: 'Dark', url: 'https://api.maptiler.com/maps/dataviz-dark/style.json', img: '/images/style-dark.png' },
    { name: 'Light', url: 'https://api.maptiler.com/maps/dataviz-light/style.json', img: '/images/style-light.png' },
];

export { MAPTILER_STYLES };

export function MapStyleSelector({
    mapboxStyle,
    onStyleChange,
    isCustomMode,
    onCustomModeToggle
}: MapStyleSelectorProps) {

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider">
                <Layers size={14} />
                Estilo del Mapa
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MAPTILER_STYLES.map((style) => (
                    <div
                        key={style.name}
                        onClick={() => {
                            onStyleChange(style.url);
                            onCustomModeToggle(false);
                        }}
                        className={`
                            cursor-pointer rounded-xl border-2 p-3 transition-all hover:bg-muted group
                            ${mapboxStyle === style.url && !isCustomMode
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-border bg-card opacity-70 hover:opacity-100'}
                        `}
                    >
                        <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden relative">
                            {/* Ideally we would use the img property here if images existed */}
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground bg-background uppercase tracking-tighter">
                                {style.name}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-foreground block text-center uppercase tracking-tight">{style.name}</span>
                    </div>
                ))}

                {/* Custom Style Option */}
                <div
                    onClick={() => onCustomModeToggle(true)}
                    className={`
                        cursor-pointer rounded-xl border-2 p-3 transition-all hover:bg-muted group
                        ${isCustomMode
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border bg-card opacity-70 hover:opacity-100'}
                    `}
                >
                    <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden relative border border-dashed border-border flex items-center justify-center">
                        <Layers size={20} className={isCustomMode ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <span className="text-xs font-bold text-foreground block text-center uppercase tracking-tight">Personalizado</span>
                </div>
            </div>

            {isCustomMode && (
                <div className="mt-4 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center ml-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">URL MapTiler / Mapbox / TileJSON</Label>
                    </div>
                    <Input
                        value={mapboxStyle}
                        onChange={(e) => onStyleChange(e.target.value)}
                        className="bg-card border-border text-foreground text-xs h-10 px-4 focus:ring-primary/20 focus:border-primary transition-all rounded-lg selection:bg-primary/30"
                        placeholder="https://api.maptiler.com/maps/..."
                    />
                    <p className="text-[9px] text-muted-foreground ml-1">Pega aquí el enlace .json de tu estilo personalizado.</p>
                </div>
            )}
        </section>
    );
}
