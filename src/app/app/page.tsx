"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon, Rocket02Icon, SparklesIcon, File01Icon, Time01Icon } from "hugeicons-react";
import Sidebar from "@/components/Sidebar";
import { useOptimizer } from "@/context/OptimizerContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Custom hooks
    const {
        sessions,
        activeSessionId,
        deleteSession,
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
            <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">

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

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10 max-w-4xl"
                        >
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Welcome to Zofu Workspace</h1>
                            <p className="text-muted text-lg">Your AI-powered career launchpad. Optimize your resume for any role in seconds.</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl">
                            {/* CTA Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-12 lg:col-span-7"
                            >
                                <div className="glass-card p-6 h-full bg-gradient-to-br from-white to-primary-ultra-light border-primary/20 relative overflow-hidden group">
                                    {/* Background Decor */}
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

                                    <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                                        <div>
                                            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center mb-4 shadow-md shadow-black/10">
                                                <SparklesIcon className="w-5 h-5" />
                                            </div>
                                            <h2 className="text-xl font-bold mb-1 text-foreground">Optimize a New Resume</h2>
                                            <p className="text-muted text-sm leading-relaxed max-w-sm">
                                                Instantly tailor your resume to any job description to boost your ATS score and land interviews.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleStartOptimization}
                                            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] w-full sm:w-auto self-start text-sm"
                                        >
                                            <Rocket02Icon className="w-4 h-4" />
                                            Optimize Resume Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Stats Widget */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="md:col-span-12 lg:col-span-5 flex flex-col gap-6"
                            >
                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-light mb-1">Total Optimizations</p>
                                        <h3 className="text-3xl font-bold text-foreground">{sessions.length}</h3>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-surface-sunken flex items-center justify-center border border-border">
                                        <File01Icon className="w-5 h-5 text-muted" />
                                    </div>
                                </div>

                                <div className="glass-card p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-light mb-1">Avg. ATS Score</p>
                                        <h3 className="text-3xl font-bold text-foreground">
                                            {sessions.length > 0
                                                ? Math.round(sessions.reduce((acc, s) => acc + (s.atsScore || 0), 0) / sessions.length) + "%"
                                                : "--"
                                            }
                                        </h3>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                                        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recent History Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="md:col-span-12 mt-4"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                                    {sessions.length > 0 && (
                                        <span className="text-sm text-muted-light">{sessions.length} saved sessions</span>
                                    )}
                                </div>

                                {sessions.length === 0 ? (
                                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
                                        <div className="h-16 w-16 mb-4 rounded-full bg-surface-sunken flex items-center justify-center text-muted-light">
                                            <Time01Icon className="w-8 h-8" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No History Yet</h3>
                                        <p className="text-sm text-muted max-w-sm mb-6">Your recent resume optimization sessions will appear here so you can easily return to them later.</p>
                                        <button
                                            onClick={handleStartOptimization}
                                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                                        >
                                            Start your first optimization →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {sessions.slice(0, 3).map((session, idx) => (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                onClick={() => handleLoadSession(session.id)}
                                                className="glass-card p-5 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
                                            >
                                                <div className="mb-4">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={session.title}>
                                                            {session.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-muted-light flex items-center gap-1.5">
                                                        <Time01Icon className="w-3.5 h-3.5" />
                                                        {new Date(parseInt(session.id.split('_')[1])).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                                                        Resume & JD
                                                    </span>

                                                    {session.atsScore !== null && (
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${session.atsScore >= 80 ? "bg-success/10 text-success border-success/20" :
                                                            session.atsScore >= 60 ? "bg-warning/10 text-warning border-warning/20" :
                                                                "bg-danger/10 text-danger border-danger/20"
                                                            }`}>
                                                            {session.atsScore}% Score
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </main>
                </div>
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
