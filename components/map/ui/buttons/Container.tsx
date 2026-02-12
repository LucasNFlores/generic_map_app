// components/map/ui/buttons/Container.tsx
import { cn } from "@/lib/utils";

export function Container({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div
            className={cn(
                "absolute right-10 bottom-4 z-10 flex flex-col gap-2 items-end bg-background/70 p-3 rounded-xl shadow-2xl shadow-black",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
