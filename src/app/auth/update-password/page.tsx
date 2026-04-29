"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon, LockKeyIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { createClient } from "@/utils/supabase/client";
import Logo from "@/components/Logo";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Please fill in both fields.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/app");
            }, 2500);
        } catch {
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex font-sans text-foreground selection:bg-primary/20 selection:text-primary relative isolate">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none -z-10" />

            {/* Back Button */}
            <Link
                href="/auth"
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
                <ArrowLeft01Icon className="w-4 h-4" />
                Back to Sign In
            </Link>

            {/* Left Pane - Branding (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-sunken flex-col justify-between p-12 overflow-hidden border-r border-border">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[100px] rounded-full" />

                <div className="relative z-10 flex flex-col gap-6 max-w-lg mt-12">
                    <Logo className="w-24 h-auto" alt="Zofu" />
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                        Set a strong new password.
                    </h1>
                    <p className="text-xl text-muted text-balance mt-4">
                        Choose something unique — at least 8 characters — to keep your workspace secure.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-muted">
                    © {new Date().getFullYear()} ZOFU. All rights reserved.
                </div>
            </div>

            {/* Right Pane - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white lg:bg-transparent">
                <div className="w-full max-w-md bg-white lg:bg-white/80 lg:backdrop-blur-xl lg:border lg:border-border lg:shadow-xl rounded-3xl p-8 lg:p-10 relative">

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Logo className="h-8 w-auto" alt="Zofu" />
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center gap-5 py-4"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                                    <CheckmarkCircle02Icon className="w-8 h-8 text-success" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight">Password updated!</h2>
                                    <p className="text-muted mt-2 text-sm">
                                        Your password has been changed successfully. Redirecting you to your workspace…
                                    </p>
                                </div>
                                <motion.div
                                    className="h-1 bg-primary rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "linear" }}
                                    style={{ alignSelf: "stretch" }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight">Reset your password</h2>
                                    <p className="text-muted mt-2 text-sm">
                                        Enter and confirm your new password below.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/80 pl-1">New Password</label>
                                        <div className="relative">
                                            <LockKeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-sunken border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/80 pl-1">Confirm Password</label>
                                        <div className="relative">
                                            <LockKeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-sunken border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-sm font-medium p-3 rounded-lg text-center text-danger bg-danger-light/50 border border-danger/20"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 rounded-xl bg-foreground text-white font-semibold flex items-center justify-center hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-black/5"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : "Update Password"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
