'use client';

import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: React.ReactNode;
    name: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, name, className, rows = 3, ...props },
    ref
) {
    const textareaClass = [
        'block w-full px-3 py-2 text-primary bg-background rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer',
        className ?? ''
    ].join(' ').trim();

    return (
        <div className="relative">
            <textarea
                ref={ref}
                id={name}
                name={name}
                placeholder=" "
                rows={rows}
                className={textareaClass}
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

Textarea.displayName = 'Textarea';

export default Textarea;