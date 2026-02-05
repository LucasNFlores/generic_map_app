'use client';

import * as React from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { ShapeWithPoints, Category } from '@/types';
import { Container as ContainerShapeInfo } from "./Container";
import Input from './Input';
import Textarea from './TextArea';
import Select from './Select';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface ShapeFormProps {
    shape: ShapeWithPoints;
    isNew?: boolean;
}

export function ShapeForm({ shape, isNew = false }: ShapeFormProps) {
    const setSelectedShape = useMapStore((state: MapStore) => state.setSelectedShape);
    const setMode = useMapStore((state: MapStore) => state.setMode);
    const clearPendingPoints = useMapStore((state: MapStore) => state.clearPendingPoints);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);
    const categories = useMapStore((state: MapStore) => state.categories);

    const [formData, setFormData] = useState({
        name: shape.name || '',
        description: shape.description || '',
        location_address: shape.location_address || '',
        category_id: shape.category_id || (categories.length > 0 ? categories[0].id : ''),
        metadata: shape.metadata || {},
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setFormData({
            name: shape.name || '',
            description: shape.description || '',
            location_address: shape.location_address || '',
            category_id: shape.category_id || (categories.length > 0 ? categories[0].id : ''),
            metadata: shape.metadata || {},
        });
    }, [shape, categories]);

    const handleClose = () => {
        setSelectedShape(null);
        setMode('browse');
        clearPendingPoints();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMetadataChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            metadata: { ...prev.metadata, [fieldId]: value }
        }));
    };

    const selectedCategory = categories.find(c => c.id === formData.category_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || isDeleting) return;

        if (!formData.category_id) {
            toast.error('Debes seleccionar una categoría.');
            return;
        }

        setIsLoading(true);
        const saveToast = toast.loading(isNew ? 'Creando...' : 'Guardando cambios...');

        try {
            const url = isNew ? '/api/shapes' : `/api/shapes/${shape.id}`;
            const method = isNew ? 'POST' : 'PATCH';

            const payload = isNew ? {
                ...formData,
                type: shape.type,
                points: shape.shape_points.map(sp => sp.points)
            } : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            toast.dismiss(saveToast);

            if (response.ok) {
                toast.success(isNew ? 'Forma creada correctamente.' : 'Cambios guardados.');
                handleClose();
                fetchShapes();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'No se pudo guardar.');
            }
        } catch (error) {
            toast.dismiss(saveToast);
            toast.error('Error de conexión al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isNew) {
            handleClose();
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar esta forma?')) return;

        setIsDeleting(true);
        const deleteToast = toast.loading('Eliminando forma...');

        try {
            const response = await fetch(`/api/shapes/${shape.id}`, { method: 'DELETE' });
            toast.dismiss(deleteToast);

            if (response.ok) {
                toast.success('Forma eliminada correctamente.');
                handleClose();
                fetchShapes();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'No se pudo eliminar.');
            }
        } catch (error) {
            toast.dismiss(deleteToast);
            toast.error('Error de conexión al eliminar.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ContainerShapeInfo onSubmit={handleSubmit}>
            <div className="flex justify-between items-center w-full mb-2">
                <h3 className="text-lg font-semibold text-primary">
                    {isNew ? 'Nueva ' : 'Editar '}
                    {shape.type === 'point' ? 'Punto' : shape.type === 'line' ? 'Línea' : 'Polígono'}
                </h3>
                <button type="button" onClick={handleClose} className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required />

            <Select label="Categoría" name="category_id" value={formData.category_id} onChange={handleChange} required>
                <option value="">Seleccionar categoría...</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </Select>

            <Input label="Ubicación" name="location_address" value={formData.location_address} onChange={handleChange} />

            {/* CAMPOS DINÁMICOS BASADOS EN LA CATEGORÍA (excluyendo auto_id) */}
            {selectedCategory?.fields_definition?.filter(field => field.type !== 'auto_id').map(field => (
                <div key={field.id} className="mt-2 text-primary">
                    {field.type === 'select' ? (
                        <Select
                            label={field.label}
                            name={field.id}
                            value={formData.metadata[field.id] || ''}
                            onChange={(e) => handleMetadataChange(field.id, e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    ) : (
                        <Input
                            label={field.label}
                            name={field.id}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={formData.metadata[field.id] || ''}
                            onChange={(e) => handleMetadataChange(field.id, e.target.value)}
                        />
                    )}
                </div>
            ))}

            <Textarea label="Descripción" name="description" value={formData.description} onChange={handleChange} />

            <div className="flex gap-2 w-full mt-2">
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="w-1/3 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50">
                    {isNew ? 'Cancelar' : isDeleting ? 'Borrando...' : 'Eliminar'}
                </button>
                <button type="submit" disabled={isLoading || isDeleting} className="w-2/3 h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                    {isLoading ? 'Cargando...' : isNew ? 'Crear' : 'Guardar Cambios'}
                </button>
            </div>
        </ContainerShapeInfo>
    );
}
