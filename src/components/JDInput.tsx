"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { File01Icon, Cancel01Icon } from "hugeicons-react";

interface JDInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

export default function JDInput({ value, onChange, disabled }: JDInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const maxChars = 10000;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                    Job Description
                </label>
                <span
                    className={`text-xs tabular-nums ${value.length > maxChars * 0.9 ? "text-warning" : "text-muted"
                        }`}
                >
                    {value.length.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
            </div>

            <div
                className={`
          relative rounded-xl border bg-surface-elevated transition-all duration-200
          ${isFocused
                        ? "border-primary shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                        : "border-border hover:border-border-strong"
                    }
          ${disabled ? "opacity-50" : ""}
        `}
            >
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    rows={8}
                    className="w-full resize-none rounded-xl bg-transparent p-4 text-sm text-foreground 
                     placeholder:text-muted-light focus:outline-none"
                    placeholder="Paste the full job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern CSS frameworks..."
                />

                {value.length > 0 && !disabled && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onChange("")}
                        className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:bg-surface-sunken hover:text-foreground transition-colors"
                    >
                        <Cancel01Icon className="h-4 w-4" />
                    </motion.button>
                )}
            </div>

            {value.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-muted">
                    <File01Icon className="h-3.5 w-3.5" />
                    <span>Paste the complete JD for best results</span>
                </div>
            )}
        </div>
    );
}
