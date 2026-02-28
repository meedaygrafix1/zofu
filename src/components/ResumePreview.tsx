"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy01Icon, CheckmarkCircle01Icon, EyeIcon, GitCompareIcon, File01Icon } from "hugeicons-react";

interface Change {
    section: string;
    original: string;
    amplified: string;
    reason: string;
}

interface ResumePreviewProps {
    originalText: string;
    amplifiedText: string;
    changes: Change[];
    isLoading: boolean;
}

export default function ResumePreview({
    originalText,
    amplifiedText,
    changes,
    isLoading,
}: ResumePreviewProps) {
    const [viewMode, setViewMode] = useState<"amplified" | "diff" | "original">(
        "amplified"
    );
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(amplifiedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="glass-card h-full flex flex-col">
                <div className="border-b border-border p-4">
                    <div className="shimmer h-5 w-48 rounded-lg" />
                </div>
                <div className="flex-1 p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div
                                className="shimmer h-4 rounded"
                                style={{ width: `${70 + Math.random() * 30}%` }}
                            />
                            {i % 3 === 0 && (
                                <div className="shimmer h-4 w-1/2 rounded" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!amplifiedText && !originalText) {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-ultra-light mb-4">
                    <File01Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Resume Preview
                </h3>
                <p className="text-sm text-muted max-w-xs">
                    Upload your resume and paste a job description, then click
                    &quot;Amplify&quot; to see your optimized resume here.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-sunken p-1 w-full sm:w-auto">
                    {[
                        { id: "amplified" as const, label: "Amplified", icon: File01Icon },
                        { id: "diff" as const, label: "Changes", icon: GitCompareIcon },
                        { id: "original" as const, label: "Original", icon: EyeIcon },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setViewMode(id)}
                            className={`
                flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium transition-all
                ${viewMode === id
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted hover:text-foreground"
                                }
              `}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {amplifiedText && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={copyToClipboard}
                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-white border border-border text-foreground shadow-sm hover:bg-surface-sunken sm:bg-transparent sm:border-transparent sm:shadow-none sm:text-muted sm:hover:bg-surface-sunken sm:hover:text-foreground transition-all"
                    >
                        {copied ? (
                            <CheckmarkCircle01Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-success sm:text-success" />
                        ) : (
                            <Copy01Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        )}
                        {copied ? "Copied to Clipboard!" : "Copy to Clipboard"}
                    </motion.button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {viewMode === "amplified" && (
                        <motion.div
                            key="amplified"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="prose prose-sm max-w-none"
                        >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {amplifiedText || originalText}
                            </div>
                        </motion.div>
                    )}

                    {viewMode === "diff" && (
                        <motion.div
                            key="diff"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            {changes.length > 0 ? (
                                changes.map((change, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-xl border border-border overflow-hidden"
                                    >
                                        <div className="bg-surface-sunken px-4 py-2 border-b border-border">
                                            <span className="text-xs font-semibold text-foreground">
                                                {change.section}
                                            </span>
                                            <p className="text-xs text-muted mt-0.5">
                                                {change.reason}
                                            </p>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="diff-removed text-xs rounded-md">
                                                {change.original}
                                            </div>
                                            <div className="diff-added text-xs rounded-md">
                                                {change.amplified}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-sm text-muted text-center py-8">
                                    No changes to display yet.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {viewMode === "original" && (
                        <motion.div
                            key="original"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                {originalText}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
