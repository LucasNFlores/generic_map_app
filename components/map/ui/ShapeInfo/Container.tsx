// components/map/buttons/Container.tsx
import { cn } from "@/lib/utils";

export function Container({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<"form">) {
    return (
        <form

            className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 min-h-28 min-w-7 z-10 flex flex-col gap-2 items-center bg-background/90 p-3 rounded-xl shadow-2xl shadow-black",
                className,
            )}
            onSubmit={(e) => e.preventDefault()}
            {...props}
        >
            {children}
        </form>
    );
}

