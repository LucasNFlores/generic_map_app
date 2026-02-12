'use client';

import { Shield, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Invitation {
    email: string;
    role: 'superadmin' | 'admin' | 'supervisor' | 'invited';
    created_at: string;
}

interface InvitationsSidebarProps {
    invitations: Invitation[];
}

export function InvitationsSidebar({ invitations }: InvitationsSidebarProps) {
    return (
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
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Invitaciones Pendientes ({invitations.length})</h3>
                </div>
                <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                    {invitations.map((inv) => (
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
                    {invitations.length === 0 && (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No hay invitaciones pendientes.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
