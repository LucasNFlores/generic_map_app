'use client';

import * as React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: React.ReactNode;
    name: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, name, className, children, ...props },
    ref
) {
    const selectClass = [
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
            <select
                ref={ref}
                id={name}
                name={name}
                className={selectClass}
                {...props}
            >
                {children}
            </select>
        </div>
    );
});

Select.displayName = 'Select';

export default Select;