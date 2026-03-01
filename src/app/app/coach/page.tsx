"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon, FlashIcon } from "hugeicons-react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import { useOptimizer } from "@/context/OptimizerContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CoachPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Custom hooks
    const {
        sessions,
        activeSessionId,
        deleteSession,
        resumeText,
        jobDescription,
    } = useOptimizer();

    const handleSignOut = async () => {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/auth';
    };

    const handleStartOptimization = () => {
        router.push("/app/amplify");
    };

    const handleLoadSession = (id: string) => {
        router.push(`/app/amplify?session=${id}`);
    };

    // State is already preserved in Context
    const resumeContext = resumeText;
    const jobContext = jobDescription;

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewSession={handleStartOptimization}
                onLoadSession={handleLoadSession}
                onDeleteSession={deleteSession}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogoutClick={() => setShowLogoutModal(true)}
            />

            {/* Main workspace */}
            <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header Navigation */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
                    {/* Left: Mobile Hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5 text-foreground transition-colors"
                    >
                        <div className="flex flex-col gap-1.5 items-center justify-center w-5">
                            <span className="h-0.5 w-full bg-foreground rounded-full"></span>
                            <span className="h-0.5 w-full bg-foreground rounded-full"></span>
                            <span className="h-0.5 w-3/4 self-start bg-foreground rounded-full"></span>
                        </div>
                    </button>

                    {/* Center: Logo */}
                    <Link href="/app" className="flex items-center">
                        <img src="/zofu-logo.png" alt="Zofu Logo" className="h-6 w-auto object-contain" />
                    </Link>

                    {/* Right: Logout */}
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-danger hover:bg-danger/10 transition-colors"
                    >
                        <svg className="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-hidden relative flex flex-col px-6 py-6 lg:px-8 max-w-5xl mx-auto w-full h-full bg-transparent">
                    <ChatPanel
                        resumeContext={resumeContext}
                        jobContext={jobContext}
                    />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-foreground mb-2">Sign Out</h3>
                                <p className="text-sm text-muted">
                                    Are you sure you want to sign out of Zofu? You will need to sign back in to access your workspace.
                                </p>
                            </div>
                            <div className="p-4 bg-surface-sunken border-t border-border flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-black/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg bg-danger text-white hover:bg-danger-hover transition-colors shadow-sm"
                                >
                                    <Logout01Icon className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
