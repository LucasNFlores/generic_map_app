"use client";
import { createClient } from "@/lib/supabase/client";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LogoutButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  return (
    <Button onClick={logout} {...props}>
      {children || "Cerrar sesión"}
    </Button>
  );
}
