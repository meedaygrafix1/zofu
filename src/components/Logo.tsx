"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
    alt?: string;
}

export default function Logo({ className = "h-6 w-auto", alt = "Zofu" }: LogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if we are inside a forced light-theme wrapper (like landing/auth pages)
    // We do this by checking if there's an ancestor with data-theme="light"
    const isForcedLight = mounted ? !!document.querySelector('[data-theme="light"]') : false;

    // Determine the source based on theme and forced mode
    const isDark = !isForcedLight && resolvedTheme === "dark";
    const src = isDark ? "/zofu-logo-white.png" : "/zofu-logo.png";

    // Show nothing until mounted to prevent hydration mismatch flashes
    if (!mounted) {
        return <div className={className} style={{ visibility: "hidden" }} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
        />
    );
}
