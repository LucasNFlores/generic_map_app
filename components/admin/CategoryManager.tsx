'use client';

import * as React from 'react';
import { Plus, Settings2, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';

export function CategoryManager() {
    const [open, setOpen] = React.useState(false);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [isCreating, setIsCreating] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    // Cargar categorías al abrir el dialog
    React.useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCategories();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar categoría');
        }
    };

    const handleSaveSuccess = () => {
        setIsCreating(false);
        setSelectedCategory(null);
        fetchCategories();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Settings2 size={16} />
                    Configurar Categorías
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gestión de Categorías</DialogTitle>
                    <DialogDescription>
                        Define las categorías y sus campos personalizados para los puntos del mapa
                    </DialogDescription>
                </DialogHeader>

                {!isCreating && !selectedCategory ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Categorías existentes ({categories.length})
                            </h3>
                            <Button
                                onClick={() => setIsCreating(true)}
                                size="sm"
                                className="gap-2"
                            >
                                <Plus size={14} />
                                Nueva Categoría
                            </Button>
                        </div>

                        {loading ? (
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        ) : categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay categorías. Crea una para comenzar.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{category.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {category.fields_definition?.length || 0} campos definidos
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <Trash2 size={14} className="text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <CategoryForm
                        category={selectedCategory}
                        onSuccess={handleSaveSuccess}
                        onCancel={() => {
                            setIsCreating(false);
                            setSelectedCategory(null);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
