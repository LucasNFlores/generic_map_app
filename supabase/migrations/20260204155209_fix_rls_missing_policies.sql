-- 1. Permitir que usuarios autenticados creen categorías (para la prueba y uso general)
CREATE POLICY "Auth Create Categories" ON public.categories 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Permitir que usuarios autenticados creen puntos (necesario para el RPC de shapes)
CREATE POLICY "Auth Create Points" ON public.points 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Permitir que usuarios autenticados vinculen puntos con formas
CREATE POLICY "Auth Create ShapePoints" ON public.shape_points 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Asegurarnos de que el RPC puede ser ejecutado por usuarios autenticados
GRANT EXECUTE ON FUNCTION public.create_shape_with_points TO authenticated;

-- 5. Permitir que cada usuario vea su propio perfil (Necesario para el header)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
