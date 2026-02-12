import * as React from 'react';
import Link from 'next/link';
import { Search, Plus, Settings, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface CategorySidebarProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelectCategory: (category: Category) => void;
    loading: boolean;
    onNewCategory?: () => void;
    className?: string;
}

export function CategorySidebar({
    categories,
    selectedCategory,
    onSelectCategory,
    loading,
    onNewCategory,
    className
}: CategorySidebarProps) {


    return (
        <aside className={cn("w-full md:w-72 bg-[#101623] border-r border-[#222f49] flex flex-col z-10", className)}>
            <div className="p-4 border-b border-[#222f49] space-y-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/protected/admin"
                        className="p-2 hover:bg-[#1e293b] rounded-lg transition-all border border-[#222f49] bg-[#161e2e] group"
                        title="Volver al panel"
                        aria-label="Volver al panel de administración"
                    >
                        <ArrowLeft size={16} className="text-[#90a4cb] group-hover:text-white transition-colors" aria-hidden="true" />
                    </Link>
                    <span className="font-bold text-white text-sm tracking-wide">Categorías</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90a4cb]" size={18} />
                    <input
                        className="w-full h-10 bg-[#161e2e] border border-[#222f49] rounded-xl pl-10 pr-4 text-sm text-white placeholder-[#5a6b8c] focus:outline-none focus:border-primary transition-all"
                        placeholder="Filter categories..."
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                <div className="px-3 py-2 text-xs font-bold text-[#5a6b8c] uppercase tracking-wider">
                    Schemas
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-[#5a6b8c]">Loading categories...</div>
                ) : (
                    categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl transition-all group border",
                                selectedCategory?.id === category.id
                                    ? "bg-primary/10 border-primary/20 text-white"
                                    : "hover:bg-white/5 border-transparent text-[#90a4cb] hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        selectedCategory?.id === category.id ? "bg-primary text-white" : "bg-[#1e293b] text-[#90a4cb]"
                                    )}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-bold truncate max-w-[140px]">{category.name}</div>
                                    <div className="text-[10px] opacity-60">
                                        {category.fields_definition?.length || 0} Fields
                                    </div>
                                </div>
                            </div>
                            {selectedCategory?.id === category.id && (
                                <Settings size={14} className="text-primary" />
                            )}
                        </button>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-[#222f49]">
                <Button
                    variant="outline"
                    className="w-full border-dashed border-[#314368] text-[#90a4cb] hover:text-white hover:border-primary hover:bg-primary/5 transition-all"
                    onClick={onNewCategory}
                >
                    <Plus size={18} className="mr-2" />
                    Nueva categoria
                </Button>
            </div>
        </aside>
    );
}
