'use client';

import * as React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MultiSelectProps {
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
}

export default function MultiSelect({ label, options, value = [], onChange }: MultiSelectProps) {
    const handleToggle = (opt: string) => {
        const newValue = value.includes(opt)
            ? value.filter(v => v !== opt)
            : [...value, opt];
        onChange(newValue);
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <div className="grid grid-cols-1 gap-2 border border-gray-300 rounded-md p-3 bg-background max-h-40 overflow-y-auto">
                {options.map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${label}-${opt}`}
                            checked={value.includes(opt)}
                            onCheckedChange={() => handleToggle(opt)}
                        />
                        <label
                            htmlFor={`${label}-${opt}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-opacity-70 text-primary cursor-pointer"
                        >
                            {opt}
                        </label>
                    </div>
                ))}
                {options.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No hay opciones disponibles</span>
                )}
            </div>
        </div>
    );
}
