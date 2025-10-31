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
        <div className="relative">
            <input
                ref={ref}
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "block w-full px-3 py-2 text-primary bg-background rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer",
                    { "bg-background": disabled },
                    className
                )}
                required={required}
                {...props}
            />
            <label
                htmlFor={name}
                className="absolute hover:cursor-text text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                {label}
            </label>
        </div>
    );
});
