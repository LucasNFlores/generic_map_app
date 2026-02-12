'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { UserTable } from './UserTable';
import { InvitationsSidebar } from './InvitationsSidebar';
import { InviteUserDialog } from './InviteUserDialog';

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

    // Local State
    const [searchValue, setSearchValue] = useState(searchQuery);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

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

    const handleInvite = async (email: string, role: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success(`Invitación enviada a ${email}`);
            setIsInviteOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error al invitar usuario');
            throw error; // Propagate to dialog to stop loading state if needed, though dialog handles it
        }
    };

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

                    <InviteUserDialog
                        isOpen={isInviteOpen}
                        onOpenChange={setIsInviteOpen}
                        onInvite={handleInvite}
                    />
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
                    <UserTable
                        users={initialUsers}
                        totalUsers={totalUsers}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                </div>

                {/* Invitations Sidebar (Right Column - 1/3 width) */}
                <InvitationsSidebar invitations={initialInvitations} />
            </div>
        </div>
    );
}
