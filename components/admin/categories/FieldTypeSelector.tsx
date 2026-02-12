import * as React from 'react';
import {
    Type, Hash, List, Layers, ToggleRight, Calendar, Fingerprint
} from 'lucide-react';
import { FormFieldType } from '@/types';
import { SelectableCard } from '@/components/ui/selectable-card';

interface FieldTypeSelectorProps {
    currentType: FormFieldType;
    onTypeSelect: (type: FormFieldType) => void;
}

export function FieldTypeSelector({ currentType, onTypeSelect }: FieldTypeSelectorProps) {
    return (
        <div className="space-y-6">
            <div>
                <label className="text-[10px] font-bold text-[#5a6b8c] uppercase tracking-widest block mb-4">Tipos simple</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'text', label: 'Texto corto', icon: <Type size={18} /> },
                        { id: 'number', label: 'Numero', icon: <Hash size={18} /> },
                    ].map((typeOption) => (
                        <SelectableCard
                            key={typeOption.id}
                            selected={currentType === typeOption.id}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
                            icon={typeOption.icon}
                            label={typeOption.label}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-[#5a6b8c] uppercase tracking-widest block mb-4">Selección</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'select', label: 'Selector único', icon: <List size={18} />, color: 'text-emerald-500' },
                        { id: 'multi_select', label: 'Selector múltiple', icon: <Layers size={18} />, color: 'text-cyan-500' },
                        { id: 'boolean', label: 'Checkbox', icon: <ToggleRight size={18} />, color: 'text-purple-500' },
                        { id: 'date', label: 'Fecha', icon: <Calendar size={18} />, color: 'text-blue-500' },
                    ].map((typeOption) => (
                        <SelectableCard
                            key={typeOption.id}
                            selected={currentType === typeOption.id}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
                            icon={typeOption.icon}
                            label={typeOption.label}
                            iconColor={typeOption.color}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-[#5a6b8c] uppercase tracking-widest block mb-4">Avanzado</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'auto_id', label: 'Auto-ID', icon: <Fingerprint size={18} />, color: 'text-orange-500' },
                    ].map((typeOption) => (
                        <SelectableCard
                            key={typeOption.id}
                            selected={currentType === typeOption.id}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
                            icon={typeOption.icon}
                            label={typeOption.label}
                            iconColor={typeOption.color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
