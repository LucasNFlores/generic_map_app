-- Migration: Add Email to Profiles
-- Date: 2026-02-12

-- 1. Add email column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Backfill email from auth.users (requires permissions, usually ok in migrations)
-- If this fails due to permissions, we can fallback to config, but auth.users is best source of truth.
-- Note: In some Supabase setups, accessing auth.users directly in simple queries might be restricted, 
-- but migrations usually run as postgres/superuser or have access.
DO $$
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not backfill from auth.users: %', SQLERRM;
    -- Fallback: Use config if exists
    UPDATE public.profiles 
    SET email = config->>'email'
    WHERE email IS NULL AND config->>'email' IS NOT NULL;
END $$;

-- 3. Update handle_new_user trigger to save email on insert
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
        INSERT INTO public.profiles (id, role, email)
        VALUES (new.id, invited_role, new.email);
        
        DELETE FROM public.invitations WHERE email = new.email;
    ELSE
        SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

        IF is_first_user THEN
            INSERT INTO public.profiles (id, role, email)
            VALUES (new.id, 'superadmin', new.email);
        ELSE
            INSERT INTO public.profiles (id, role, email)
            VALUES (new.id, 'invited', new.email);
        END IF;
    END IF;

    -- Update metadata config as backup/extra
    UPDATE public.profiles 
    SET config = jsonb_build_object('email', new.email)
    WHERE id = new.id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
