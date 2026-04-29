"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon02Icon, Sun03Icon } from "hugeicons-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Reserve exact space to prevent layout shift
    return <div className="w-11 h-6 rounded-full bg-border shrink-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent
        transition-colors duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isDark
          ? "bg-primary"
          : "bg-border"
        }
      `}
    >
      <motion.span
        layout
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`
          pointer-events-none inline-flex h-5 w-5 items-center justify-center
          rounded-full shadow-md ring-0
          ${isDark ? "bg-foreground" : "bg-surface-elevated"}
        `}
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isDark
            ? <Moon02Icon size={11} className="text-background" />
            : <Sun03Icon  size={11} className="text-muted" />
          }
        </motion.span>
      </motion.span>
    </button>
  );
}
