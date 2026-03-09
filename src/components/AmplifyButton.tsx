"use client";

import { motion } from "framer-motion";
import { FlashIcon, Loading01Icon } from "hugeicons-react";

interface AmplifyButtonProps {
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
}

export default function AmplifyButton({
    onClick,
    disabled,
    isLoading,
}: AmplifyButtonProps) {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`
        relative w-full rounded-xl px-6 py-3.5 font-semibold text-sm
        flex items-center justify-center gap-2 transition-all
        ${disabled
                    ? "bg-surface-sunken text-muted cursor-not-allowed"
                    : isLoading
                        ? "bg-black text-white cursor-wait"
                        : "bg-black text-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/20 hover:bg-neutral-800"
                }
      `}
        >
            {isLoading ? (
                <>
                    <Loading01Icon className="h-4 w-4 animate-spin" />
                    Optimizing...
                </>
            ) : (
                <>
                    <FlashIcon className="h-4 w-4" />
                    Optimize Resume
                </>
            )}
        </motion.button>
    );
}
