'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    updated_at: string;
    email?: string;
}

interface EditUserDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
    onSave: (id: string, updates: Partial<UserProfile>) => Promise<void>;
}

export function EditUserDialog({ isOpen, onOpenChange, user, onSave }: EditUserDialogProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<string>('invited');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setRole(user.role);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            await onSave(user.id, {
                first_name: firstName,
                last_name: lastName,
                role: role as UserProfile['role']
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save user", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del perfil y permisos del usuario.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right text-muted-foreground whitespace-nowrap">
                            Email
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="edit-email"
                                value={user?.email || ''}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-firstname" className="text-right whitespace-nowrap">
                            Nombre
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="edit-firstname"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-background"
                                placeholder="Ej: Juan"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-lastname" className="text-right whitespace-nowrap">
                            Apellido
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="edit-lastname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-background"
                                placeholder="Ej: Pérez"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-role" className="text-right whitespace-nowrap">
                            Rol
                        </Label>
                        <div className="col-span-3">
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invited">Invitado (Solo Lectura)</SelectItem>
                                    <SelectItem value="supervisor">Supervisor (Gestión Básica)</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
