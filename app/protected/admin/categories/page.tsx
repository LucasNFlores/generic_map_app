'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Hexagon,
    Search,
    Bell,
    Save,
    ArrowLeft,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category, FormFieldDefinition } from '@/types';
import { FieldDefinitionBuilder } from '@/components/admin/categories/FieldDefinitionBuilder';
import { CategorySidebar } from '@/components/admin/categories/CategorySidebar';
import { FieldPropertiesPanel } from '@/components/admin/categories/FieldPropertiesPanel';

export default function CategoriesAdminPage() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [selectedFieldId, setSelectedFieldId] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Fetch categories on mount
    React.useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0 && !selectedCategory) {
                    setSelectedCategory(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewCategory = () => {
        const tempId = `temp-${Date.now()}`;
        const newCategory: Category = {
            id: '', // Empty ID signifies a new category
            name: 'Nueva Categoría',
            description: '',
            color: '#3b82f6',
            icon: 'MapPin',
            fields_definition: [],
            created_at: new Date().toISOString()
        };
        setSelectedCategory(newCategory);
        setSelectedFieldId('');
    };

    const handleSave = async () => {
        if (!selectedCategory) return;
        setIsSaving(true);
        try {
            const isNew = !selectedCategory.id;
            const url = isNew ? '/api/categories' : `/api/categories/${selectedCategory.id}`;
            const method = isNew ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedCategory)
            });

            if (res.ok) {
                const savedCategory = await res.json();
                if (isNew) {
                    setCategories(prev => [...prev, savedCategory]);
                } else {
                    setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
                }
                setSelectedCategory(savedCategory);
                // Opcional: Toast de éxito
            }
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateField = (updates: Partial<FormFieldDefinition>) => {
        if (!selectedCategory || !selectedFieldId) return;

        const fieldIndex = selectedCategory.fields_definition?.findIndex(f => f.id === selectedFieldId);
        if (fieldIndex === undefined || fieldIndex === -1) return;

        const newFields = [...(selectedCategory.fields_definition || [])];
        newFields[fieldIndex] = { ...newFields[fieldIndex], ...updates };

        setSelectedCategory({ ...selectedCategory, fields_definition: newFields });
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden font-sans">
            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar: Categories List */}
                <CategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => {
                        setSelectedCategory(cat);
                        setSelectedFieldId(''); // Reset field selection when changing category
                    }}
                    loading={loading}
                    onNewCategory={handleNewCategory}
                    className={cn(
                        // Mobile (< md): Hidden if category selected
                        selectedCategory ? "hidden" : "flex",
                        // Tablet (md - xl): Flex by default, but Hidden if editing a field (sliding window)
                        "md:flex",
                        selectedFieldId ? "md:hidden" : "",
                        // Desktop (>= xl): Always flex
                        "xl:flex"
                    )}
                />

                {/* Center Canvas: Builder Area */}
                <main className={cn(
                    "flex-1 bg-muted/30 relative overflow-hidden flex flex-col",
                    (!selectedCategory || (selectedFieldId && selectedFieldId !== '')) ? "hidden md:flex" : "flex"
                )}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    {selectedCategory ? (
                        <>
                            <div className="flex-none p-4 md:p-8 pb-4 z-10 border-b border-border md:border-none">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden -ml-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setSelectedCategory(null)}
                                            aria-label="Volver a la lista de categorías"
                                        >
                                            <ArrowLeft size={18} aria-hidden="true" />
                                        </Button>
                                        <div className="flex-1">
                                            <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 truncate">
                                                {selectedCategory.name}
                                            </h1>
                                            <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                                                Configura los campos que tendra esta categoria
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground md:hidden"
                                            onClick={() => setSelectedFieldId('SETTINGS')}
                                            aria-label="Configuración de la categoría"
                                        >
                                            <Settings size={18} aria-hidden="true" />
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            aria-label={isSaving ? 'Guardando cambios' : 'Guardar cambios'}
                                        >
                                            <Save size={16} className="mr-0 md:mr-2" aria-hidden="true" />
                                            <span className="hidden md:inline">{isSaving ? 'Guardando...' : 'Guardar'}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 pt-4 custom-scrollbar z-10">
                                <div className="max-w-3xl mx-auto">
                                    <FieldDefinitionBuilder
                                        fields={selectedCategory.fields_definition || []}
                                        onChange={(newFields) => setSelectedCategory({
                                            ...selectedCategory,
                                            fields_definition: newFields
                                        })}
                                        selectedFieldId={selectedFieldId}
                                        onSelectField={setSelectedFieldId}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-muted-foreground">Selecciona una categoría para comenzar a editarla</p>
                        </div>
                    )}
                </main>

                {/* Right Sidebar: Properties */}
                <FieldPropertiesPanel
                    selectedFieldId={selectedFieldId}
                    selectedCategory={selectedCategory}
                    onChangeCategory={setSelectedCategory}
                    onChangeField={handleUpdateField}
                    onClose={() => setSelectedFieldId('')}
                    className={cn(
                        !selectedFieldId ? "hidden xl:flex" : "flex"
                    )}
                />
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--border));
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--muted-foreground));
                }
            `}</style>
        </div>
    );
}
