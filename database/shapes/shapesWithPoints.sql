-- Función para crear una shape con sus puntos en una sola transacción
CREATE OR REPLACE FUNCTION public.create_shape_with_points(
    shape_type public.shape_type, -- Tipo de forma ('point', 'line', 'polygon')
    shape_name TEXT,             -- Nombre opcional
    shape_description TEXT,      -- Descripción opcional
    -- Los puntos vienen como un array de objetos JSON
    -- Ejemplo: '[{"latitude": -34.6, "longitude": -58.3}]'
    points_data JSONB
)
RETURNS JSONB -- Devolverá la shape creada (o un error)
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutar con los permisos del creador (usualmente 'postgres')
SET search_path = public -- Asegurar que busque tablas en el esquema 'public'
AS $$
DECLARE
    new_shape_id UUID;
    point_record RECORD;
    point_index INT := 0;
    created_point_id UUID;
    user_id UUID := auth.uid(); -- Obtener el ID del usuario autenticado que llama a la función
    result JSONB;
BEGIN
    -- 1. Validar que el usuario esté autenticado
    IF user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'User not authenticated');
    END IF;

    -- 2. Validar que points_data sea un array y no esté vacío
    IF points_data IS NULL OR jsonb_typeof(points_data) != 'array' OR jsonb_array_length(points_data) = 0 THEN
        RETURN jsonb_build_object('error', 'Points data is required and must be a non-empty array');
    END IF;

    -- 3. Insertar la nueva shape y obtener su ID
    INSERT INTO public.shapes (type, name, description, creator_id)
    VALUES (shape_type, shape_name, shape_description, user_id)
    RETURNING id INTO new_shape_id;

    -- 4. Iterar sobre cada punto en el array JSONB
    FOR point_record IN SELECT * FROM jsonb_array_elements(points_data)
    LOOP
        point_index := point_index + 1;

        -- 5. Insertar el punto en la tabla 'points'
        INSERT INTO public.points (latitude, longitude)
        VALUES (
            (point_record.value ->> 'latitude')::DECIMAL,
            (point_record.value ->> 'longitude')::DECIMAL
        )
        RETURNING id INTO created_point_id;

        -- 6. Insertar la relación en la tabla 'shape_points'
        INSERT INTO public.shape_points (shape_id, point_id, sequence_order)
        VALUES (new_shape_id, created_point_id, point_index);
    END LOOP;

    -- 7. Construir el resultado a devolver (opcional, pero útil)
    SELECT jsonb_build_object(
        'id', s.id,
        'type', s.type,
        'name', s.name,
        'description', s.description,
        'creator_id', s.creator_id,
        'created_at', s.created_at
        -- Podrías agregar los puntos aquí si lo necesitas
    ) INTO result
    FROM public.shapes s
    WHERE s.id = new_shape_id;

    RETURN result;

EXCEPTION
    WHEN others THEN
        -- Si ocurre cualquier error, registrarlo (opcional) y devolver un JSON de error
        -- ¡La transacción se deshará automáticamente!
        RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Asegurar permisos correctos (ejecutar como superusuario)
ALTER FUNCTION public.create_shape_with_points(public.shape_type, TEXT, TEXT, JSONB) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.create_shape_with_points(public.shape_type, TEXT, TEXT, JSONB) TO authenticated; -- Permitir que usuarios logueados la llamen
