import { ThemeEditorClient } from '@/components/admin/theme/ThemeEditorClient';

export default function ThemeEditorPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-6 pt-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editor de Temas</h1>
                    <p className="text-muted-foreground mt-1">
                        Personaliza la apariencia global de la aplicación.
                    </p>
                </div>
            </div>

            <ThemeEditorClient />
        </div>
    );
}
