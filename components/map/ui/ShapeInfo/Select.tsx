'use client';

import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: React.ReactNode;
    name: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, name, className, children, ...props },
    ref
) {
    const selectClass = [
        'block w-full px-3 py-2 text-primary bg-background rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer',
        className ?? ''
    ].join(' ').trim();

    return (
        <div className="relative">
            <select
                ref={ref}
                id={name}
                name={name}
                className={selectClass}
                {...props}
            >
                {children}
            </select>
            <label
                htmlFor={name}
                className="absolute hover:cursor-text text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                {label}
            </label>
        </div>
    );
});

Select.displayName = 'Select';

export default Select;