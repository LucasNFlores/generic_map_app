'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { FormFieldDefinition, FormFieldType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface FieldDefinitionBuilderProps {
    fields: FormFieldDefinition[];
    onChange: (fields: FormFieldDefinition[]) => void;
}

export function FieldDefinitionBuilder({ fields, onChange }: FieldDefinitionBuilderProps) {
    const addField = () => {
        const newField: FormFieldDefinition = {
            id: `field_${Date.now()}`,
            label: '',
            type: 'text',
            required: false,
        };
        onChange([...fields, newField]);
    };

    const updateField = (index: number, updates: Partial<FormFieldDefinition>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        onChange(newFields);
    };

    const removeField = (index: number) => {
        onChange(fields.filter((_, i) => i !== index));
    };

    const fieldTypes: { value: FormFieldType; label: string }[] = [
        { value: 'auto_id', label: 'ID Auto-incremental' },
        { value: 'text', label: 'Texto' },
        { value: 'number', label: 'Número' },
        { value: 'select', label: 'Lista desplegable' },
        { value: 'boolean', label: 'Sí/No' },
        { value: 'date', label: 'Fecha' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Campos Personalizados</Label>
                <Button type="button" onClick={addField} size="sm" variant="outline" className="gap-2">
                    <Plus size={14} />
                    Agregar Campo
                </Button>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                    No hay campos definidos. Haz clic en "Agregar Campo" para comenzar.
                </p>
            ) : (
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="p-4 border rounded-lg bg-muted/30 space-y-3"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-2 cursor-grab">
                                    <GripVertical size={16} className="text-muted-foreground" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">ID del campo</Label>
                                        <Input
                                            value={field.id}
                                            onChange={(e) => updateField(index, { id: e.target.value })}
                                            placeholder="ej: tipo_negocio"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Etiqueta</Label>
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(index, { label: e.target.value })}
                                            placeholder="ej: Tipo de Negocio"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tipo</Label>
                                        <Select
                                            value={field.type}
                                            onValueChange={(value: FormFieldType) => updateField(index, { type: value })}
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 flex items-end gap-4 pb-1">
                                        {field.type !== 'auto_id' && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`required-${field.id}`}
                                                    checked={field.required || false}
                                                    onCheckedChange={(checked) =>
                                                        updateField(index, { required: checked as boolean })
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`required-${field.id}`}
                                                    className="text-xs font-normal cursor-pointer"
                                                >
                                                    Obligatorio
                                                </Label>
                                            </div>
                                        )}
                                        {field.type === 'auto_id' && (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`visible-${field.id}`}
                                                    checked={field.visible || false}
                                                    onCheckedChange={(checked) =>
                                                        updateField(index, { visible: checked as boolean })
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`visible-${field.id}`}
                                                    className="text-xs font-normal cursor-pointer"
                                                >
                                                    Visible
                                                </Label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                    className="mt-1"
                                >
                                    <Trash2 size={14} className="text-destructive" />
                                </Button>
                            </div>

                            {field.type === 'select' && (
                                <div className="space-y-1 ml-8">
                                    <Label className="text-xs">Opciones (separadas por coma)</Label>
                                    <Input
                                        value={field.options?.join(', ') || ''}
                                        onChange={(e) =>
                                            updateField(index, {
                                                options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                            })
                                        }
                                        placeholder="ej: Kiosko, Almacén, Restaurante"
                                        className="h-9 text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
