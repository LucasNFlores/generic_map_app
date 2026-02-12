'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Users, UserPlus,
    Trash2, Mail, Clock
} from 'lucide-react';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    updated_at: string;
    email?: string;
}

interface Invitation {
    email: string;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    created_at: string;
}

interface AdminDashboardClientProps {
    initialUsers: UserProfile[];
    initialInvitations: Invitation[];
}

export function AdminDashboardClient({ initialUsers, initialInvitations }: AdminDashboardClientProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
    const [loading, setLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'supervisor' | 'invited'>('invited');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const router = useRouter();

    const refreshData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setUsers(data.users);
            setInvitations(data.invitations);
            router.refresh(); // Refresh server components if needed
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success(`Invitación enviada a ${inviteEmail}`);
            setIsInviteOpen(false);
            setInviteEmail('');
            refreshData();
        } catch (error: any) {
            toast.error(error.message || 'Error al invitar usuario');
        }
    };

    const handleUpdateRole = async (id: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success('Rol actualizado');
            refreshData();
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar rol');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success('Usuario eliminado');
            refreshData();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar usuario');
        }
    };

    return (
        <div className="flex-1 w-full min-h-full bg-background overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/protected/map"
                            className="p-2.5 hover:bg-accent rounded-xl transition-all border border-border bg-card shadow-lg group"
                            title="Volver al mapa"
                        >
                            <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Administración</h1>
                            <p className="text-muted-foreground text-sm">Gestiona usuarios, roles e invitaciones del sistema</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <CategoryManager />

                        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 px-5 py-6 rounded-xl shadow-lg transition-all active:scale-95">
                                    <UserPlus size={18} />
                                    Invitar Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Invitar Nuevo Usuario</DialogTitle>
                                    <DialogDescription className="text-muted-foreground">
                                        El usuario recibirá el rol asignado automáticamente cuando se registre con este email.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground">Correo Electrónico</label>
                                        <Input
                                            placeholder="usuario@ejemplo.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="bg-background border-input focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground">Rol Asignado</label>
                                        <Select
                                            value={inviteRole}
                                            onValueChange={(v: any) => setInviteRole(v)}
                                        >
                                            <SelectTrigger className="bg-background border-input">
                                                <SelectValue placeholder="Seleccionar rol" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                <SelectItem value="invited">Invitado (Lectura)</SelectItem>
                                                <SelectItem value="supervisor">Supervisor (Edición)</SelectItem>
                                                <SelectItem value="admin">Administrador (Gestión)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleInvite}
                                        className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-bold"
                                        disabled={!inviteEmail}
                                    >
                                        Enviar Invitación
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>

                {/* Content Tabs/Sections */}
                <div className="grid grid-cols-1 gap-8">

                    {/* Usuarios Registrados */}
                    <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users size={20} className="text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Usuarios del Sistema</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-border px-3 py-1 font-bold">
                                    {users.length} Registros
                                </Badge>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left">
                                <thead className="text-muted-foreground text-xs uppercase tracking-[0.15em] font-extrabold">
                                    <tr>
                                        <th className="px-4 py-4">Usuario</th>
                                        <th className="px-4 py-4">Rol</th>
                                        <th className="px-4 py-4 text-center">Última Actividad</th>
                                        <th className="px-4 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map((user) => (
                                        <tr key={user.id} className="group hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/10">
                                                        {(user.first_name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Usuario sin nombre'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(val) => handleUpdateRole(user.id, val)}
                                                >
                                                    <SelectTrigger className="w-32 bg-background border-transparent hover:border-input h-8 text-[11px] font-bold uppercase transition-all">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                                        <SelectItem value="superadmin">Superadmin</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                                        <SelectItem value="invited">Invitado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {new Date(user.updated_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        title="Eliminar Usuario"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm italic">
                                                No se encontraron usuarios registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Invitaciones Pendientes */}
                    <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Clock size={20} className="text-amber-500" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Invitaciones Pendientes</h2>
                            </div>
                            <Badge variant="secondary" className="bg-muted text-amber-500 border-amber-500/20 px-3 py-1 font-bold">
                                {invitations.length} Esperando
                            </Badge>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left">
                                <thead className="text-muted-foreground text-xs uppercase tracking-[0.15em] font-extrabold">
                                    <tr>
                                        <th className="px-4 py-4">Email</th>
                                        <th className="px-4 py-4">Rol Invitado</th>
                                        <th className="px-4 py-4 text-center">Fecha Envío</th>
                                        <th className="px-4 py-4 text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {invitations.map((inv) => (
                                        <tr key={inv.email} className="group hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                        <Mail size={18} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground">{inv.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <Badge className="bg-muted text-muted-foreground border-transparent uppercase text-[10px] font-bold">
                                                    {inv.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {new Date(inv.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-right">
                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-tighter">
                                                    Pendiente
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {invitations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm italic">
                                                No hay invitaciones pendientes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
