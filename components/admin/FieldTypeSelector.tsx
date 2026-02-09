import * as React from 'react';
import {
    Type, Hash, List, Layers, ToggleRight, Calendar, Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types';

interface FieldTypeOption {
    id: FormFieldType;
    label: string;
    icon: React.ReactNode;
    color?: string;
}

interface FieldTypeButtonProps {
    typeOption: FieldTypeOption;
    currentType: string;
    onClick: () => void;
}

const FieldTypeButton = ({ typeOption, currentType, onClick }: FieldTypeButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all group",
            currentType === typeOption.id
                ? "bg-primary/10 border-primary text-white shadow-glow"
                : "bg-[#161e2e] border-[#222f49] text-[#90a4cb] hover:border-primary/50 hover:bg-[#1e293b] hover:text-white"
        )}
    >
        <div className={cn(
            "transition-colors",
            currentType === typeOption.id ? "text-primary" : typeOption.color || "text-[#5a6b8c] group-hover:text-white"
        )}>
            {typeOption.icon}
        </div>
        <span className="text-[10px] font-medium tracking-wide">{typeOption.label}</span>
    </button>
);

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
                        <FieldTypeButton
                            key={typeOption.id}
                            typeOption={typeOption as FieldTypeOption}
                            currentType={currentType}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
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
                        <FieldTypeButton
                            key={typeOption.id}
                            typeOption={typeOption as FieldTypeOption}
                            currentType={currentType}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
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
                        <FieldTypeButton
                            key={typeOption.id}
                            typeOption={typeOption as FieldTypeOption}
                            currentType={currentType}
                            onClick={() => onTypeSelect(typeOption.id as FormFieldType)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
