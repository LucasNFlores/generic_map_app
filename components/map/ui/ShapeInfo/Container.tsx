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
                "absolute bottom-4 left-1/2 -translate-x-1/2 max-h-[80vh] z-10 flex flex-col gap-1 items-stretch bg-card/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-border transition-all duration-300 overflow-hidden",
                "w-[90%] md:w-1/3 max-w-[600px]",
                className,
            )}
            onSubmit={(e) => e.preventDefault()}
            {...props}
        >
            {children}
        </form>
    );
}

