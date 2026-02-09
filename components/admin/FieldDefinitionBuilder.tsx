'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { FormFieldDefinition } from '@/types';
import { FieldCard } from './FieldCard';

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
    const addField = () => {
        const newField: FormFieldDefinition = {
            id: `field_${Date.now()}`,
            label: 'New Field',
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

    return (
        <div className="space-y-4">
            {fields.length === 0 ? (
                <div className="text-sm text-[#5a6b8c] text-center py-12 border-2 border-dashed border-[#222f49] rounded-xl bg-[#161e2e]/30">
                    No dynamic fields yet. Start by adding one below.
                </div>
            ) : (
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
            )}

            <button
                type="button"
                onClick={addField}
                className="w-full py-4 border-2 border-dashed border-[#222f49] hover:border-primary/50 bg-[#161e2e]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group mt-4"
            >
                <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg border border-[#222f49]">
                    <Plus className="text-[#90a4cb] group-hover:text-primary" size={20} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-white">Add new dynamic field</span>
                <span className="text-[10px] text-[#5a6b8c] font-medium mt-0.5">Select from standard field types</span>
            </button>
        </div>
    );
}
