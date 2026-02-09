'use client';

import * as React from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CategoryManager() {
    return (
        <Button variant="outline" className="gap-2" asChild>
            <Link href="/protected/admin/categories">
                <Settings2 size={16} />
                Gestionar Categorías
            </Link>
        </Button>
    );
}
