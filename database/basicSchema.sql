-- ========= 1. LIMPIEZA INICIAL (ORDEN CORREGIDO) =========
-- Borramos en el orden de dependencia inverso:
-- 1. Triggers
-- 2. Funciones
-- 3. Tablas
-- 4. Tipos

-- A. Borramos el Trigger (que depende de la función handle_new_user)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- B. Borramos las Funciones (que dependen de los tipos y tablas)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Esta es la función que causa tu error:
-- La firma (argumentos) debe coincidir con la del error.
DROP FUNCTION IF EXISTS public.create_shape_with_points(public.shape_type, text, text, jsonb);
-- También incluyo la firma que usamos en el chat, por si acaso:
DROP FUNCTION IF EXISTS public.create_shape_with_points(public.shape_type, text, text, public.point_data[]);

-- C. Borramos las Tablas (en orden inverso a su creación)
DROP TABLE IF EXISTS public.shape_points;
DROP TABLE IF EXISTS public.shapes;
DROP TABLE IF EXISTS public.points;
DROP TABLE IF EXISTS public.profiles;

-- D. Borramos los Tipos (ahora que nada depende de ellos)
DROP TYPE IF EXISTS public.point_data;
DROP TYPE IF EXISTS public.shape_type;
DROP TYPE IF EXISTS public.user_role;


-- ========= 2. CREACIÓN DE TIPOS ENUM =========
-- Estos tipos personalizados aseguran que los roles y tipos de formas solo puedan tener valores predefinidos.

CREATE TYPE public.user_role AS ENUM (
  'superadmin',
  'admin',
  'supervisor',
  'invited'
);

CREATE TYPE public.shape_type AS ENUM (
  'point',
  'line',
  'polygon'
);

-- (Nuevo) Definimos el tipo de dato que recibe el argumento 'points_data' para la función RPC
-- Si prefieres usar JSONB, puedes borrar esta sección.
CREATE TYPE public.point_data AS (
  latitude numeric,
  longitude numeric
);


-- ========= 3. CREACIÓN DE TABLAS =========

-- Tabla de Perfiles (profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'invited',
  config JSONB,
  tutorials_switch BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Se añaden los comentarios DESPUÉS de crear la tabla.
COMMENT ON TABLE public.profiles IS 'Almacena datos públicos de usuario, enlazados a la tabla auth.users.';
COMMENT ON COLUMN public.profiles.config IS 'Usado para configuraciones de un perfil'; -- <<-- ESTA ES LA CORRECCIÓN


-- Tabla de Puntos (points)
CREATE TABLE public.points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.points IS 'Almacena vértices geográficos puros (coordenadas).';


-- Tabla de Formas (shapes)
CREATE TABLE public.shapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.shape_type NOT NULL,
  name TEXT,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.shapes IS 'Define una forma geométrica y su propietario. Se compone de uno o más puntos.';


-- Tabla de Unión (shape_points)
CREATE TABLE public.shape_points (
  shape_id UUID NOT NULL REFERENCES public.shapes(id) ON DELETE CASCADE,
  point_id UUID NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  PRIMARY KEY (shape_id, sequence_order)
);
COMMENT ON TABLE public.shape_points IS 'Tabla de unión que enlaza los puntos con las formas en un orden específico.';


-- ========= 4. AUTOMATIZACIÓN PARA PERFILES DE USUARIO (TRIGGER) =========
-- Este código crea automáticamente un perfil para cada nuevo usuario que se registra.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'invited');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========= 5. FUNCIÓN RPC (create_shape_with_points) =========
-- Esta es la función que tu API POST llama.
-- La creo con la firma que espera tu API (usando el tipo point_data[])
-- Si prefieres usar JSONB, avísame y la modifico.
CREATE OR REPLACE FUNCTION public.create_shape_with_points(
  shape_type public.shape_type,
  shape_name text,
  shape_description text,
  points_data public.point_data[] -- Usamos el tipo creado
)
RETURNS uuid -- Devuelve el ID de la nueva 'shape'
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_shape_id uuid;
  new_point_id uuid;
  point_record public.point_data;
  idx integer := 0;
BEGIN
  -- 1. Insertar la metadata de la forma (shape)
  INSERT INTO public.shapes (type, name, description, creator_id)
  VALUES (shape_type, shape_name, shape_description, auth.uid())
  RETURNING id INTO new_shape_id;

  -- 2. Iterar sobre el array de puntos
  FOREACH point_record IN ARRAY points_data
  LOOP
    -- 3. Insertar cada punto en la tabla 'points'
    INSERT INTO public.points (latitude, longitude)
    VALUES (point_record.latitude, point_record.longitude)
    RETURNING id INTO new_point_id;

    -- 4. Vincular el punto a la forma en la tabla 'shape_points' con su orden
    INSERT INTO public.shape_points (shape_id, point_id, sequence_order)
    VALUES (new_shape_id, new_point_id, idx);
    
    idx := idx + 1;
  END LOOP;

  -- 5. Devolver el ID de la forma creada
  RETURN new_shape_id;
END;
$$;


-- ========= 6. HABILITAR SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS) =========
-- Es crucial habilitar RLS para que tus datos estén protegidos por defecto.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shape_points ENABLE ROW LEVEL SECURITY;

-- ========= 7. DEFINICIÓN DE POLÍTICAS RLS =========

-- Políticas para 'profiles'
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para 'points'
CREATE POLICY "Authenticated users can view points." ON public.points FOR SELECT USING (auth.role() = 'authenticated');
-- (Dejamos sin INSERT/UPDATE/DELETE para forzar el uso de la RPC)

-- Políticas para 'shapes'
CREATE POLICY "Authenticated users can view shapes." ON public.shapes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own shapes." ON public.shapes FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own shapes." ON public.shapes FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own shapes." ON public.shapes FOR DELETE USING (auth.uid() = creator_id);

-- Políticas para 'shape_points'
CREATE POLICY "Users can view shape_points for shapes they can see." ON public.shape_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shapes s
      WHERE s.id = shape_points.shape_id
    )
  );
CREATE POLICY "Users can insert shape_points for their own shapes." ON public.shape_points
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shapes s
      WHERE s.id = shape_points.shape_id AND s.creator_id = auth.uid()
    )
  );