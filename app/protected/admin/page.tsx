'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Shield } from 'lucide-react';
import { CategoryManager } from '@/components/admin/CategoryManager';

// Mock de usuarios para la vista inicial
const MOCK_USERS = [
    { id: '1', email: 'lucas@example.com', role: 'superadmin', created_at: '2024-02-01' },
    { id: '2', email: 'supervisor@example.com', role: 'supervisor', created_at: '2024-02-02' },
    { id: '3', email: 'invitado@example.com', role: 'invited', created_at: '2024-02-03' },
];

export default function AdminDashboardPage() {
    return (
        <div className="flex-1 w-full flex flex-col gap-6 p-6 max-w-6xl mx-auto">
            {/* Header con navegación */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/protected/map"
                        className="p-2 hover:bg-muted rounded-full transition-colors border shadow-sm"
                        title="Volver al mapa"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Administración</h1>
                        <p className="text-sm text-muted-foreground">Gestiona usuarios y permisos del sistema</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <CategoryManager />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg">
                        <Shield size={14} className="text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase">SuperAdmin Access</span>
                    </div>
                </div>
            </div>

            <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-soft">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Usuarios del Sistema</h2>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-1 rounded font-bold text-muted-foreground">
                        {MOCK_USERS.length} Registros
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-muted-foreground text-xs uppercase tracking-widest">
                                <th className="pb-2 pl-4 font-semibold">Usuario</th>
                                <th className="pb-2 font-semibold">Rol</th>
                                <th className="pb-2 font-semibold text-center">Ingreso</th>
                                <th className="pb-2 pr-4 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="bg-muted/10 hover:bg-muted/20 transition-colors rounded-lg overflow-hidden">
                                    <td className="py-4 pl-4 rounded-l-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${user.role === 'superadmin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                            user.role === 'supervisor' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-muted text-muted-foreground border-transparent'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 text-[11px] text-muted-foreground font-medium text-center">{user.created_at}</td>
                                    <td className="py-4 pr-4 text-right rounded-r-lg">
                                        <button className="text-[11px] bg-background hover:bg-muted border px-3 py-1 rounded-md font-bold transition-all shadow-sm">
                                            Gestionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
