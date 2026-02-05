import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/session/buttons/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos el perfil para ver el rol
  let role = 'invited';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) role = profile.role;
  }

  return (
    <main className="min-h-screen flex flex-col items-center w-screen">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">

        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/protected"}>Mapa generico</Link>
              <Link href={"/protected/map"}>Mapa</Link>
              {role === 'superadmin' && (
                <Link href={"/protected/admin"} className="text-primary hover:opacity-80 transition-opacity">
                  Panel Admin
                </Link>
              )}
              <ThemeSwitcher />

            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

      </div>

      <div id="container main" className="w-full flex-1 flex flex-col">
        {children}
      </div>
    </main>
  );
}
