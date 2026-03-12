"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    UserIcon,
    LockPasswordIcon,
    BarChartIcon,
    Logout01Icon,
    CheckmarkCircle01Icon,
    Alert01Icon,
    SparklesIcon,
    File01Icon,
} from "hugeicons-react";
import Sidebar from "@/components/Sidebar";
import { useOptimizer } from "@/context/OptimizerContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Toast = { type: "success" | "error"; message: string } | null;

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-sm mb-6 ${
                toast.type === "success"
                    ? "bg-success-light border-success/30 text-success"
                    : "bg-danger-light border-danger/30 text-danger"
            }`}
        >
            {toast.type === "success"
                ? <CheckmarkCircle01Icon className="h-4 w-4 shrink-0" />
                : <Alert01Icon className="h-4 w-4 shrink-0" />}
            {toast.message}
        </motion.div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { sessions, activeSessionId, deleteSession } = useOptimizer();

    // User data
    const [userEmail, setUserEmail] = useState("");
    const [userInitials, setUserInitials] = useState("?");
    const [fullName, setFullName] = useState("");
    const [nameLoading, setNameLoading] = useState(false);
    const [nameToast, setNameToast] = useState<Toast>(null);

    // Password
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwToast, setPwToast] = useState<Toast>(null);

    useEffect(() => {
        (async () => {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email ?? "");
                const name = user.user_metadata?.full_name ?? "";
                setFullName(name);
                const initials = name
                    ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                    : (user.email ?? "?")[0].toUpperCase();
                setUserInitials(initials);
            }
        })();
    }, []);

    const handleSaveName = async () => {
        setNameLoading(true);
        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
            if (error) throw error;
            const initials = fullName
                ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                : userEmail[0]?.toUpperCase() ?? "?";
            setUserInitials(initials);
            setNameToast({ type: "success", message: "Display name updated." });
        } catch (e: unknown) {
            setNameToast({ type: "error", message: (e as Error).message ?? "Failed to update name." });
        } finally {
            setNameLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 8) {
            setPwToast({ type: "error", message: "Password must be at least 8 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwToast({ type: "error", message: "Passwords do not match." });
            return;
        }
        setPwLoading(true);
        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setNewPassword("");
            setConfirmPassword("");
            setPwToast({ type: "success", message: "Password updated successfully." });
        } catch (e: unknown) {
            setPwToast({ type: "error", message: (e as Error).message ?? "Failed to update password." });
        } finally {
            setPwLoading(false);
        }
    };

    const handleSignOut = async () => {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/auth";
    };

    // Stats
    const totalSessions = sessions.length;
    const scoredSessions = sessions.filter(s => s.atsScore !== null);
    const avgScore = scoredSessions.length > 0
        ? Math.round(scoredSessions.reduce((a, s) => a + (s.atsScore ?? 0), 0) / scoredSessions.length)
        : null;
    const highScorers = sessions.filter(s => (s.atsScore ?? 0) >= 80).length;

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewSession={() => router.push("/app/amplify")}
                onLoadSession={(id) => router.push(`/app/amplify?session=${id}`)}
                onDeleteSession={deleteSession}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogoutClick={() => setShowLogoutModal(true)}
            />

            <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5 text-foreground transition-colors">
                        <div className="flex flex-col gap-1.5 items-center justify-center w-5">
                            <span className="h-0.5 w-full bg-foreground rounded-full" />
                            <span className="h-0.5 w-full bg-foreground rounded-full" />
                            <span className="h-0.5 w-3/4 self-start bg-foreground rounded-full" />
                        </div>
                    </button>
                    <Link href="/app"><img src="/zofu-logo.png" alt="Zofu" className="h-6 w-auto object-contain" /></Link>
                    <div className="w-10" />
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 max-w-3xl w-full">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
                        <p className="text-muted mt-1">Manage your account settings.</p>
                    </motion.div>

                    {/* ── Account Info ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <UserIcon className="h-4.5 w-4.5 text-muted" />
                            <h2 className="text-base font-bold text-foreground">Account Info</h2>
                        </div>

                        <ToastBanner toast={nameToast} onClose={() => setNameToast(null)} />

                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-full bg-foreground text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
                                {userInitials}
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{fullName || "—"}</p>
                                <p className="text-sm text-muted">{userEmail}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={userEmail}
                                    readOnly
                                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-muted bg-surface-sunken outline-none cursor-not-allowed"
                                />
                            </div>
                            <button
                                onClick={handleSaveName}
                                disabled={nameLoading}
                                className="px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
                            >
                                {nameLoading ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </motion.div>

                    {/* ── Change Password ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <LockPasswordIcon className="h-4.5 w-4.5 text-muted" />
                            <h2 className="text-base font-bold text-foreground">Change Password</h2>
                        </div>

                        <ToastBanner toast={pwToast} onClose={() => setPwToast(null)} />

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={pwLoading || !newPassword || !confirmPassword}
                                className="px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
                            >
                                {pwLoading ? "Updating…" : "Update Password"}
                            </button>
                        </div>
                    </motion.div>

                    {/* ── Stats ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                            <BarChartIcon className="h-4.5 w-4.5 text-muted" />
                            <h2 className="text-base font-bold text-foreground">Your Stats</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: File01Icon, label: "Total Optimizations", value: totalSessions.toString() },
                                { icon: SparklesIcon, label: "Avg. ATS Score", value: avgScore !== null ? `${avgScore}%` : "—" },
                                { icon: CheckmarkCircle01Icon, label: "Scores ≥ 80%", value: highScorers.toString() },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex flex-col items-center justify-center text-center rounded-xl bg-surface-sunken border border-border p-4 gap-1">
                                    <Icon className="h-5 w-5 text-muted mb-1" />
                                    <span className="text-2xl font-bold text-foreground">{value}</span>
                                    <span className="text-[11px] text-muted leading-tight">{label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Danger Zone ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-danger/20">
                        <div className="flex items-center gap-3 mb-5">
                            <Logout01Icon className="h-4.5 w-4.5 text-danger" />
                            <h2 className="text-base font-bold text-danger">Sign Out</h2>
                        </div>
                        <p className="text-sm text-muted mb-4">You will be signed out of your workspace and redirected to the sign-in page.</p>
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="px-5 py-2.5 rounded-xl bg-danger/10 text-danger border border-danger/20 text-sm font-semibold hover:bg-danger/20 transition-colors"
                        >
                            Sign Out
                        </button>
                    </motion.div>
                </main>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-foreground mb-2">Sign Out</h3>
                            <p className="text-sm text-muted">Are you sure you want to sign out of Zofu?</p>
                        </div>
                        <div className="p-4 bg-surface-sunken border-t border-border flex gap-3 justify-end">
                            <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-black/5 transition-colors">Cancel</button>
                            <button onClick={handleSignOut} className="px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg bg-danger text-white hover:opacity-90 transition-opacity shadow-sm">
                                <Logout01Icon className="h-4 w-4" />Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
