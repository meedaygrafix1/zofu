"use client";

import { motion } from "framer-motion";
import { ArrowUpRight01Icon } from "hugeicons-react";

interface ATSScoreCardProps {
    score: number | null;
    isLoading: boolean;
}

export default function ATSScoreCard({ score, isLoading }: ATSScoreCardProps) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = score !== null ? circumference - (score / 100) * circumference : circumference;

    const getScoreColor = (s: number) => {
        if (s >= 80) return { stroke: "#10b981", bg: "#d1fae5", text: "#065f46", label: "Excellent" };
        if (s >= 60) return { stroke: "#f59e0b", bg: "#fef3c7", text: "#92400e", label: "Good" };
        return { stroke: "#ef4444", bg: "#fee2e2", text: "#991b1b", label: "Needs work" };
    };

    const colors = score !== null ? getScoreColor(score) : null;

    if (isLoading) {
        return (
            <div className="glass-card p-5">
                <div className="shimmer h-4 w-24 rounded mb-4" />
                <div className="flex justify-center">
                    <div className="shimmer h-28 w-28 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight01Icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">ATS Score</h3>
            </div>

            {score !== null && colors ? (
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <svg width="120" height="120" className="-rotate-90">
                            {/* Background ring */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="var(--surface-sunken)"
                                strokeWidth="8"
                            />
                            {/* Score ring */}
                            <motion.circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke={colors.stroke}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="text-2xl font-bold text-foreground"
                            >
                                {score}
                            </motion.span>
                            <span className="text-xs text-muted">/ 100</span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-3 rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                        {colors.label}
                    </motion.div>
                </div>
            ) : (
                <div className="flex flex-col items-center py-4">
                    <div className="relative">
                        <svg width="120" height="120">
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="none"
                                stroke="var(--surface-sunken)"
                                strokeWidth="8"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-border-strong">—</span>
                            <span className="text-xs text-muted">/ 100</span>
                        </div>
                    </div>
                    <span className="mt-3 text-xs text-muted">
                        Amplify to see score
                    </span>
                </div>
            )}
        </div>
    );
}
