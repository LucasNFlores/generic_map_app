import * as React from 'react';
import {
    Trash2, GripVertical, Settings, Type, Hash, List, Layers, ToggleRight, Calendar, Fingerprint, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormFieldDefinition } from '@/types';
import { Button } from '@/components/ui/button';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FieldCardProps {
    field: FormFieldDefinition;
    selected: boolean;
    onClick: () => void;
    onRemove: (e: React.MouseEvent) => void;
}

export function FieldCard({ field, selected, onClick, onRemove }: FieldCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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
            default: return 'text-muted-foreground bg-muted border-border';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={cn(
                "group relative p-1 rounded-xl transition-all cursor-pointer shadow-lg border",
                isDragging
                    ? "bg-muted border-primary/50 ring-2 ring-primary/40 opacity-50 z-50 scale-[1.02] shadow-2xl"
                    : selected
                        ? "bg-muted/60 border-primary/50 ring-1 ring-primary/30"
                        : "bg-background/5 border-transparent hover:border-border hover:bg-background/10"
            )}
        >
            {/* Action overlap */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">

            </div>

            <div className="flex items-center gap-4 p-4 bg-card/80 rounded-lg">
                <div
                    {...attributes}
                    {...listeners}
                    className="w-8 flex justify-center text-muted-foreground cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
                >
                    <GripVertical size={20} />
                </div>
                <div className={cn("p-3 rounded-lg border flex items-center justify-center", getTypeColor(field.type))}>
                    {getIconForType(field.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center items-start">
                        <div className="flex flex-col h-full">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5",
                                field.type === 'select' ? 'text-emerald-500' :
                                    field.type === 'date' ? 'text-blue-500' : 'text-muted-foreground')}>
                                {field.type} Field
                            </span>
                            <span className="text-base font-medium text-foreground truncate">
                                {field.label || 'Untitled Field'}
                            </span>
                        </div>
                        {field.required && (
                            <span className="text-[11px] text-red-500/80 bg-red-500/5 px-1.5 rounded border border-red-500/10">Required</span>
                        )}
                        {selected && (
                            <div className='flex items-center gap-1'>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10"
                                >
                                    <Settings size={18} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                    onClick={onRemove}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>

                        )}
                    </div>
                    <div className="mt-1 flex gap-2 overflow-hidden">
                        {/* ID hidden as per user request */}

                    </div>
                </div>
            </div>
        </div>
    );
}
