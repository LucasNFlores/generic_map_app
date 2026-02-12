import * as React from 'react';
import { Settings, Trash2, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category, FormFieldDefinition } from '@/types';
import { FieldTypeSelector } from './FieldTypeSelector';
import { SelectOptionsEditor } from './SelectOptionsEditor';

interface FieldPropertiesPanelProps {
    selectedFieldId: string;
    selectedCategory: Category | null;
    onChangeCategory: (category: Category) => void;
    onChangeField: (updates: Partial<FormFieldDefinition>) => void;
    onClose: () => void;
    className?: string;
}

export function FieldPropertiesPanel({
    selectedFieldId,
    selectedCategory,
    onChangeCategory,
    onChangeField,
    onClose,
    className
}: FieldPropertiesPanelProps) {

    // Find selected field if any
    const selectedField = React.useMemo(() => {
        if (!selectedFieldId || !selectedCategory?.fields_definition) return null;
        return selectedCategory.fields_definition.find(f => f.id === selectedFieldId);
    }, [selectedFieldId, selectedCategory]);

    const isSettingsMode = selectedFieldId === 'SETTINGS';

    return (
        <aside className={cn("w-full md:w-80 bg-card border-l border-border flex flex-col z-20 shadow-xl overflow-y-auto", className)}>
            <div className="flex justify-between items-center border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-2 text-muted-foreground"
                        onClick={onClose}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Settings size={14} />
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/90">
                        {selectedField ? 'Propiedades del Campo' : 'Ajustes de Categoría'}
                    </h3>
                </div>

                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-fit text-muted-foreground hover:text-foreground hidden md:flex"
                >
                    <X size={14} />
                </Button>

            </div>

            <div className="flex-1 p-6 space-y-8">
                {/* Category Basic Settings - Show if explicitly in settings mode OR no field selected (desktop default) */}
                {(isSettingsMode || (!selectedFieldId && selectedCategory)) && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">
                                Identidad de Categoría
                            </label>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Nombre de la Categoría</label>
                                    <input
                                        value={selectedCategory?.name || ''}
                                        onChange={(e) => selectedCategory && onChangeCategory({ ...selectedCategory, name: e.target.value })}
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Color de Marca</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={selectedCategory?.color || '#000000'}
                                            onChange={(e) => selectedCategory && onChangeCategory({ ...selectedCategory, color: e.target.value })}
                                            className="w-12 h-12 bg-muted/50 border border-border p-1 cursor-pointer rounded-xl"
                                        />
                                        <input
                                            value={selectedCategory?.color || '#000000'}
                                            onChange={(e) => selectedCategory && onChangeCategory({ ...selectedCategory, color: e.target.value })}
                                            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-primary outline-none uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <label className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest block mb-4">
                                Peligro
                            </label>
                            <Button
                                variant="outline"
                                className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40 rounded-xl py-6"
                            >
                                <Trash2 size={16} />
                                Borrar esta categoria
                            </Button>
                        </div>
                    </div>
                )}

                {/* Selected Field Editor */}
                {selectedField && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Nombre del Campo (Label)</label>
                                    <input
                                        value={selectedField.label}
                                        onChange={(e) => onChangeField({ label: e.target.value })}
                                        placeholder="e.g. Garbage Type"
                                        className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <FieldTypeSelector
                                    currentType={selectedField.type}
                                    onTypeSelect={(type) => onChangeField({ type })}
                                />
                            </div>
                        </div>

                        {/* Type Specific settings */}
                        {(selectedField.type === 'select' || selectedField.type === 'multi_select') && (
                            <SelectOptionsEditor
                                options={selectedField.options || []}
                                onChange={(newOptions) => onChangeField({ options: newOptions })}
                            />
                        )}

                        {/* Global settings */}
                        <div className="pt-6 border-t border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground font-medium">Campo Obligatorio</span>
                                <button
                                    onClick={() => onChangeField({ required: !selectedField.required })}
                                    className={cn(
                                        "w-10 h-6 rounded-full relative transition-colors duration-200",
                                        selectedField.required ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200",
                                        selectedField.required ? "right-1" : "left-1"
                                    )} />
                                </button>
                            </div>

                            {selectedField.type === 'auto_id' && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-foreground font-medium">Visible para el Usuario</span>
                                    <button
                                        onClick={() => onChangeField({ visible: !selectedField.visible })}
                                        className={cn(
                                            "w-10 h-6 rounded-full relative transition-colors duration-200",
                                            selectedField.visible ? "bg-primary" : "bg-muted"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200",
                                            selectedField.visible ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>
                )}

                {!selectedCategory && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                        <div className="p-4 rounded-full bg-muted/50 text-muted-foreground">
                            <Settings size={32} />
                        </div>
                        <p className="text-sm text-muted-foreground">Selecciona una categoría para ver sus propiedades</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
