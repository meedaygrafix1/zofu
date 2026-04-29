"use client";

interface LogoProps {
    className?: string;
    alt?: string;
}

/**
 * Renders the correct logo for the current theme:
 *  - Light mode → zofu-logo.png      (dark/coloured logo)
 *  - Dark mode  → zofu-logo-white.png (white logo)
 *
 * Uses CSS dark:hidden / hidden dark:block — no JS/hydration flash.
 */
export default function Logo({ className = "h-6 w-auto", alt = "Zofu" }: LogoProps) {
    return (
        <>
            {/* Shown in light mode, hidden in dark */}
            <img
                src="/zofu-logo-white.png"
                alt={alt}
                className={`object-contain dark:hidden ${className}`}
            />
            {/* Shown in dark mode, hidden in light */}
            <img
                src="/zofu-logo.png"
                alt={alt}
                className={`object-contain hidden dark:block ${className}`}
            />
        </>
    );
}
