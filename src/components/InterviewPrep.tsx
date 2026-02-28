"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Code2,
    ChevronDown,
    Lightbulb,
} from "lucide-react";

interface InterviewQuestion {
    question: string;
    context: string;
    suggestedPoints: string[];
}

interface InterviewPrepProps {
    behavioral: InterviewQuestion[];
    technical: InterviewQuestion[];
    isLoading: boolean;
    onGenerate: () => void;
    canGenerate: boolean;
    isGenerating: boolean;
}

export default function InterviewPrep({
    behavioral,
    technical,
    isLoading,
    onGenerate,
    canGenerate,
    isGenerating,
}: InterviewPrepProps) {
    const [activeTab, setActiveTab] = useState<"behavioral" | "technical">(
        "behavioral"
    );
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const questions = activeTab === "behavioral" ? behavioral : technical;
    const hasQuestions = behavioral.length > 0 || technical.length > 0;

    if (isLoading) {
        return (
            <div className="glass-card p-5">
                <div className="shimmer h-4 w-32 rounded mb-4" />
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="shimmer h-16 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                        Interview Prep
                    </h3>
                </div>
                {!hasQuestions && canGenerate && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 
                       transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? "Generating..." : "Generate"}
                    </motion.button>
                )}
            </div>

            {hasQuestions ? (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 rounded-lg bg-surface-sunken p-1 mb-4">
                        <button
                            onClick={() => {
                                setActiveTab("behavioral");
                                setExpandedIndex(null);
                            }}
                            className={`
                flex items-center gap-1.5 flex-1 justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all
                ${activeTab === "behavioral"
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted hover:text-foreground"
                                }
              `}
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Behavioral
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("technical");
                                setExpandedIndex(null);
                            }}
                            className={`
                flex items-center gap-1.5 flex-1 justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all
                ${activeTab === "technical"
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted hover:text-foreground"
                                }
              `}
                        >
                            <Code2 className="h-3.5 w-3.5" />
                            Technical
                        </button>
                    </div>

                    {/* Questions */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-2"
                            >
                                {questions.map((q, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-lg border border-border overflow-hidden"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedIndex(expandedIndex === i ? null : i)
                                            }
                                            className="flex w-full items-start gap-3 p-3 text-left hover:bg-surface-sunken/50 transition-colors"
                                        >
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-ultra-light text-[10px] font-bold text-primary mt-0.5">
                                                {i + 1}
                                            </span>
                                            <span className="flex-1 text-xs font-medium text-foreground leading-relaxed">
                                                {q.question}
                                            </span>
                                            <ChevronDown
                                                className={`h-4 w-4 shrink-0 text-muted transition-transform ${expandedIndex === i ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {expandedIndex === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-border bg-surface-sunken/30 p-3 space-y-2">
                                                        <p className="text-xs text-muted">
                                                            <span className="font-medium">Context:</span>{" "}
                                                            {q.context}
                                                        </p>
                                                        {q.suggestedPoints.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium text-foreground mb-1">
                                                                    Talking points:
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {q.suggestedPoints.map((point, j) => (
                                                                        <li
                                                                            key={j}
                                                                            className="flex items-start gap-1.5 text-xs text-muted"
                                                                        >
                                                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                                                            {point}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken mb-2">
                        <Lightbulb className="h-5 w-5 text-muted-light" />
                    </div>
                    <p className="text-xs text-muted">
                        {canGenerate
                            ? "Click Generate to create prep questions"
                            : "Amplify your resume first"}
                    </p>
                </div>
            )}
        </div>
    );
}
