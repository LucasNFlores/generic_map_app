'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ThemeApiTest() {
    const [result, setResult] = useState<any>(null);

    const testGet = async () => {
        const res = await fetch('/api/admin/theme');
        const data = await res.json();
        setResult({ method: 'GET', status: res.status, data });
    };

    const testPut = async () => {
        const res = await fetch('/api/admin/theme', {
            method: 'PUT',
            body: JSON.stringify({ colors: { primary: '0.2 0.1 20' }, radius: '1rem' })
        });
        const data = await res.json();
        setResult({ method: 'PUT', status: res.status, data });
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Mini Prueba API Theme</h1>
            <div className="flex gap-4">
                <Button onClick={testGet}>Test GET</Button>
                <Button onClick={testPut} variant="secondary">Test PUT</Button>
            </div>
            <pre className="bg-slate-950 text-green-400 p-4 rounded-xl overflow-auto max-w-2xl">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
