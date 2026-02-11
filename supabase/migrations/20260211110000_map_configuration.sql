-- Create table
CREATE TABLE IF NOT EXISTS public.map_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_active BOOLEAN DEFAULT true,
    mapbox_style TEXT NOT NULL DEFAULT 'https://api.maptiler.com/maps/streets-v2/style.json',
    default_center JSONB NOT NULL DEFAULT '{"lng": -58.3816, "lat": -34.6037, "zoom": 12}'::jsonb,
    role_overrides JSONB DEFAULT '{}'::jsonb,
    enabled_controls JSONB DEFAULT '["zoom", "scale", "geolocate", "fullscreen"]'::jsonb,
    allowed_shapes TEXT[] DEFAULT ARRAY['point', 'line', 'polygon'],
    min_zoom INTEGER DEFAULT 0,
    max_zoom INTEGER DEFAULT 22,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Singleton constraint
CREATE UNIQUE INDEX IF NOT EXISTS one_active_config_idx ON public.map_configuration ((is_active)) WHERE (is_active = true);

-- Enable RLS
ALTER TABLE public.map_configuration ENABLE ROW LEVEL SECURITY;

-- Helper function for superadmin check (to avoid recursion or complexity)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.map_configuration;
CREATE POLICY "Allow read access for authenticated users"
ON public.map_configuration
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow write access for superadmins" ON public.map_configuration;
CREATE POLICY "Allow write access for superadmins"
ON public.map_configuration
FOR ALL
TO authenticated
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Seed default data if not exists
INSERT INTO public.map_configuration (
    is_active,
    mapbox_style, 
    default_center,
    allowed_shapes
)
VALUES (
    true,
    'https://api.maptiler.com/maps/streets-v2/style.json',
    '{"lng": -58.3816, "lat": -34.6037, "zoom": 12}'::jsonb,
    ARRAY['point', 'line', 'polygon']
)
ON CONFLICT DO NOTHING;
