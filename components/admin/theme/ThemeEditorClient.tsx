'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, RefreshCw, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ThemeSettings {
    colors: Record<string, string>;
    radius: string;
}

const DEFAULT_THEME: ThemeSettings = {
    colors: {
        background: '0.99 0.002 260',
        foreground: '0.11 0.03 260',
        primary: '0.336 0.303 260',
        'primary-foreground': '0.985 0.002 260',
        card: '0.98 0 0',
        'card-foreground': '0.11 0.03 260',
        border: '0.92 0.02 270',
    },
    radius: '0.5rem'
};

export function ThemeEditorClient() {
    const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load initial settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/admin/theme');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.colors) {
                        setSettings({
                            colors: { ...DEFAULT_THEME.colors, ...data.colors },
                            radius: data.radius || DEFAULT_THEME.radius
                        });
                        // Apply initially loaded theme to preview immediately
                        applyThemeToRoot(data.colors, data.radius);
                    }
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
                toast.error('Error al cargar la configuración del tema');
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    // Helper to apply variables to :root
    const applyThemeToRoot = (colors: Record<string, string>, radius: string) => {
        const root = document.documentElement;
        root.style.setProperty('--radius', radius);
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    const handleColorChange = (key: string, value: string) => {
        // Here we would ideally convert Hex to OKLCH if we want to stick to the system,
        // but for simplicity, we might just accept the OKLCH string directly 
        // OR implement a Hex <-> OKLCH converter.
        // Given the complexity of OKLCH conversion, we will assume for now the user
        // inputs values compatible with CSS (e.g., they paste "0.2 0.1 260" or we provide a text input).
        // A full color picker would require a library or a conversion utility.

        const newColors = { ...settings.colors, [key]: value };
        setSettings(prev => ({ ...prev, colors: newColors }));
        applyThemeToRoot(newColors, settings.radius);
    };

    const handleRadiusChange = (value: string) => {
        setSettings(prev => ({ ...prev, radius: value }));
        applyThemeToRoot(settings.colors, value);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Error al guardar');

            toast.success('Tema guardado exitosamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar el tema');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_THEME);
        applyThemeToRoot(DEFAULT_THEME.colors, DEFAULT_THEME.radius);
        toast.success('Vista previa restablecida a predeterminados (No guardado)');
    };

    if (isLoading) return <div className="p-8 text-center">Cargando editor...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto p-6">

            {/* Editor Column */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Editor de Colores (OKLCH)
                        </CardTitle>
                        <CardDescription>
                            Ajusta los valores OKLCH (Lightness Chassis Hue) para una precisión de color perceptual.
                            Formato: `L C H` (ej: `0.5 0.2 260`)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(settings.colors).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-1 gap-2">
                                <Label className="capitalize font-mono text-xs text-muted-foreground">{key}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={value}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    {/* Visual preview of the color if browser supports oklch in simple bg */}
                                    <div
                                        className="w-10 h-10 rounded border shrink-0 shadow-sm"
                                        style={{ backgroundColor: `oklch(${value})` }}
                                        title={`Previsualización: oklch(${value})`}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t">
                            <Label className="mb-2 block">Radio de Bordes</Label>
                            <Input
                                value={settings.radius}
                                onChange={(e) => handleRadiusChange(e.target.value)}
                                placeholder="0.5rem"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button onClick={handleReset} variant="outline" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Resetear Vista
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6 sticky top-6 self-start">
                <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle>Vista Previa en Vivo</CardTitle>
                        <CardDescription>Así es como se verán los componentes con tu configuración actual.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8 bg-background text-foreground transition-colors duration-200">
                        {/* Buttons Preview */}
                        <div className="space-y-2">
                            <Label>Botones</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button>Primary Action</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="destructive">Destructive</Button>
                            </div>
                        </div>

                        {/* Cards Preview */}
                        <div className="space-y-2">
                            <Label>Tarjetas y Contenedores</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Tarjeta Estándar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        Texto de ejemplo sobre un fondo `card`.
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary text-primary-foreground">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Tarjeta Primaria</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        Texto sobre fondo primario vibrante.
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Form Elements */}
                        <div className="space-y-4 p-4 border rounded-lg bg-card">
                            <div className="space-y-2">
                                <Label>Input Field</Label>
                                <Input placeholder="Escribe algo aquí..." />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
