import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import UserMenu from "@/components/session/UserMenu";
import { MapPinned } from "lucide-react";
import { Button } from "./button";

export default async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Si hay usuario, obtenemos su perfil para el UserMenu
    if (user) {
        let profileData = {
            first_name: null,
            last_name: null,
            role: 'invited',
            email: user.email
        };

        const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, role')
            .eq('id', user.id)
            .single();

        if (profile) {
            profileData = {
                ...profileData,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: profile.role
            };
        }

        return <UserMenu user={profileData} />;
    }

    // Si NO hay usuario (Guest), mostramos la pill estandarizada con botón de login
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto min-w-[340px] max-w-[500px]">
            <nav className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex items-center justify-between p-2 px-3 gap-4">
                    <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <MapPinned className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight whitespace-nowrap leading-none">
                                GenericMap
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <div className="h-6 w-[1px] bg-border/50 mx-1" />
                        <Button asChild size="sm" className="rounded-xl font-bold">
                            <Link href="/auth/login">
                                Iniciar sesión
                            </Link>
                        </Button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
