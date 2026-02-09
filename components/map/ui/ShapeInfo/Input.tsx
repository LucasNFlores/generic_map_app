'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputType =
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    type?: InputType;
    disabled?: boolean;
    required?: boolean;
}

// Usamos `export default forwardRef` y le damos un nombre a la función interna.
// Esto asigna automáticamente el 'displayName' para la depuración en React DevTools.
export default forwardRef<HTMLInputElement, InputProps>(function Input({
    label,
    name,
    type = "text",
    className,
    placeholder = " ", // El placeholder es importante para que el label flotante funcione
    disabled = false,
    required = false,
    ...props
}, ref) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={name}
                className="text-[11px] font-medium capitalize tracking-wider text-muted-foreground/60 ml-1"
            >
                {label}
            </label>
            <input
                ref={ref}
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "block w-full px-3 py-2 text-foreground bg-background/50 rounded-lg border border-border appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all",
                    { "bg-muted/50 opacity-70": disabled },
                    className
                )}
                required={required}
                {...props}
            />
        </div>
    );
});
