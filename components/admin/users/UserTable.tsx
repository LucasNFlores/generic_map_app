'use client';

import { CheckCircle, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    updated_at: string;
    email?: string;
    config?: { email?: string };
}

interface UserTableProps {
    users: UserProfile[];
    totalUsers: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onEdit: (user: UserProfile) => void;
}

export function UserTable({
    users,
    totalUsers,
    currentPage,
    itemsPerPage,
    onPageChange,
    onEdit
}: UserTableProps) {
    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    Miembros Activos
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">{totalUsers}</Badge>
                </h2>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)] min-h-[400px] scrollbar-thin scrollbar-thumb-border">
                <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground uppercase text-xs sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 font-medium border-b border-border">Usuario</th>
                            <th className="px-4 py-3 font-medium border-b border-border">Rol</th>
                            <th className="px-4 py-3 font-medium border-b border-border">Estado</th>
                            <th className="px-4 py-3 font-medium border-b border-border">Última Actividad</th>
                            <th className="px-4 py-3 font-medium text-center border-b border-border">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                            {(user.first_name || user.email || user.config?.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Usuario sin nombre'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{user.email || user.config?.email || 'No email'}</div>
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
                                <td className="px-4 py-4 text-right flex justify-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:cursor-pointer" aria-label={`Acciones para ${user.first_name || user.email}`}>
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer">Editar Usuario</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive">Eliminar Usuario</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
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
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft size={14} aria-hidden="true" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight size={14} aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
