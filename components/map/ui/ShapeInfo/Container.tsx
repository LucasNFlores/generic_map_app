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
                "absolute bottom-4 left-1/2 -translate-x-1/2 min-h-28 z-10 flex flex-col gap-4 items-stretch bg-background/90 p-5 rounded-xl shadow-2xl shadow-black transition-all duration-300",
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

