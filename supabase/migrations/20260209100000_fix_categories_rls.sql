-- ========= FIX: POLÍTICAS DE RLS PARA CATEGORÍAS =========

-- 1. Permitir lectura pública de categorías (para que el mapa y el admin funcionen)
-- Si ya existe una, esto la ignorará o podemos usar DROP POLICY si queremos ser específicos
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories 
    FOR SELECT USING (true);

-- 2. Permitir que usuarios autenticados actualicen categorías
DROP POLICY IF EXISTS "Auth Update Categories" ON public.categories;
CREATE POLICY "Auth Update Categories" ON public.categories 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Permitir que usuarios autenticados eliminen categorías
DROP POLICY IF EXISTS "Auth Delete Categories" ON public.categories;
CREATE POLICY "Auth Delete Categories" ON public.categories 
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Asegurarnos de que INSERT también esté cubierto (por si acaso)
DROP POLICY IF EXISTS "Auth Create Categories" ON public.categories;
CREATE POLICY "Auth Create Categories" ON public.categories 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
