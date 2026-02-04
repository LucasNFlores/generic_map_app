-- 1) Crear esquema de auditoría opcional (logs) ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  action text NOT NULL,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Asegurarse que la tabla profiles existe y tiene la FK a auth.users -----------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  role user_role DEFAULT 'invited'::user_role,
  config jsonb,
  tutorials_switch boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  first_name text,
  last_name text
);

-- Agregar FK solamente si no existe (verifica constraint existente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'profiles'
      AND kcu.column_name = 'id'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- 3) Crear función trigger en esquema public -------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists boolean;
BEGIN
  -- Comprueba si ya existe un profile relacionado
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO v_exists;

  IF NOT v_exists THEN
    BEGIN
      INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        config,
        tutorials_switch,
        updated_at,
        role
      )
      VALUES (
        NEW.id,
        NULL,
        NULL,
        jsonb_build_object(
          'email', NEW.email,
          'provider', NEW.raw_user_meta_data ->> 'provider'
        ),
        false,
        now(),
        COALESCE(
          NULLIF((NEW.user_metadata ->> 'role'), '')::user_role,
          'invited'::user_role
        )
      );
    EXCEPTION WHEN unique_violation THEN
      NULL;
    WHEN OTHERS THEN
      INSERT INTO public.user_sync_logs (auth_user_id, action, detail)
      VALUES (NEW.id, 'create_profile_error', jsonb_build_object('error', SQLERRM, 'when', clock_timestamp()));
    END;
  ELSE
    UPDATE public.profiles
    SET updated_at = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- <<< Aquí: asignar owner a la función. Ejecutar como superuser / supabase_admin >>>
ALTER FUNCTION public.create_profile_from_auth_user() OWNER TO postgres;

-- 4) Crear trigger sobre auth.users -----------------------------------------------------------
DROP TRIGGER IF EXISTS create_profile_after_user ON auth.users;
CREATE TRIGGER create_profile_after_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_from_auth_user();

-- 5) Recomendaciones de seguridad / Ownership ------------------------------------------------
-- (la línea ALTER FUNCTION anterior ya asignó el owner; ejecuta si necesitas cambiarlo)
-- ALTER FUNCTION public.create_profile_from_auth_user() OWNER TO postgres;

-- 6) RLS: políticas recomendadas para public.profiles ----------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'select_own_profile'
  ) THEN
    CREATE POLICY select_own_profile ON public.profiles
      FOR SELECT
      TO authenticated
      USING ( id = (SELECT auth.uid()) );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'insert_own_profile'
  ) THEN
    CREATE POLICY insert_own_profile ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK ( id = (SELECT auth.uid()) );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'update_own_profile'
  ) THEN
    CREATE POLICY update_own_profile ON public.profiles
      FOR UPDATE
      TO authenticated
      USING ( id = (SELECT auth.uid()) )
      WITH CHECK ( id = (SELECT auth.uid()) );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'delete_own_profile'
  ) THEN
    CREATE POLICY delete_own_profile ON public.profiles
      FOR DELETE
      TO authenticated
      USING ( id = (SELECT auth.uid()) );
  END IF;
END;
$$;

GRANT ALL PRIVILEGES ON TABLE public.profiles TO postgres;

-- 7) Creación de índice útil -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 8) Validaciones / pruebas (no destructivas) ------------------------------------------------
-- SELECT id, role, updated_at FROM public.profiles ORDER BY updated_at DESC LIMIT 10;
-- SELECT * FROM public.user_sync_logs ORDER BY created_at DESC LIMIT 10;