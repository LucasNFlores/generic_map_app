'use client';

import * as React from 'react';
import { useMapStore } from '@/providers/map-store-provider';
import type { MapStore } from '@/stores/map-store';
import type { ShapeWithPoints } from '@/types';
import { Container as ContainerShapeInfo } from "./Container";
import Input from './Input';
import { X } from 'lucide-react'; // Icono para cerrar
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Un componente Textarea simple para los comentarios
const Textarea = React.forwardRef<HTMLTextAreaElement, any>(function Textarea({ label, name, ...props }, ref) {
    return (
        <div className="relative">
            <textarea
                ref={ref}
                id={name}
                name={name}
                placeholder=" "
                rows={3}
                className="block w-full px-3 py-2 text-primary bg-background rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                {...props}
            />
            <label
                htmlFor={name}
                className="absolute hover:cursor-text text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                {label}
            </label>
        </div>
    );
});

// Helper para el <select> (para mantener el estilo flotante)
const Select = React.forwardRef<HTMLSelectElement, any>(function Select({ label, name, children, ...props }, ref) {
    return (
        <div className="relative">
            <select
                ref={ref}
                id={name}
                name={name}
                className="block w-full px-3 py-2 text-primary bg-background rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                {...props}
            >
                {children}
            </select>
            <label
                htmlFor={name}
                className="absolute hover:cursor-text text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                {label}
            </label>
        </div>
    );
});


// Opciones del Select (deben coincidir con tu ENUM de Supabase)
const wasteTypes: { value: WasteType, label: string }[] = [
    { value: 'vidrio', label: 'Vidrio' },
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel_carton', label: 'Papel/Cartón' },
    { value: 'organico', label: 'Orgánico' },
    { value: 'otro', label: 'Otro' },
];

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
        toast.error('La función de guardar aún no está implementada.');
        // Aquí iría la lógica de PUT a /api/shapes/[id]
    };

    // (Lógica de Borrar - Aún no implementada)
    const handleDelete = async () => {
        toast.error('La función de borrar aún no está implementada.');
        // Aquí iría la lógica de DELETE a /api/shapes/[id]
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
                {wasteTypes.map(wt => (
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
                    disabled={isDeleting}
                    className="w-1/3 text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
                >
                    {isDeleting ? 'Borrando...' : 'Eliminar'}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </ContainerShapeInfo>
    );
}