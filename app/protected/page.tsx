import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
// import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  redirect("/protected/map");
}
