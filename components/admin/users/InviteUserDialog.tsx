'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface InviteUserDialogProps {
    onInvite: (email: string, role: 'admin' | 'supervisor' | 'invited') => Promise<void>;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteUserDialog({ onInvite, isOpen, onOpenChange }: InviteUserDialogProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'supervisor' | 'invited'>('invited');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!email) return;
        setIsSubmitting(true);
        try {
            await onInvite(email, role);
            setEmail('');
            setRole('invited');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 font-bold shadow-md">
                    <UserPlus size={16} />
                    Invitar Usuario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
                    <DialogDescription>El usuario recibirá un email para unirse al equipo.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            placeholder="usuario@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger className="w-full" aria-label="Seleccionar Rol">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="invited">Invitado</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!email || isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
