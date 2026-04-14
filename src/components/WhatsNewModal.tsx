"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Cancel01Icon,
    SparklesIcon,
    File01Icon,
    Gif01Icon,
} from "hugeicons-react";
import { useEffect, useState } from "react";

const WHATS_NEW_VERSION = "v1.3.0";

interface Update {
    icon: React.ReactNode;
    emoji: string;
    tag: string;
    tagColor: string;
    title: string;
    description: string;
}

const updates: Update[] = [
    {
        icon: <File01Icon className="h-5 w-5" />,
        emoji: "📄",
        tag: "New",
        tagColor: "bg-blue-100 text-blue-700",
        title: "Resume PDF Upload in AI Coach",
        description:
            "You can now upload your resume as a PDF directly in the AI Coach. The coach will read it and give you instant, personalized feedback — no copy-pasting required.",
    },
    {
        icon: <SparklesIcon className="h-5 w-5" />,
        emoji: "🔒",
        tag: "Improvement",
        tagColor: "bg-purple-100 text-purple-700",
        title: "Pro Cover Letter Gate",
        description:
            "AI Cover Letter generation is now a Pro-only feature. Free users see a blurred preview with an upgrade prompt, keeping the experience clean and fair.",
    },
];

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="whats-new-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="whats-new-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header gradient banner */}
                            <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-6 pt-6 pb-8 overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
                                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    id="whats-new-close-btn"
                                    className="absolute top-4 right-4 flex items-center justify-center h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                                    aria-label="Close what's new"
                                >
                                    <Cancel01Icon className="h-4 w-4" />
                                </button>

                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
                                    <Gif01Icon className="h-3.5 w-3.5 text-amber-400" />
                                    <span className="text-[11px] font-bold text-amber-400 tracking-wide uppercase">
                                        {WHATS_NEW_VERSION}
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-white leading-tight mb-1">
                                    What&apos;s New in Zofu 🎉
                                </h2>
                                <p className="text-sm text-white/50">
                                    Here&apos;s everything we shipped in the latest update.
                                </p>
                            </div>

                            {/* Updates list */}
                            <div className="px-5 py-4 max-h-[340px] overflow-y-auto divide-y divide-[#f1f5f9]">
                                {updates.map((update, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.07 }}
                                        className="flex gap-4 py-4"
                                    >
                                        {/* Emoji bubble */}
                                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xl">
                                            {update.emoji}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-semibold text-[#0f172a]">
                                                    {update.title}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${update.tagColor}`}
                                                >
                                                    {update.tag}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#64748b] leading-relaxed">
                                                {update.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-5 pb-5">
                                <button
                                    id="whats-new-got-it-btn"
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-[#1e293b] transition-colors"
                                >
                                    Got it, thanks! 👋
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook to auto-show on first visit after a new version
export function useWhatsNew() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem("whats_new_seen_version");
        if (seen !== WHATS_NEW_VERSION) {
            // Slight delay so the app layout settles first
            const timer = setTimeout(() => setIsOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const open = () => setIsOpen(true);

    const close = () => {
        localStorage.setItem("whats_new_seen_version", WHATS_NEW_VERSION);
        setIsOpen(false);
    };

    return { isOpen, open, close };
}
