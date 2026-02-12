import * as React from 'react';
import { Plus, GripVertical as DragIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectOptionsEditorProps {
    options: string[];
    onChange: (options: string[]) => void;
}

interface SortableItemProps {
    id: string;
    index: number;
    value: string;
    onUpdate: (value: string) => void;
    onRemove: () => void;
}

const SortableItem = ({ id, index, value, onUpdate, onRemove }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group",
                isDragging
                    ? "bg-primary/10 border-primary/40 opacity-70 shadow-inner z-50"
                    : "bg-muted/50 border-border hover:border-primary/30"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors"
            >
                <DragIcon size={14} />
            </div>

            <input
                value={value}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 bg-transparent border-none text-foreground text-sm outline-none placeholder:text-muted-foreground font-medium"
            />

            <button
                type="button"
                onClick={onRemove}
                className="text-muted-foreground hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

export const SelectOptionsEditor = ({ options, onChange }: SelectOptionsEditorProps) => {
    // We use internal state with stable IDs to handle dnd-kit reordering correctly,
    // especially when there are duplicate strings (like two empty options).
    const [items, setItems] = React.useState<{ id: string; value: string }[]>(
        options.map((opt, i) => ({ id: `id-${i}-${Math.random()}`, value: opt }))
    );

    // Keep internal items in sync with external options
    React.useEffect(() => {
        // Only update if the values actually changed to avoid losing cursor focus or drag state
        const currentValues = items.map(item => item.value);
        if (JSON.stringify(currentValues) !== JSON.stringify(options)) {
            setItems(options.map((opt, i) => ({ id: `id-${i}-${Date.now()}`, value: opt })));
        }
    }, [options]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Reduced from 8 for better sensitivity
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addOption = () => {
        const newItems = [...items, { id: `id-${Date.now()}-${Math.random()}`, value: '' }];
        setItems(newItems);
        onChange(newItems.map(i => i.value));
    };

    const removeOption = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        onChange(newItems.map(i => i.value));
    };

    const updateOption = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], value };
        setItems(newItems);
        onChange(newItems.map(i => i.value));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);

            const reorderedItems = arrayMove(items, oldIndex, newIndex);
            setItems(reorderedItems);
            onChange(reorderedItems.map(i => i.value));
        }
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Options</label>
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                    <SortableContext
                        items={items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((item, idx) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                index={idx}
                                value={item.value}
                                onUpdate={(val) => updateOption(idx, val)}
                                onRemove={() => removeOption(idx)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {items.length === 0 && (
                    <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground font-medium">No options added yet.</p>
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
