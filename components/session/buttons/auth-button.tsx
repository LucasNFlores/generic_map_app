import Link from "next/link";
import { Button } from "../../ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutDashboard, Map as MapIcon } from "lucide-react";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button asChild size="sm" variant={"default"} className="rounded-full px-6">
        <Link href="/auth/login">Iniciar sesión</Link>
      </Button>
    );
  }

  // Get user role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/protected/map"
        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted"
        title="Ver Mapa"
      >
        <MapIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Mapa</span>
      </Link>

      {isAdmin && (
        <Link
          href="/protected/admin"
          className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted"
          title="Panel Admin"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      )}

      <div className="h-4 w-[1px] bg-border mx-1" />

      <LogoutButton variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
        <LogOut className="h-4 w-4" />
      </LogoutButton>
    </div>
  );
}
