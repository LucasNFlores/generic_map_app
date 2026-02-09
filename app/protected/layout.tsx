import { createClient } from "@/lib/supabase/server";
import UserMenu from "@/components/session/UserMenu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos el perfil completo
  let profileData = {
    first_name: null,
    last_name: null,
    role: 'invited',
    email: user?.email
  };

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, role')
      .eq('id', user.id)
      .single();

    if (profile) {
      profileData = {
        ...profileData,
        ...profile
      };
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative flex flex-col">
      {/* Floating User Menu */}
      <UserMenu user={profileData} />

      <div id="container main" className="w-full flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </main>
  );
}
