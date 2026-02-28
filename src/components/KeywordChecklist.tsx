"use client";

import { motion } from "framer-motion";
import { CheckmarkCircle01Icon, CancelCircleIcon, Tag01Icon, SparklesIcon } from "hugeicons-react";

interface KeywordChecklistProps {
    keywords: {
        found: string[];
        missing: string[];
        added: string[];
    } | null;
    isLoading: boolean;
}

export default function KeywordChecklist({
    keywords,
    isLoading,
}: KeywordChecklistProps) {
    if (isLoading) {
        return (
            <div className="glass-card p-5">
                <div className="shimmer h-4 w-32 rounded mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="shimmer h-6 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    const hasKeywords = keywords && (keywords.found.length > 0 || keywords.missing.length > 0 || keywords.added.length > 0);

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
                <Tag01Icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Keywords</h3>
            </div>

            {hasKeywords ? (
                <div className="space-y-4">
                    {/* Found keywords */}
                    {keywords.found.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <CheckmarkCircle01Icon className="h-3.5 w-3.5 text-success" />
                                <span className="text-xs font-medium text-success">
                                    Found ({keywords.found.length})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {keywords.found.map((kw, i) => (
                                    <motion.span
                                        key={kw}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-md bg-success-light px-2 py-0.5 text-xs font-medium text-success"
                                    >
                                        {kw}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Added keywords */}
                    {keywords.added.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium text-primary">
                                    Added ({keywords.added.length})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {keywords.added.map((kw, i) => (
                                    <motion.span
                                        key={kw}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-medium text-primary"
                                    >
                                        {kw}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing keywords */}
                    {keywords.missing.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <CancelCircleIcon className="h-3.5 w-3.5 text-danger" />
                                <span className="text-xs font-medium text-danger">
                                    Missing ({keywords.missing.length})
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {keywords.missing.map((kw, i) => (
                                    <motion.span
                                        key={kw}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-md bg-danger-light px-2 py-0.5 text-xs font-medium text-danger"
                                    >
                                        {kw}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken mb-2">
                        <Tag01Icon className="h-5 w-5 text-muted-light" />
                    </div>
                    <p className="text-xs text-muted">
                        Keyword analysis will appear here
                    </p>
                </div>
            )}
        </div>
    );
}
