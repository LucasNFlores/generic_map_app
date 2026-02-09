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
        'block w-full px-3 py-2 text-foreground bg-background rounded-md border border-border appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary peer transition-all',
        className ?? ''
    ].join(' ').trim();

    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={name}
                className="text-[11px] font-medium capitalize tracking-wider text-muted-foreground/60 ml-1"
            >
                {label}
            </label>
            <textarea
                ref={ref}
                id={name}
                name={name}
                placeholder=" "
                rows={rows}
                className={textareaClass}
                {...props}
            />
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;