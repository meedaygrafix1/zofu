"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCardIcon,
    CheckmarkCircle01Icon,
    Logout01Icon,
    SparklesIcon,
    FlashIcon,
    StarIcon,
} from "hugeicons-react";
import Sidebar from "@/components/Sidebar";
import { useOptimizer } from "@/context/OptimizerContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = [
    {
        name: "Free",
        price: "₦0",
        period: "forever",
        description: "Great for trying out Zofu.",
        features: ["5 resume optimizations/month", "ATS score checker", "Basic keyword matching"],
        current: true,
        cta: "Current Plan",
        icon: StarIcon,
        accent: "border-border",
        badge: null,
    },
    {
        name: "Pro",
        price: "₦2,000",
        period: "/ month",
        description: "For active job seekers.",
        features: ["Unlimited optimizations", "AI Cover Letter generation", "Priority AI processing", "Session history (unlimited)", "AI Interview Coach"],
        current: false,
        cta: "Coming Soon",
        icon: SparklesIcon,
        accent: "border-primary/40 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]",
        badge: "Most Popular",
    },
    {
        name: "Team",
        price: "₦5,000",
        period: "/ month",
        description: "For career coaches & teams.",
        features: ["Everything in Pro", "Up to 5 team members", "Shared session library", "Priority support"],
        current: false,
        cta: "Coming Soon",
        icon: FlashIcon,
        accent: "border-border",
        badge: null,
    },
];

export default function BillingPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { sessions, activeSessionId, deleteSession } = useOptimizer();

    const handleSignOut = async () => {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/auth";
    };

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

                <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-warning-light text-warning border border-warning/20">
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-muted">Paid plans are launching soon. You&apos;re on the Free plan for now.</p>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mb-10">
                        {PLANS.map(({ name, price, period, description, features, current, cta, icon: Icon, accent, badge }, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`glass-card p-6 flex flex-col border ${accent} relative overflow-hidden`}
                            >
                                {badge && (
                                    <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wide">
                                        {badge}
                                    </div>
                                )}

                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${current ? "bg-surface-sunken border border-border" : "bg-foreground"}`}>
                                    <Icon className={`h-5 w-5 ${current ? "text-muted" : "text-white"}`} />
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-0.5">{name}</h3>
                                <p className="text-sm text-muted mb-4">{description}</p>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-extrabold text-foreground">{price}</span>
                                    <span className="text-sm text-muted">{period}</span>
                                </div>

                                <ul className="space-y-2.5 mb-8 flex-1">
                                    {features.map(f => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm">
                                            <CheckmarkCircle01Icon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <span className="text-foreground/80">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                        current
                                            ? "bg-surface-sunken border border-border text-muted cursor-default"
                                            : "bg-foreground/10 text-foreground/40 cursor-not-allowed"
                                    }`}
                                >
                                    {cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card max-w-5xl p-5 flex items-center gap-4 border-primary/20 bg-primary/3"
                    >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CreditCardIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">Paid plans launching soon</p>
                            <p className="text-xs text-muted">You&apos;ll keep your current usage and data when plans go live. No action needed.</p>
                        </div>
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
