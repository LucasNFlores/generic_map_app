import { createClient } from "@/lib/supabase/server";
import UserMenu from "@/components/session/UserMenu";
import { redirect } from "next/navigation";
import 'maplibre-gl/dist/maplibre-gl.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Obtenemos el perfil completo
  let profileData = {
    first_name: null,
    last_name: null,
    role: 'invited',
    email: user.email
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single();

  if (profile && !error) {
    profileData = {
      ...profileData,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role
    };
  } else {
    // Si no hay perfil, intentamos crearlo al vuelo o mostrar error en consola
    console.error("ProtectedLayout: No profile found for user", user.id, error);
  }

  return (
    <main className="h-screen w-full relative flex flex-col bg-background overflow-hidden">
      {/* Floating User Menu */}
      <UserMenu user={profileData} />

      <div id="container main" className="w-full flex-1 flex flex-col overflow-y-auto relative">
        {children}
      </div>
    </main>
  );
}
