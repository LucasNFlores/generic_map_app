import { createClient } from '@/lib/supabase/server';

/**
 * Genera el siguiente ID disponible para un campo auto_id de una categoría específica
 * @param categoryId - ID de la categoría
 * @param fieldName - Nombre del campo auto_id
 * @returns El siguiente número disponible (max + 1)
 */
export async function getNextIdForCategory(
    categoryId: string,
    fieldName: string
): Promise<number> {
    const supabase = await createClient();

    // Obtener todos los shapes de esta categoría
    const { data: shapes, error } = await supabase
        .from('shapes')
        .select('metadata')
        .eq('category_id', categoryId);

    if (error) {
        console.error('Error fetching shapes for auto-id:', error);
        return 1; // Si hay error, empezar desde 1
    }

    if (!shapes || shapes.length === 0) {
        return 1; // Primera shape de esta categoría
    }

    // Extraer el valor máximo del campo auto_id
    let maxId = 0;
    for (const shape of shapes) {
        const metadata = shape.metadata as Record<string, any>;
        if (metadata && typeof metadata[fieldName] === 'number') {
            maxId = Math.max(maxId, metadata[fieldName]);
        }
    }

    return maxId + 1;
}
