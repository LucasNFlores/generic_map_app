'use client';

import * as React from 'react';
import type { Category, FormFieldDefinition } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldDefinitionBuilder } from './FieldDefinitionBuilder';

interface CategoryFormProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const [name, setName] = React.useState(category?.name || '');
    const [description, setDescription] = React.useState(category?.description || '');
    const [color, setColor] = React.useState(category?.color || '#3b82f6');
    const [icon, setIcon] = React.useState(category?.icon || 'MapPin');
    const [fields, setFields] = React.useState<FormFieldDefinition[]>(
        category?.fields_definition || []
    );
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name,
                description,
                color,
                icon,
                fields_definition: fields,
            };

            const url = category ? `/api/categories/${category.id}` : '/api/categories';
            const method = category ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar categoría');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ej: Comercio"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-20 h-10"
                        />
                        <Input
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="#3b82f6"
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe esta categoría..."
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="icon">Icono (Lucide)</Label>
                <Input
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="ej: Store, MapPin, Building"
                />
                <p className="text-xs text-muted-foreground">
                    Nombre del icono de Lucide React (ej: Store, MapPin, Building)
                </p>
            </div>

            <div className="border-t pt-4">
                <FieldDefinitionBuilder fields={fields} onChange={setFields} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
                </Button>
            </div>
        </form>
    );
}
