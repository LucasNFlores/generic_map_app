import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // 1. Check Auth & Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !['superadmin', 'admin', 'supervisor'].includes(profile.role)) {
        // Redirect to map if not authorized
        return redirect("/protected/map");
    }

    // 2. Fetch Initial Data in Parallel (No Waterfalls!)
    // Note: We are mocking the API call logic here by calling DB directly or we could call the API if needed.
    // For Server Components, it's often better to call DB directly or use a shared controller to avoid HTTP overhead.
    // However, to keep it simple and consistent with previous "fetch" logic, let's replicate the queries.

    // Fetch Users
    const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

    if (usersError) {
        console.error("Error fetching users:", usersError);
    }

    // Fetch Invitations
    const { data: invitationsData, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

    if (invitesError) {
        console.error("Error fetching invitations:", invitesError);
    }

    const users = usersData || [];
    const invitations = invitationsData || [];

    // 3. Render Client Component with Data
    return (
        <AdminDashboardClient
            initialUsers={users}
            initialInvitations={invitations}
        />
    );
}
