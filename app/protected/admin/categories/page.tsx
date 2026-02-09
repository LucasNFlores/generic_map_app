'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Hexagon,
    Search,
    Bell,
    Save,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Category, FormFieldDefinition } from '@/types';
import { FieldDefinitionBuilder } from '@/components/admin/FieldDefinitionBuilder';
import { CategorySidebar } from '@/components/admin/CategorySidebar';
import { FieldPropertiesPanel } from '@/components/admin/FieldPropertiesPanel';

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

    const handleSave = async () => {
        if (!selectedCategory) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/categories/${selectedCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedCategory)
            });
            if (res.ok) {
                // Update local list to reflect changes
                setCategories(prev => prev.map(c => c.id === selectedCategory.id ? selectedCategory : c));
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
        <div className="flex flex-col h-screen bg-[#101622] text-white overflow-hidden font-sans">
            {/* Header */}
            <header className="flex-none flex items-center justify-between border-b border-[#222f49] px-6 py-3 bg-[#101623] z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-8 flex items-center justify-center bg-primary/20 rounded-lg text-primary">
                            <Hexagon size={20} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">GeoAdmin</h2>
                    </div>

                    <div className="h-6 w-px bg-[#222f49] mx-2" />

                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/protected/admin" className="text-[#90a4cb] hover:text-white transition-colors">
                            Admin
                        </Link>
                        <ChevronRight size={16} className="text-[#90a4cb]" />
                        <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                            Categories
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-[#90a4cb] hover:text-white">
                            <Search size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-[#90a4cb] hover:text-white relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#101623]" />
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-[#222f49] mx-2" />

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="border-[#222f49] text-white hover:bg-white/5"
                            asChild
                        >
                            <Link href="/protected/map">
                                <ArrowLeft size={16} className="mr-2" />
                                Back to Map
                            </Link>
                        </Button>

                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar: Categories List */}
                <CategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    loading={loading}
                // onNewCategory logic could be added here
                />

                {/* Center Canvas: Builder Area */}
                <main className="flex-1 bg-[#0b0f19] relative overflow-hidden flex flex-col">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />

                    {selectedCategory ? (
                        <>
                            <div className="flex-none p-8 pb-4 z-10">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-1">
                                            Categoria: {selectedCategory.name}
                                        </h1>
                                        <p className="text-[#90a4cb] text-sm">
                                            Configura los campos que tendra esta categoria
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-primary hover:bg-blue-600 shadow-[0_0_20px_rgba(37,106,244,0.15)]"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        <Save size={18} className="mr-2" />
                                        {isSaving ? 'Saving...' : 'Save Schema'}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 pb-20 pt-2 custom-scrollbar z-10">
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
                            <p className="text-[#5a6b8c]">Selecciona una categoria para comenzar a editarla</p>
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
                    background: #222f49;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #314368;
                }
            `}</style>
        </div>
    );
}
