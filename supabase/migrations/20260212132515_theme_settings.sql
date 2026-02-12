-- Create theme_settings table
CREATE TABLE IF NOT EXISTS public.theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colors JSONB DEFAULT '{}'::jsonb, -- Stores key-value pairs of theme colors
    radius TEXT DEFAULT '0.5rem',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Singleton constraint: Only one active theme allowed
CREATE UNIQUE INDEX IF NOT EXISTS one_active_theme_idx ON public.theme_settings ((is_active)) WHERE (is_active = true);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Reuse existing is_superadmin function or create if not exists
-- (Assuming it was created in previous migrations, but good to be safe or just reference it)

-- Policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.theme_settings;
CREATE POLICY "Allow read access for authenticated users"
ON public.theme_settings
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow write access for superadmins" ON public.theme_settings;
CREATE POLICY "Allow write access for superadmins"
ON public.theme_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
);

-- Seed default data (optional, can start empty)
-- INSERT INTO public.theme_settings (is_active, colors, radius)
-- VALUES (true, '{}'::jsonb, '0.5rem')
-- ON CONFLICT DO NOTHING;
