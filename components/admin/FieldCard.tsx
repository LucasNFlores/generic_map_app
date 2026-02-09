import * as React from 'react';
import {
    Trash2, GripVertical, Settings, Type, Hash, List, Layers, ToggleRight, Calendar, Fingerprint, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldDefinition } from '@/types';
import { Button } from '@/components/ui/button';

interface FieldCardProps {
    field: FormFieldDefinition;
    selected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
}

export function FieldCard({ field, selected, onClick, onRemove }: FieldCardProps) {
    const getIconForType = (type: string) => {
        switch (type) {
            case 'text': return <Type size={18} />;
            case 'number': return <Hash size={18} />;
            case 'select': return <List size={18} />;
            case 'multi_select': return <Layers size={18} />;
            case 'boolean': return <ToggleRight size={18} />;
            case 'date': return <Calendar size={18} />;
            case 'auto_id': return <Fingerprint size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'select': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'multi_select': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
            case 'date': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'boolean': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            default: return 'text-[#90a4cb] bg-[#1e293b] border-[#222f49]';
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative p-1 rounded-xl transition-all cursor-pointer shadow-lg border",
                selected
                    ? "bg-[#1e293b]/60 border-primary/50 ring-1 ring-primary/30"
                    : "bg-white/5 border-transparent hover:border-[#222f49] hover:bg-white/10"
            )}
        >
            {/* Action overlap */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#90a4cb] hover:text-red-400"
                    onClick={onRemove}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#101623]/80 rounded-lg">
                <div className="w-8 flex justify-center text-[#5a6b8c]">
                    <GripVertical size={20} />
                </div>
                <div className={cn("p-3 rounded-lg border flex items-center justify-center", getTypeColor(field.type))}>
                    {getIconForType(field.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5",
                                field.type === 'select' ? 'text-emerald-500' :
                                    field.type === 'date' ? 'text-blue-500' : 'text-[#90a4cb]')}>
                                {field.type} Field
                            </span>
                            <span className="text-base font-medium text-white truncate">
                                {field.label || 'Untitled Field'}
                            </span>
                        </div>
                        {selected && (
                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                <Settings size={18} className="text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="mt-1 flex gap-2 overflow-hidden">
                        {/* ID hidden as per user request */}
                        {field.required && (
                            <span className="text-[11px] text-red-500/80 bg-red-500/5 px-1.5 rounded border border-red-500/10">Required</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
