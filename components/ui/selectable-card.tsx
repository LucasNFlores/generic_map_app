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
                    ? "bg-blue-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "bg-[#161e2e] border-[#222f49] text-[#90a4cb] hover:border-blue-500/50 hover:bg-[#1e293b] hover:text-white",
                className
            )}
            {...props}
        >
            <div className={cn(
                "transition-colors",
                selected ? "text-blue-500" : iconColor || "text-[#5a6b8c] group-hover:text-white"
            )}>
                {icon}
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
        </button>
    );
}
