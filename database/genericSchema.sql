-- ========= 1. LIMPIEZA TOTAL (PARA INSTALACIÓN LIMPIA) =========
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_shape_with_points(public.shape_type, jsonb[], text, text, text, anyelement, text, anyarray); -- Firma vieja genérica
DROP FUNCTION IF EXISTS public.create_shape_with_points(); -- Otras posibles firmas

DROP TABLE IF EXISTS public.shape_points;
DROP TABLE IF EXISTS public.shapes;
DROP TABLE IF EXISTS public.points;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.profiles;

DROP TYPE IF EXISTS public.shape_type;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.waste_type;
DROP TYPE IF EXISTS "PointCategory";

-- ========= 2. TIPOS BASE =========
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'supervisor', 'invited');
CREATE TYPE public.shape_type AS ENUM ('point', 'line', 'polygon');

-- ========= 3. TABLA DE CATEGORÍAS (DINÁMICA) =========
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Clase de Lucide o URL
    color TEXT DEFAULT '#3b82f6', -- Color por defecto (azul)
    
    -- Definición de campos personalizados para el formulario
    -- Ejemplo: [{"id": "tipo", "label": "Tipo", "type": "select", "options": ["A", "B"]}]
    fields_definition JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========= 4. TABLA DE PERFILES =========
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    role public.user_role NOT NULL DEFAULT 'invited',
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========= 5. TABLA DE PUNTOS GEOGRÁFICOS =========
CREATE TABLE public.points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========= 6. TABLA DE FORMAS (SHAPES) =========
CREATE TABLE public.shapes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type public.shape_type NOT NULL,
    name TEXT,
    description TEXT,
    location_address TEXT,
    
    -- DATOS DINÁMICOS: Aquí se guarda lo que se defina en fields_definition de la categoría
    metadata JSONB DEFAULT '{}'::jsonb,
    
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========= 7. RELACIÓN SHAPE-POINTS =========
CREATE TABLE public.shape_points (
    shape_id UUID NOT NULL REFERENCES public.shapes(id) ON DELETE CASCADE,
    point_id UUID NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    PRIMARY KEY (shape_id, sequence_order)
);

-- ========= 8. LÓGICA DE USUARIOS (TRIGGER) =========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_first_user BOOLEAN;
BEGIN
    -- Comprobamos si ya existe algún perfil
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

    IF is_first_user THEN
        -- El primer usuario que se registre será Superadmin
        INSERT INTO public.profiles (id, role)
        VALUES (new.id, 'superadmin');
    ELSE
        -- Los siguientes serán invitados por defecto
        INSERT INTO public.profiles (id, role)
        VALUES (new.id, 'invited');
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========= 9. FUNCIÓN RPC GENÉRICA (CREATE SHAPE) =========
CREATE OR REPLACE FUNCTION public.create_shape_with_points(
    p_category_id UUID,
    p_shape_type public.shape_type,
    p_points_data JSONB, -- Array de {latitude, longitude}
    p_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_location_address TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_shape_id UUID;
    v_point_record JSONB;
    v_point_id UUID;
    v_index INT := 0;
    v_result JSONB;
BEGIN
    -- 1. Insertar la forma
    INSERT INTO public.shapes (
        category_id, type, name, description, location_address, metadata, creator_id
    )
    VALUES (
        p_category_id, p_shape_type, p_name, p_description, p_location_address, p_metadata, auth.uid()
    )
    RETURNING id INTO v_shape_id;

    -- 2. Insertar puntos
    FOR v_point_record IN SELECT * FROM jsonb_array_elements(p_points_data)
    LOOP
        INSERT INTO public.points (latitude, longitude)
        VALUES (
            (v_point_record->>'latitude')::DECIMAL,
            (v_point_record->>'longitude')::DECIMAL
        )
        RETURNING id INTO v_point_id;

        INSERT INTO public.shape_points (shape_id, point_id, sequence_order)
        VALUES (v_shape_id, v_point_id, v_index);
        
        v_index := v_index + 1;
    END LOOP;

    -- 3. Retornar la forma creada
    SELECT jsonb_build_object(
        'id', id,
        'name', name,
        'category_id', category_id,
        'metadata', metadata
    ) INTO v_result
    FROM public.shapes
    WHERE id = v_shape_id;

    RETURN v_result;
END;
$$;

-- ========= 10. SEGURIDAD (RLS) =========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shape_points ENABLE ROW LEVEL SECURITY;

-- Políticas simples (Lectura pública, Escritura autenticada)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Shapes" ON public.shapes FOR SELECT USING (true);
CREATE POLICY "Public Read Points" ON public.points FOR SELECT USING (true);
CREATE POLICY "Public Read ShapePoints" ON public.shape_points FOR SELECT USING (true);

CREATE POLICY "Auth Create Shapes" ON public.shapes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users Update Own Shapes" ON public.shapes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users Delete Own Shapes" ON public.shapes FOR DELETE USING (auth.uid() = creator_id);
