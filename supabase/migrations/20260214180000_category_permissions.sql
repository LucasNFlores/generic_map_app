-- ========= CATEGORY PERMISSIONS: allowed_view_roles & allowed_create_edit_roles =========
-- NULL = open to all roles (default for backward compatibility)

-- 1. Add permission columns to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS allowed_view_roles text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS allowed_create_edit_roles text[] DEFAULT NULL;

COMMENT ON COLUMN public.categories.allowed_view_roles IS 'Roles allowed to see shapes of this category. NULL = everyone.';
COMMENT ON COLUMN public.categories.allowed_create_edit_roles IS 'Roles allowed to create/edit shapes of this category. NULL = everyone.';

-- 2. Helper: get the current user role from profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Update RLS policies on shapes to respect category permissions

-- 3a. DROP old permissive SELECT policy
DROP POLICY IF EXISTS "Public Read Shapes" ON public.shapes;

-- 3b. New SELECT: allow if category has no view restriction OR user role is in the list
CREATE POLICY "Category View Shapes" ON public.shapes
  FOR SELECT USING (
    -- shapes without a category are always visible
    category_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.categories c
      WHERE c.id = shapes.category_id
        AND (
          c.allowed_view_roles IS NULL          -- NULL = open to all
          OR public.get_my_role() = ANY(c.allowed_view_roles)
        )
    )
  );

-- 3c. DROP old INSERT policy
DROP POLICY IF EXISTS "Auth Create Shapes" ON public.shapes;

-- 3d. New INSERT: allow if category has no create/edit restriction OR user role is in the list
CREATE POLICY "Category Create Shapes" ON public.shapes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = shapes.category_id
          AND (
            c.allowed_create_edit_roles IS NULL
            OR public.get_my_role() = ANY(c.allowed_create_edit_roles)
          )
      )
    )
  );

-- 3e. DROP old UPDATE policy
DROP POLICY IF EXISTS "Users Update Own Shapes" ON public.shapes;

-- 3f. New UPDATE: owner check + category permission
CREATE POLICY "Category Update Shapes" ON public.shapes
  FOR UPDATE USING (
    auth.uid() = creator_id
    AND (
      category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = shapes.category_id
          AND (
            c.allowed_create_edit_roles IS NULL
            OR public.get_my_role() = ANY(c.allowed_create_edit_roles)
          )
      )
    )
  );

-- 3g. DROP old DELETE policy
DROP POLICY IF EXISTS "Users Delete Own Shapes" ON public.shapes;

-- 3h. New DELETE: owner check + category permission
CREATE POLICY "Category Delete Shapes" ON public.shapes
  FOR DELETE USING (
    auth.uid() = creator_id
    AND (
      category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id = shapes.category_id
          AND (
            c.allowed_create_edit_roles IS NULL
            OR public.get_my_role() = ANY(c.allowed_create_edit_roles)
          )
      )
    )
  );
