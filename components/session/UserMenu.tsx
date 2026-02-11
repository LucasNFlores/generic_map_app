'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, LayoutDashboard, Map, ClipboardList, Users, LogOut, MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    user: {
        first_name: string | null;
        last_name: string | null;
        role: string;
        email?: string;
    };
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDocked, setIsDocked] = useState(true); // Nuevo estado para auto-ocultar
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push('/auth/login');
    };

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Usuario';

    // Normalizamos el rol para mostrarlo bonito
    const roleNormalized = user.role.toLowerCase();
    let roleLabel = roleNormalized;

    if (['superadmin', 'admin'].includes(roleNormalized)) {
        roleLabel = 'Administrador';
    } else if (roleNormalized === 'supervisor') {
        roleLabel = 'Supervisor';
    } else if (roleNormalized === 'invited') {
        roleLabel = 'Invitado';
    }

    return (
        <div
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-[100] w-[95%] md:w-auto min-w-[340px] max-w-[500px] transition-all duration-500 ease-in-out group",
                isDocked
                    ? "top-0 -translate-y-[calc(100%-12px)] hover:-translate-y-[60%]"
                    : "top-6 translate-y-0"
            )}
        >
            {/* Zona Roja (Espacio invisible sobre el menú para ocultar) */}
            {!isDocked && (
                <div
                    className="absolute -top-6 left-0 right-0 h-6 cursor-pointer z-10 flex items-center justify-center group/redzone"
                    title="Hacer click aquí para ocultar"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDocked(true);
                        setIsOpen(false);
                    }}
                >
                    <ChevronUp className="h-5 w-5 text-primary opacity-0 group-hover/redzone:opacity-100 transition-opacity translate-y-2 animate-bounce" />
                </div>
            )}

            {/* Pill Container */}
            <div
                className={cn(
                    "bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden relative",
                    isOpen ? "rounded-b-none border-b-0" : "",
                    isDocked ? "cursor-pointer" : ""
                )}
                onClick={() => isDocked && setIsDocked(false)}
            >
                <div className="flex items-center justify-between p-2 px-3">
                    <div className="flex items-center gap-4">
                        {/* Avatar / Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                <MapPinned className="h-6 w-6" />
                            </div>
                            <p className="font-bold text-sm text-foreground leading-tight hidden xs:block">GenericMap</p>
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground leading-tight truncate max-w-[150px]">
                                {fullName}
                            </span>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                roleNormalized === 'invited' ? "text-muted-foreground" : "text-primary"
                            )}>
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Toggle Bottom part */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                            }}
                            className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors"
                        >
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Docked Indicator Handle (Only visible when docked) */}
                {isDocked && (
                    <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <ChevronDown className="h-3 w-3 text-primary/50 animate-bounce" />
                    </div>
                )}
            </div>

            {/* Dropdown Menu */}
            <div
                className={cn(
                    "bg-background/95 backdrop-blur-xl border border-border/50 border-t-0 rounded-b-2xl shadow-xl transition-all duration-300 overflow-hidden origin-top",
                    (isOpen && !isDocked) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                )}
            >
                <div className="flex flex-col py-2">
                    <MenuLink href="/protected/map" icon={<Map className="h-4 w-4" />} label="Mapa Operativo" />

                    {['superadmin', 'admin', 'supervisor'].includes(roleNormalized) && (
                        <MenuLink href="/protected/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Panel de Administración" />
                    )}

                    <div className="h-[1px] bg-border/50 my-2 mx-4" />

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-foreground/80 hover:bg-muted/50 transition-colors"
        >
            <span className="text-muted-foreground">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
