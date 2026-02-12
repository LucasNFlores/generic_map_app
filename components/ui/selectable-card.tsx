import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectableCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected: boolean;
    icon: React.ReactNode;
    label: string;
    iconColor?: string;
}

export function SelectableCard({
    selected,
    icon,
    label,
    iconColor,
    className,
    ...props
}: SelectableCardProps) {
    return (
        <button
            type="button"
            className={cn(
                "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all group",
                selected
                    ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-muted hover:text-foreground",
                className
            )}
            {...props}
        >
            <div className={cn(
                "transition-colors",
                selected ? "text-primary" : iconColor || "text-muted-foreground group-hover:text-foreground"
            )}>
                {icon}
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
        </button>
    );
}
