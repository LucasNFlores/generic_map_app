import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapSettingsClient } from "./MapSettingsClient";

export default async function MapSettingsPage() {
    const supabase = await createClient();

    // Check Auth & Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    // Fetch config server-side to pass as initial data
    const { data: config } = await supabase
        .from('map_configuration')
        .select('*')
        .eq('is_active', true)
        .single();

    // Pass null if no config found (client will handle it or initialize defaults)

    return <MapSettingsClient initialConfig={config} />;
}
