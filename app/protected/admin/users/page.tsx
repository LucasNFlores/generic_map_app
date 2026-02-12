import { createClient } from "@/lib/supabase/server";
import { UserManagementClient } from "@/components/admin/users/UserManagementClient";
import { redirect } from "next/navigation";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const supabase = await createClient();
    const { page: pageParam, query: queryParam } = await searchParams;

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
        return redirect("/protected/map");
    }

    // 2. Pagination & Search Logic
    const page = Number(pageParam) || 1;
    const itemsPerPage = 10;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const query = queryParam || '';

    // Build Query
    let usersQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to);

    if (query) {
        // Simple case-insensitive search on multiple fields
        usersQuery = usersQuery.or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    }

    const { data: users, count, error } = await usersQuery;

    if (error) {
        console.error("Error fetching users:", error);
    }

    // Fetch Invitations (Global for now, to keep context)
    const { data: invitations, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

    if (invitesError) {
        console.error("Error fetching invitations:", invitesError);
    }

    return (
        <UserManagementClient
            initialUsers={users || []}
            totalUsers={count || 0}
            currentPage={page}
            itemsPerPage={itemsPerPage}
            searchQuery={query}
            initialInvitations={invitations || []}
        />
    );
}
