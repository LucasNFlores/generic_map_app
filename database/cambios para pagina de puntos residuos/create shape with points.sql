-- Reemplaza la función vieja por esta nueva,
-- que acepta los nuevos campos.

CREATE OR REPLACE FUNCTION public.create_shape_with_points(
    shape_type shape_type,
    points_data jsonb[],
    shape_name text DEFAULT NULL,
    shape_description text DEFAULT NULL,
    shape_location_address text DEFAULT NULL,
    shape_point_category "PointCategory" DEFAULT NULL,
    shape_open_hours text DEFAULT NULL,
    shape_waste_types_accepted waste_type[] DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_shape_id uuid;
    new_point_id uuid;
    point_data jsonb;
    sequence_counter integer := 0;
    new_shape json;
BEGIN
    -- 1. Crear la Shape principal
    INSERT INTO public.shapes (
        type, 
        name, 
        description, 
        location_address,
        point_category,
        open_hours,
        waste_types_accepted,
        creator_id -- Asigna al usuario autenticado
    )
    VALUES (
        shape_type, 
        shape_name, 
        shape_description, 
        shape_location_address,
        shape_point_category,
        shape_open_hours,
        shape_waste_types_accepted,
        auth.uid() 
    )
    RETURNING id INTO new_shape_id; -- Obtener el ID de la nueva shape

    -- 2. Recorrer el array de puntos JSON
    FOREACH point_data IN ARRAY points_data
    LOOP
        -- 3. Insertar cada punto en la tabla 'points'
        INSERT INTO public.points (latitude, longitude)
        VALUES (
            (point_data->>'latitude')::numeric,
            (point_data->>'longitude')::numeric
        )
        RETURNING id INTO new_point_id; -- Obtener el ID del nuevo punto

        -- 4. Vincular la shape y el punto en la tabla 'shape_points'
        INSERT INTO public.shape_points (shape_id, point_id, sequence_order)
        VALUES (new_shape_id, new_point_id, sequence_counter);

        sequence_counter := sequence_counter + 1;
    END LOOP;

    -- 5. Devolver la shape recién creada (sin los puntos anidados)
    SELECT json_build_object(
        'id', s.id,
        'type', s.type,
        'name', s.name,
        'description', s.description,
        'location_address', s.location_address,
        'point_category', s.point_category,
        'open_hours', s.open_hours,
        'waste_types_accepted', s.waste_types_accepted,
        'creator_id', s.creator_id,
        'created_at', s.created_at
    )
    INTO new_shape
    FROM public.shapes s
    WHERE s.id = new_shape_id;

    RETURN new_shape;
END;
$$;