import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ToggleCardProps {
    id: string;
    label: string;
    checked: boolean;
    onToggle: () => void;
    variant?: 'default' | 'success';
    className?: string;
}

export function ToggleCard({
    id,
    label,
    checked,
    onToggle,
    variant = 'default',
    className
}: ToggleCardProps) {
    const variants = {
        default: {
            active: 'bg-primary/10 border-primary/30',
            checkbox: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
        },
        success: {
            active: 'bg-emerald-500/10 border-emerald-500/30',
            checkbox: 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500'
        }
    };

    const styles = variants[variant];

    return (
        <div
            onClick={onToggle}
            className={cn(
                "flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer group",
                checked
                    ? styles.active
                    : "bg-card border-transparent hover:border-border",
                className
            )}
        >
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => { }}
                className={cn(
                    "border-muted-foreground pointer-events-none",
                    styles.checkbox
                )}
            />
            <label
                htmlFor={id}
                className="text-xs font-semibold leading-none cursor-pointer text-muted-foreground capitalize group-hover:text-foreground transition-colors pointer-events-none"
            >
                {label}
            </label>
        </div>
    );
}
