'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Users, Shield, UserPlus,
    Trash2, Mail, Clock, ShieldCheck,
    MoreVertical, UserCheck
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

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    updated_at: string;
    email?: string; // Derived from config or metadata usually
}

interface Invitation {
    email: string;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    created_at: string;
}

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'supervisor' | 'invited'>('invited');
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Note: In real app, we'd probably have email in the profile 
            // but here we check if it's in config or metadata.
            // For now, assume it's available or use dummy if not.
            setUsers(data.users);
            setInvitations(data.invitations);
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            fetchData();
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
            fetchData();
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
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar usuario');
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col gap-8 p-8 max-w-7xl mx-auto bg-[#0a0e17]">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
                <div className="flex items-center gap-5">
                    <Link
                        href="/protected/map"
                        className="p-2.5 hover:bg-[#1e293b] rounded-xl transition-all border border-[#1e293b] bg-[#0f172a] shadow-lg group"
                        title="Volver al mapa"
                    >
                        <ArrowLeft size={20} className="text-[#94a3b8] group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Administración</h1>
                        <p className="text-[#94a3b8] text-sm">Gestiona usuarios, roles e invitaciones del sistema</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CategoryManager />

                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5 py-6 rounded-xl shadow-lg transition-all active:scale-95">
                                <UserPlus size={18} />
                                Invitar Usuario
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-[#0f172a] border-[#1e293b] text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Invitar Nuevo Usuario</DialogTitle>
                                <DialogDescription className="text-[#94a3b8]">
                                    El usuario recibirá el rol asignado automáticamente cuando se registre con este email.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#64748b]">Correo Electrónico</label>
                                    <Input
                                        placeholder="usuario@ejemplo.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-[#1e293b] border-[#334155] focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#64748b]">Rol Asignado</label>
                                    <Select
                                        value={inviteRole}
                                        onValueChange={(v: any) => setInviteRole(v)}
                                    >
                                        <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0f172a] border-[#1e293b] text-white">
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
                <section className="bg-[#0f172a] rounded-3xl border border-[#1e293b] overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[#1e293b] flex justify-between items-center bg-[#131c2e]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users size={20} className="text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Usuarios del Sistema</h2>
                        </div>
                        <Badge variant="secondary" className="bg-[#1e293b] text-[#94a3b8] border-[#334155] px-3 py-1 font-bold">
                            {users.length} Registros
                        </Badge>
                    </div>

                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-left">
                            <thead className="text-[#64748b] text-xs uppercase tracking-[0.15em] font-extrabold">
                                <tr>
                                    <th className="px-4 py-4">Usuario</th>
                                    <th className="px-4 py-4">Rol</th>
                                    <th className="px-4 py-4 text-center">Última Actividad</th>
                                    <th className="px-4 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e293b]">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-[#131c2e] transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/10">
                                                    {(user.first_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-white">
                                                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Usuario sin nombre'}
                                                    </span>
                                                    <span className="text-xs text-[#64748b]">ID: {user.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <Select
                                                defaultValue={user.role}
                                                onValueChange={(val) => handleUpdateRole(user.id, val)}
                                            >
                                                <SelectTrigger className="w-32 bg-[#1e293b] border-transparent hover:border-[#334155] h-8 text-[11px] font-bold uppercase transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0f172a] border-[#1e293b] text-white">
                                                    <SelectItem value="superadmin">Superadmin</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                                    <SelectItem value="invited">Invitado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <span className="text-xs text-[#64748b] font-medium">
                                                {new Date(user.updated_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-[#64748b] hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Eliminar Usuario"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-[#64748b] text-sm italic">
                                            No se encontraron usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Invitaciones Pendientes */}
                <section className="bg-[#0f172a] rounded-3xl border border-[#1e293b] overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[#1e293b] flex justify-between items-center bg-[#131c2e]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Clock size={20} className="text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Invitaciones Pendientes</h2>
                        </div>
                        <Badge variant="secondary" className="bg-[#1e293b] text-amber-500 border-amber-500/20 px-3 py-1 font-bold">
                            {invitations.length} Esperando
                        </Badge>
                    </div>

                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-left">
                            <thead className="text-[#64748b] text-xs uppercase tracking-[0.15em] font-extrabold">
                                <tr>
                                    <th className="px-4 py-4">Email</th>
                                    <th className="px-4 py-4">Rol Invitado</th>
                                    <th className="px-4 py-4 text-center">Fecha Envío</th>
                                    <th className="px-4 py-4 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e293b]">
                                {invitations.map((inv) => (
                                    <tr key={inv.email} className="group hover:bg-[#131c2e] transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Mail size={18} />
                                                </div>
                                                <span className="text-sm font-semibold text-white">{inv.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <Badge className="bg-[#1e293b] text-[#94a3b8] border-transparent uppercase text-[10px] font-bold">
                                                {inv.role}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <span className="text-xs text-[#64748b] font-medium">
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
                                        <td colSpan={4} className="py-10 text-center text-[#64748b] text-sm italic">
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
    );
}
