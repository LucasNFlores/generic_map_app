import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Settings2, Map as MapIcon, Shield, ChevronRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default async function AdminHubPage() {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['superadmin', 'admin', 'supervisor'].includes(profile.role)) {
        return redirect("/protected/map");
    }

    return (
        <div className="flex-1 w-full min-h-full bg-background overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-10">

                <div className="space-y-2 flex gap-2">
                    <Link
                        href="/protected/map"
                        className="p-2.5 hover:bg-muted rounded-xl flex items-center justify-center lg:w-16 transition-all border border-border bg-card shadow-lg group"
                        title="Volver al mapa"
                        aria-label="Volver al mapa"
                    >
                        <ArrowLeft size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
                    </Link>
                    <div className="pl-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Panel de Administración</h1>
                        <p className="text-muted-foreground text-lg">Centro de control para la configuración del sistema y gestión del equipo.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Users & Team Card */}
                    <Link href="/protected/admin/users" className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Usuarios y Equipo
                            <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Gestiona miembros del equipo, roles, permisos e invitaciones por correo electrónico.
                        </p>
                    </Link>

                    {/* Categories Card */}
                    <Link href="/protected/admin/categories" className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                            <Settings2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Categorías
                            <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Configura las categorías y atributos disponibles para los elementos del mapa.
                        </p>
                    </Link>

                    {/* Map Settings */}
                    <Link href="/protected/admin/map-settings" className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                            <MapIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Configuración del Mapa
                            <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" aria-hidden="true" />
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Ajusta capas base, estilos predeterminados y comportamientos del visor geográfico.
                        </p>
                    </Link>

                </div>

                {/* Quick Stats or Info */}
                <div className="bg-muted/20 border border-border rounded-2xl p-6 flex items-start gap-4">
                    <Shield className="text-muted-foreground mt-1" size={20} />
                    <div>
                        <h3 className="font-semibold text-foreground">Seguridad del Sistema</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Todas las acciones administrativas son registradas. Asegúrate de revocar el acceso a miembros antiguos del equipo para mantener la seguridad.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
