import * as React from 'react';
import { Settings } from 'lucide-react';
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
}

export function FieldPropertiesPanel({
    selectedFieldId,
    selectedCategory,
    onChangeCategory,
    onChangeField,
    onClose
}: FieldPropertiesPanelProps) {

    // Find selected field if any
    const selectedField = React.useMemo(() => {
        if (!selectedFieldId || !selectedCategory?.fields_definition) return null;
        return selectedCategory.fields_definition.find(f => f.id === selectedFieldId);
    }, [selectedFieldId, selectedCategory]);

    return (
        <aside className="w-80 bg-[#101623] border-l border-[#222f49] flex flex-col z-20 shadow-xl overflow-y-auto">
            <div className="flex-none border-b border-[#222f49] p-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Settings size={14} />
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                        {selectedFieldId ? 'Field Properties' : 'Category Settings'}
                    </h3>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-8">
                {/* Category Basic Settings */}
                {!selectedFieldId && selectedCategory && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-[#5a6b8c] uppercase tracking-widest block mb-4">
                                Category Identity
                            </label>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-[#90a4cb] block mb-1.5 font-medium">Display Name</label>
                                    <input
                                        value={selectedCategory.name}
                                        onChange={(e) => onChangeCategory({ ...selectedCategory, name: e.target.value })}
                                        className="w-full bg-[#161e2e] border border-[#222f49] rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#90a4cb] block mb-1.5 font-medium">Brand Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={selectedCategory.color}
                                            onChange={(e) => onChangeCategory({ ...selectedCategory, color: e.target.value })}
                                            className="w-12 h-12 bg-[#161e2e] border border-[#222f49] p-1 cursor-pointer rounded-xl"
                                        />
                                        <input
                                            value={selectedCategory.color}
                                            onChange={(e) => onChangeCategory({ ...selectedCategory, color: e.target.value })}
                                            className="flex-1 bg-[#161e2e] border border-[#222f49] rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary outline-none uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#222f49]">
                            <label className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest block mb-4">
                                Destructive
                            </label>
                            <Button
                                variant="outline"
                                className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40 rounded-xl py-6 underline underline-offset-4"
                            >
                                Delete this category
                            </Button>
                        </div>
                    </div>
                )}

                {/* Selected Field Editor */}
                {selectedField && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Settings size={16} />
                                </div>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                    Editing: {selectedField.label || 'Field'}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-[#90a4cb] block mb-1.5 font-medium">Field Label</label>
                                    <input
                                        value={selectedField.label}
                                        onChange={(e) => onChangeField({ label: e.target.value })}
                                        placeholder="e.g. Garbage Type"
                                        className="w-full bg-[#161e2e] border border-[#222f49] rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary outline-none transition-all shadow-inner"
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
                        <div className="pt-6 border-t border-[#222f49] space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white font-medium">Required Field</span>
                                <button
                                    onClick={() => onChangeField({ required: !selectedField.required })}
                                    className={cn(
                                        "w-10 h-6 rounded-full relative transition-colors duration-200",
                                        selectedField.required ? "bg-primary" : "bg-[#222f49]"
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
                                    <span className="text-sm text-white font-medium">Visible to Users</span>
                                    <button
                                        onClick={() => onChangeField({ visible: !selectedField.visible })}
                                        className={cn(
                                            "w-10 h-6 rounded-full relative transition-colors duration-200",
                                            selectedField.visible ? "bg-primary" : "bg-[#222f49]"
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

                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full text-[#90a4cb] hover:text-white"
                        >
                            Close Properties
                        </Button>
                    </div>
                )}

                {!selectedCategory && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                        <div className="p-4 rounded-full bg-[#161e2e] text-[#5a6b8c]">
                            <Settings size={32} />
                        </div>
                        <p className="text-sm text-[#5a6b8c]">Select a category to view its properties</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[#161e2e]/30 backdrop-blur-sm border-t border-[#222f49]">
                <div className="text-[10px] text-[#5a6b8c] leading-tight flex items-center justify-between">
                    <span>GeoAdmin v1.0</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>
        </aside>
    );
}
