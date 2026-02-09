import * as React from 'react';
import { Plus, GripVertical as DragIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOptionsEditorProps {
    options: string[];
    onChange: (options: string[]) => void;
}

export const SelectOptionsEditor = ({ options, onChange }: SelectOptionsEditorProps) => {
    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

    const addOption = () => onChange([...options, '']);

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        onChange(newOptions);
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        onChange(newOptions);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggingIndex === null || draggingIndex === index) return;

        const newOptions = [...options];
        const itemToMove = newOptions[draggingIndex];
        newOptions.splice(draggingIndex, 1);
        newOptions.splice(index, 0, itemToMove);

        setDraggingIndex(index);
        onChange(newOptions);
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
    };

    return (
        <div className="space-y-4 pt-6 border-t border-[#222f49]">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#5a6b8c] uppercase tracking-widest">Select Options</label>
                <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-all border border-primary/20 font-bold uppercase tracking-wider shadow-sm"
                >
                    <Plus size={12} />
                    Add Option
                </button>
            </div>

            <div className="space-y-2">
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group",
                            draggingIndex === idx
                                ? "bg-primary/10 border-primary/40 opacity-50 scale-[0.98] shadow-inner"
                                : "bg-[#161e2e] border-[#222f49] hover:border-primary/30"
                        )}
                    >
                        <div className="cursor-grab active:cursor-grabbing text-[#5a6b8c] hover:text-primary transition-colors">
                            <DragIcon size={14} />
                        </div>

                        <input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-[#5a6b8c] font-medium"
                        />

                        <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-[#5a6b8c] hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {options.length === 0 && (
                    <div className="text-center py-10 rounded-2xl border-2 border-dashed border-[#222f49] bg-[#161e2e]/30">
                        <p className="text-xs text-[#5a6b8c] font-medium">No options added yet.</p>
                        <button
                            type="button"
                            onClick={addOption}
                            className="mt-3 text-[10px] text-primary hover:text-primary-foreground bg-primary/5 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary transition-all font-bold uppercase tracking-wider"
                        >
                            + Create first option
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
