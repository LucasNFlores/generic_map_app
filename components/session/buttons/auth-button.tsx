import Link from "next/link";
import { Button } from "../../ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <Link href="/protected/map" className="text-sm font-medium hover:underline underline-offset-4 transition-all">
      Ir al Mapa
    </Link>
  ) : (
    <Button asChild size="sm" variant={"default"} className="rounded-full px-6">
      <Link href="/auth/login">Iniciar sesión</Link>
    </Button>
  );
}
