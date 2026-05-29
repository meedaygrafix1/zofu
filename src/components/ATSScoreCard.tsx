"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight01Icon } from "hugeicons-react";

interface ATSScoreCardProps {
    score: number | null;           // optimised score
    originalScore?: number | null;  // original (pre-amplify) score
    isLoading: boolean;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(s: number) {
    if (s >= 80) return { stroke: "#10b981", bg: "#d1fae5", text: "#065f46", label: "Excellent" };
    if (s >= 60) return { stroke: "#f59e0b", bg: "#fef3c7", text: "#92400e", label: "Good" };
    return { stroke: "#ef4444", bg: "#fee2e2", text: "#991b1b", label: "Needs work" };
}

interface ScoreRingProps {
    score: number;
    /** Force animation restart when this key changes */
    animKey: string | number;
}

function ScoreRing({ score, animKey }: ScoreRingProps) {
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    const colors = getScoreColor(score);

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width="120" height="120" className="-rotate-90">
                    {/* Track */}
                    <circle
                        cx="60" cy="60" r={RADIUS}
                        fill="none"
                        stroke="var(--surface-sunken)"
                        strokeWidth="8"
                    />
                    {/* Animated fill */}
                    <motion.circle
                        key={animKey}
                        cx="60" cy="60" r={RADIUS}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        initial={{ strokeDashoffset: CIRCUMFERENCE }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                </svg>

                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        key={`num-${animKey}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="text-2xl font-bold text-foreground"
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs text-muted">/ 100</span>
                </div>
            </div>

            {/* Badge */}
            <motion.div
                key={`badge-${animKey}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-3 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: colors.bg, color: colors.text }}
            >
                {colors.label}
            </motion.div>
        </div>
    );
}

function EmptyRing() {
    return (
        <div className="flex flex-col items-center py-4">
            <div className="relative">
                <svg width="120" height="120">
                    <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--surface-sunken)" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-border-strong">—</span>
                    <span className="text-xs text-muted">/ 100</span>
                </div>
            </div>
            <span className="mt-3 text-xs text-muted">Amplify to see score</span>
        </div>
    );
}

export default function ATSScoreCard({ score, originalScore, isLoading }: ATSScoreCardProps) {
    const [tab, setTab] = useState<"optimized" | "original">("optimized");

    const hasBoth = score !== null && originalScore !== null;
    const improvement = hasBoth ? (score! - originalScore!) : null;

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
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <ArrowUpRight01Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">ATS Score</h3>
                </div>

                {/* Improvement badge — only shown when both scores exist */}
                {improvement !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            improvement > 0
                                ? "bg-emerald-100 text-emerald-700"
                                : improvement < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-surface-sunken text-muted"
                        }`}
                    >
                        {improvement > 0 ? "▲" : improvement < 0 ? "▼" : "•"}
                        {Math.abs(improvement)} pts
                    </motion.div>
                )}
            </div>

            {/* Tab switcher — only render when both scores available */}
            {hasBoth && (
                <div className="flex rounded-lg bg-surface-sunken p-0.5 mb-4 shadow-inner">
                    {(["optimized", "original"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`relative flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-all ${
                                tab === t
                                    ? "text-foreground"
                                    : "text-muted hover:text-foreground"
                            }`}
                        >
                            {tab === t && (
                                <motion.div
                                    layoutId="ats-tab-pill"
                                    className="absolute inset-0 rounded-md bg-surface-elevated shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                                />
                            )}
                            <span className="relative z-10">
                                {t === "optimized" ? "Optimized" : "Before"}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Score display */}
            <AnimatePresence mode="wait">
                {score !== null ? (
                    tab === "optimized" || !hasBoth ? (
                        <motion.div
                            key="optimized"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ScoreRing score={score} animKey={`opt-${score}`} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="original"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ScoreRing score={originalScore!} animKey={`orig-${originalScore}`} />
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <EmptyRing />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
