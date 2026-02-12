'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { FormFieldDefinition } from '@/types';
import { FieldCard } from './FieldCard';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from '@dnd-kit/modifiers';

interface FieldDefinitionBuilderProps {
    fields: FormFieldDefinition[];
    onChange: (fields: FormFieldDefinition[]) => void;
    selectedFieldId?: string;
    onSelectField: (id: string) => void;
}

export function FieldDefinitionBuilder({
    fields,
    onChange,
    selectedFieldId,
    onSelectField
}: FieldDefinitionBuilderProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addField = () => {
        const newField: FormFieldDefinition = {
            id: `field_${Date.now()}`,
            label: 'Nuevo Campo',
            type: 'text',
            required: false,
        };
        onChange([...fields, newField]);
        onSelectField(newField.id);
    };

    const removeField = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(fields.filter(f => f.id !== id));
        if (selectedFieldId === id) onSelectField('');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex(f => f.id === active.id);
            const newIndex = fields.findIndex(f => f.id === over.id);

            onChange(arrayMove(fields, oldIndex, newIndex));
        }
    };

    return (
        <div className="space-y-4">
            {fields.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/30">
                    No hay campos dinámicos todavía. Comienza agregando uno abajo.
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                    <SortableContext
                        items={fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {fields.map((field) => (
                                <FieldCard
                                    key={field.id}
                                    field={field}
                                    selected={selectedFieldId === field.id}
                                    onClick={() => onSelectField(field.id)}
                                    onRemove={(e) => removeField(field.id, e)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                type="button"
                onClick={addField}
                className="w-full py-4 border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group mt-4"
            >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg border border-border">
                    <Plus className="text-muted-foreground group-hover:text-primary" size={20} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-foreground">Agregar nuevo campo dinámico</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Selecciona entre los tipos de campo estándar</span>
            </button>
        </div>
    );
}
