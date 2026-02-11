-- Migration: User Management and Invitations
-- Date: 2026-02-11

-- 1. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    email TEXT PRIMARY KEY,
    role public.user_role NOT NULL DEFAULT 'invited',
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Invitations
-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations" ON public.invitations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 4. Update Profiles RLS to allow admins to see all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own or admins view all" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 5. Policy for admins to update roles
CREATE POLICY "Admins can update roles" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 6. Update handle_new_user trigger to respect invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
    invited_role public.user_role;
BEGIN
    -- 1. Check if the user was invited
    SELECT role INTO invited_role 
    FROM public.invitations 
    WHERE email = new.email;

    IF invited_role IS NOT NULL THEN
        -- Assignment from invitation
        INSERT INTO public.profiles (id, role)
        VALUES (new.id, invited_role);
        
        -- Cleanup invitation
        DELETE FROM public.invitations WHERE email = new.email;
    ELSE
        -- Default logic
        SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

        IF is_first_user THEN
            INSERT INTO public.profiles (id, role)
            VALUES (new.id, 'superadmin');
        ELSE
            INSERT INTO public.profiles (id, role)
            VALUES (new.id, 'invited');
        END IF;
    END IF;

    -- Update metadata config if needed (optional)
    UPDATE public.profiles 
    SET config = jsonb_build_object('email', new.email)
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
