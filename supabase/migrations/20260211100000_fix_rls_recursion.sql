-- Migration: Fix RLS Infinite Recursion
-- Date: 2026-02-11

-- 1. Create a helper function to check admin status without triggering RLS
-- SECURITY DEFINER ensures the function runs with the privileges of the creator (superuser), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Profiles Policy to use the function to avoid recursion
DROP POLICY IF EXISTS "Users can view own or admins view all" ON public.profiles;
CREATE POLICY "Users can view own or admins view all" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can update roles" ON public.profiles;
CREATE POLICY "Admins can update roles" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        public.is_admin()
    )
    WITH CHECK (
        public.is_admin()
    );

-- 3. Update Invitations Policy as well (for consistency/performance)
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;
CREATE POLICY "Admins can manage invitations" ON public.invitations
    FOR ALL
    TO authenticated
    USING (
        public.is_admin()
    );


