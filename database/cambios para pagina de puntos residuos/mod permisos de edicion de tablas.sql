-- Unicamente para etapas de pruebas tempranas, esta confguracion es altamente peligrosa
-- reemplazar con permisos segun tipo de usuario lo antes posible

-- 1. TABLA SHAPES (La principal)
-- Habilitar INSERT para todos
DROP POLICY IF EXISTS "Enable insert for all" ON public.shapes;
CREATE POLICY "Enable insert for all" ON public.shapes FOR INSERT WITH CHECK (true);

-- Habilitar UPDATE para todos (Aquí estaba tu error)
DROP POLICY IF EXISTS "Enable update for all" ON public.shapes;
CREATE POLICY "Enable update for all" ON public.shapes FOR UPDATE USING (true);

-- Habilitar DELETE para todos
DROP POLICY IF EXISTS "Enable delete for all" ON public.shapes;
CREATE POLICY "Enable delete for all" ON public.shapes FOR DELETE USING (true);


-- 2. TABLA POINTS (Si editas coordenadas)
DROP POLICY IF EXISTS "Enable write access for all" ON public.points;
CREATE POLICY "Enable write access for all" ON public.points FOR ALL USING (true);


-- 3. TABLA SHAPE_POINTS (La relación)
DROP POLICY IF EXISTS "Enable write access for all" ON public.shape_points;
CREATE POLICY "Enable write access for all" ON public.shape_points FOR ALL USING (true);