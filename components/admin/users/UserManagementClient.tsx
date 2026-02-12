'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search, UserPlus, MoreVertical, ArrowLeft,
    ChevronLeft, ChevronRight, Mail, Shield, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// Types
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

interface UserManagementClientProps {
    initialUsers: UserProfile[];
    totalUsers: number;
    currentPage: number;
    itemsPerPage: number;
    searchQuery: string;
    initialInvitations: Invitation[];
}

export function UserManagementClient({
    initialUsers,
    totalUsers,
    currentPage,
    itemsPerPage,
    searchQuery,
    initialInvitations
}: UserManagementClientProps) {
    const router = useRouter();
    // Remove unused hook
    // const searchParams = useSearchParams(); 

    // Local State
    const [searchValue, setSearchValue] = useState(searchQuery);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'supervisor' | 'invited'>('invited');

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== searchQuery) {
                router.push(`/protected/admin/users?page=1&query=${encodeURIComponent(searchValue)}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchValue, router, searchQuery]);

    const handlePageChange = (newPage: number) => {
        router.push(`/protected/admin/users?page=${newPage}&query=${encodeURIComponent(searchQuery)}`);
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
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error al invitar usuario');
        }
    };

    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/protected/admin"
                        className="p-2 hover:bg-accent rounded-xl transition-all border border-border bg-card shadow-sm group"
                        title="Volver al panel de administración"
                        aria-label="Volver al panel de administración"
                    >
                        <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Equipo & Configuración</h1>
                        <p className="text-muted-foreground mt-1">Gestiona permisos de acceso y miembros del equipo.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Mail size={16} />
                        Exportar Log
                    </Button>
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
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
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rol</label>
                                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
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
                                <Button onClick={handleInvite} disabled={!inviteEmail}>Enviar Invitación</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
                <Input
                    placeholder="Buscar usuarios por nombre, email o rol..."
                    className="pl-10 h-12 bg-card border-border shadow-sm text-base"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    aria-label="Buscar usuarios"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Users List (Left Column - 2/3 width) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                Miembros Activos
                                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">{totalUsers}</Badge>
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Usuario</th>
                                        <th className="px-4 py-3 font-medium">Rol</th>
                                        <th className="px-4 py-3 font-medium">Estado</th>
                                        <th className="px-4 py-3 font-medium">Última Actividad</th>
                                        <th className="px-4 py-3 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {initialUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                        {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Usuario sin nombre'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="font-normal capitalize bg-background">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-500">
                                                    <CheckCircle size={12} className="fill-emerald-600 text-background dark:fill-emerald-500" aria-hidden="true" />
                                                    Activo
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {new Date(user.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label={`Acciones para ${user.first_name || user.email}`}>
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Editar Rol</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive">Eliminar Usuario</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                    {initialUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    aria-label="Página anterior"
                                >
                                    <ChevronLeft size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    aria-label="Página siguiente"
                                >
                                    <ChevronRight size={14} aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invitations Sidebar (Right Column - 1/3 width) */}
                <div className="flex flex-col gap-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-primary" />
                            Roles del Sistema
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                <div>
                                    <h4 className="text-sm font-medium">Administrador</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Acceso total a configuración, usuarios y mapas.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                <div>
                                    <h4 className="text-sm font-medium">Supervisor</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Puede editar mapas y ver usuarios, pero no gestionar el equipo.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Invitations List */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Invitaciones Pendientes ({initialInvitations.length})</h3>
                        </div>
                        <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                            {initialInvitations.map((inv) => (
                                <div key={inv.email} className="p-4 flex items-center justify-between group hover:bg-muted/30">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                                            <Mail size={14} aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium truncate">{inv.email}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{inv.role}</div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 shadow-none border-0">
                                        Pendiente
                                    </Badge>
                                </div>
                            ))}
                            {initialInvitations.length === 0 && (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    No hay invitaciones pendientes.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
