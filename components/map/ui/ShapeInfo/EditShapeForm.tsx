'use client';

import * as React from 'react';

import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import { ShapeWithPoints, WASTE_TYPES_LIST } from '@/types';

// Importar componentes de UI
import { Container as ContainerShapeInfo } from "./Container";
import Input from './Input';
import Textarea from './TextArea';
import Select from './Select';
import { toast } from 'react-hot-toast';

import { useState, useEffect } from 'react';

interface EditShapeFormProps {
    shape: ShapeWithPoints;
}

export function EditShapeForm({ shape }: EditShapeFormProps) {
    // Sacamos las acciones del store
    const setSelectedShape = useMapStore((state: MapStore) => state.setSelectedShape);
    const fetchShapes = useMapStore((state: MapStore) => state.fetchShapes);

    // Estado local para manejar los cambios del formulario
    const [formData, setFormData] = useState({
        name: shape.name || '',
        description: shape.description || '',
        location_address: shape.location_address || '',
        waste_type: shape.waste_type || 'otro',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sincronizar el estado del formulario si la shape seleccionada cambia
    useEffect(() => {
        setFormData({
            name: shape.name || '',
            description: shape.description || '',
            location_address: shape.location_address || '',
            waste_type: shape.waste_type || 'otro',
        });
    }, [shape]);

    const handleClose = () => {
        setSelectedShape(null); // Esto también cambia el modo a 'browse'
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // (Lógica de Guardar - Aún no implementada)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Evitar doble submit
        if (isLoading || isDeleting) return;

        setIsLoading(true);
        const saveToast = toast.loading('Guardando cambios...');

        try {
            const response = await fetch(`/api/shapes/${shape.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Enviamos el estado del formulario
            });

            toast.dismiss(saveToast);

            if (response.ok) {
                toast.success('Cambios guardados.');

                // 1. Refrescar el mapa para que muestre la info nueva
                // (Aunque el color de selección ya lo hace, esto 
                // actualizaría el 'tooltip' o 'popup' si lo tuvieras)
                fetchShapes();

                // 2. Opcional: Cierra el formulario tras guardar
                // setSelectedShape(null); 

                // 3. Opcional: Actualizar el estado local por si el 
                // usuario sigue editando (si .select() devuelve datos)
                const updatedShape = await response.json();
                setFormData({
                    name: updatedShape.name || '',
                    description: updatedShape.description || '',
                    location_address: updatedShape.location_address || '',
                    waste_type: updatedShape.waste_type || 'otro',
                });


            } else {
                const errorData = await response.json();
                console.error('Error al guardar:', errorData);
                toast.error(errorData.error || 'No se pudo guardar.');
            }

        } catch (error) {
            toast.dismiss(saveToast);
            console.error('Error de red al guardar:', error);
            toast.error('Error de conexión al guardar.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- (Lógica de Borrar) ---
    const handleDelete = async () => {
        // Confirmación simple
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta forma? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsDeleting(true);
        const deleteToast = toast.loading('Eliminando forma...');

        try {
            const response = await fetch(`/api/shapes/${shape.id}`, {
                method: 'DELETE',
            });

            toast.dismiss(deleteToast); // Quita el "Eliminando forma..."

            if (response.ok) {
                toast.success('Forma eliminada correctamente.');

                // 1. Cierra el formulario
                setSelectedShape(null);

                // 2. Refresca los datos del mapa
                fetchShapes();

            } else {
                // Error de la API (401, 500, etc.)
                const errorData = await response.json();
                console.error('Error al eliminar:', errorData);
                toast.error(errorData.error || 'No se pudo eliminar la forma.');
            }

        } catch (error) {
            toast.dismiss(deleteToast);
            console.error('Error de red al eliminar:', error);
            toast.error('Error de conexión al intentar eliminar.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ContainerShapeInfo onSubmit={handleSubmit}>
            {/* --- Fila de Título y Botón de Cerrar --- */}
            <div className="flex justify-between items-center w-full mb-2">
                <h3 className="text-lg font-semibold text-primary">
                    {shape.type === 'point' ? 'Editar Punto' : 'Editar Forma'}
                </h3>
                <button
                    type="button"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* --- Campos del Formulario --- */}
            <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
            />
            <Input
                label="Ubicación (Dirección)"
                name="location_address"
                value={formData.location_address}
                onChange={handleChange}
            />
            <Select
                label="Tipo de Residuo"
                name="waste_type"
                value={formData.waste_type}
                onChange={handleChange}
            >
                {WASTE_TYPES_LIST.map(wt => (
                    <option key={wt.value} value={wt.value}>{wt.label}</option>
                ))}
            </Select>
            <Textarea
                label="Comentarios"
                name="description"
                value={formData.description}
                onChange={handleChange}
            />

            {/* --- Botones de Acción --- */}
            <div className="flex gap-2 w-full mt-2">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting} // (Deshabilitado mientras borra)
                    className="w-1/3 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                    {isDeleting ? 'Borrando...' : 'Eliminar'}
                </button>
                <button
                    type="submit"
                    // (Deshabilitado si está guardando O borrando)
                    disabled={isLoading || isDeleting}
                    className="w-2/3 h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </ContainerShapeInfo>
    );
}