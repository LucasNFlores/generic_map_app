-- En caso de error ejecutar por serparado el paso 1 y 2

-- 1. Crear el nuevo TIPO para la categoría de punto
CREATE TYPE "PointCategory" AS ENUM (
  'recycling',
  'trash'
);

-- 2. Modificar la tabla 'shapes'
ALTER TABLE public.shapes

  -- Añadir la nueva columna de categoría (usa el tipo que creamos arriba)
  ADD COLUMN IF NOT EXISTS point_category "PointCategory" NULL,
  
  -- Añadir la columna para horarios de atención
  ADD COLUMN IF NOT EXISTS open_hours TEXT NULL,
  
  -- Borramos la columna vieja (si existe)
  DROP COLUMN IF EXISTS waste_type,
  
  -- Añadimos la columna NUEVA 
  ADD COLUMN IF NOT EXISTS waste_types_accepted waste_type[] NULL;