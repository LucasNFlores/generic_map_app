"use client";

import * as React from "react";
import { useEffect, useState } from "react";

interface ThemeSettings {
    colors: Record<string, string>;
    radius: string;
}

export function DynamicThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchTheme = async () => {
            try {
                // Fetch settings from our new API
                const res = await fetch('/api/admin/theme');
                if (!res.ok) return; // If 404 or error, do nothing (fallback to defaults)

                const data = await res.json();
                if (!data) return; // No custom theme active

                const root = document.documentElement;

                // Apply Radius
                if (data.radius) {
                    root.style.setProperty('--radius', data.radius);
                }

                // Apply Colors
                if (data.colors) {
                    Object.entries(data.colors).forEach(([key, value]) => {
                        // value should be the CSS value string (e.g., "0.2 0.1 20")
                        root.style.setProperty(`--${key}`, value as string);
                    });
                }
            } catch (error) {
                console.error("Failed to load dynamic theme:", error);
            }
        };

        fetchTheme();
    }, []);

    // Prevent hydration mismatch if we strictly needed to render something different,
    // but here we just run an effect, so returning children immediately is fine.
    // However, to be safe with next-themes interaction:
    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
