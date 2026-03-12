"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon, Mail01Icon, LockKeyIcon, SentIcon } from "hugeicons-react";
import { createClient } from "@/utils/supabase/client";

type AuthView = "signIn" | "signUp" | "forgotPassword" | "resetSent";

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const initialView: AuthView = searchParams.get("view") === "signup" ? "signUp" : "signIn";
    const [view, setView] = useState<AuthView>(initialView);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const switchView = (newView: AuthView) => {
        setView(newView);
        setError("");
        setPassword("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (view === "forgotPassword") {
            if (!email) {
                setError("Please enter your email address.");
                return;
            }
            setIsLoading(true);
            try {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
                });
                if (resetError) {
                    setError(resetError.message);
                    setIsLoading(false);
                    return;
                }
                setView("resetSent");
            } catch {
                setError("An unexpected error occurred.");
            }
            setIsLoading(false);
            return;
        }

        if (!email || !password || (view === "signUp" && !name)) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            if (view === "signIn") {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    setError(signInError.message);
                    setIsLoading(false);
                    return;
                }

                router.push("/app");
            } else {
                // Sign Up logic
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth`,
                    }
                });

                if (signUpError) {
                    // Detect duplicate email errors from explicit error messages
                    const msg = signUpError.message.toLowerCase();
                    if (
                        msg.includes("already registered") ||
                        msg.includes("already been registered") ||
                        msg.includes("user already exists") ||
                        msg.includes("email already") ||
                        signUpError.status === 422
                    ) {
                        setError("__ACCOUNT_EXISTS__");
                    } else {
                        setError(signUpError.message);
                    }
                    setIsLoading(false);
                    return;
                }

                // Supabase "silent duplicate": when email confirmation is ON, it returns a
                // fake success with an empty identities array for already-registered emails.
                if (signUpData?.user && signUpData.user.identities?.length === 0) {
                    setError("__ACCOUNT_EXISTS__");
                    setIsLoading(false);
                    return;
                }

                setError("Success! Please check your email to confirm your account.");
                setIsLoading(false);
                return;
            }
        } catch {
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const isSignIn = view === "signIn";
    const isSignUp = view === "signUp";
    const isForgotPassword = view === "forgotPassword";
    const isResetSent = view === "resetSent";

    return (
        <div className="min-h-screen bg-background flex font-sans text-foreground selection:bg-primary/20 selection:text-primary relative isolate">
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none -z-10" />

            {/* Back to Home Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
                <ArrowLeft01Icon className="w-4 h-4" />
                Back
            </Link>

            {/* Left Pane - Branding (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-sunken flex-col justify-between p-12 overflow-hidden border-r border-border">
                {/* Glow effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[100px] rounded-full" />

                <div className="relative z-10 flex flex-col gap-6 max-w-lg mt-12">
                    <img src="/zofu-logo.png" alt="Zofu" className="w-24 h-auto mb-8" />
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
                        Your AI partner for the modern job search.
                    </h1>
                    <p className="text-xl text-muted text-balance mt-4 line-clamp-3">
                        Join thousands of professionals landing their dream roles with precision-engineered resumes and predictive interview intelligence.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="glass-card bg-white/50 backdrop-blur-xl border border-border/50 p-6 rounded-2xl max-w-md shadow-2xl">
                        <div className="text-3xl text-primary/20 absolute top-4 left-4 font-serif leading-none">"</div>
                        <p className="text-lg font-medium relative z-10 pt-4">
                            ZOFU completely eliminated the guesswork. I knew exactly what to highlight and aced every interview question they predicted.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent opacity-80" />
                            <div>
                                <div className="text-sm font-bold">Michael R.</div>
                                <div className="text-xs text-muted">Product Manager</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white lg:bg-transparent">
                <div className="w-full max-w-md space-y-8 bg-white lg:bg-white/80 lg:backdrop-blur-xl lg:border lg:border-border lg:shadow-xl rounded-3xl p-8 lg:p-10 relative">

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src="/zofu-logo.png" alt="Zofu" className="h-8 w-auto" />
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ── Reset Sent Confirmation ── */}
                        {isResetSent && (
                            <motion.div
                                key="resetSent"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="flex flex-col items-center text-center gap-5"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <SentIcon className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold tracking-tight">Check your inbox</h2>
                                    <p className="text-muted mt-2 text-sm">
                                        We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Follow the link to set a new password.
                                    </p>
                                </div>
                                <p className="text-xs text-muted">
                                    Didn&apos;t get it? Check your spam folder, or{" "}
                                    <button
                                        type="button"
                                        onClick={() => switchView("forgotPassword")}
                                        className="font-bold text-foreground hover:underline"
                                    >
                                        try again
                                    </button>
                                    .
                                </p>
                                <button
                                    type="button"
                                    onClick={() => switchView("signIn")}
                                    className="text-sm font-semibold text-muted hover:text-foreground transition-colors"
                                >
                                    ← Back to Sign In
                                </button>
                            </motion.div>
                        )}

                        {/* ── Forgot Password Form ── */}
                        {isForgotPassword && (
                            <motion.div
                                key="forgotPassword"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight">Forgot password?</h2>
                                    <p className="text-muted mt-2 text-sm">
                                        No worries — enter your email and we&apos;ll send you a reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/80 pl-1">Email</label>
                                        <div className="relative">
                                            <Mail01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="demo@zofu.ai"
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
                                        ) : "Send Reset Link"}
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-border mt-8 text-center">
                                    <button
                                        type="button"
                                        onClick={() => switchView("signIn")}
                                        className="text-sm text-muted hover:text-foreground font-medium transition-colors"
                                    >
                                        ← Back to Sign In
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Sign In / Sign Up Forms ── */}
                        {(isSignIn || isSignUp) && (
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                            >
                                <div className="text-center">
                                    <h2 className="text-3xl font-extrabold tracking-tight">
                                        {isSignIn ? "Welcome back" : "Create an account"}
                                    </h2>
                                    <p className="text-muted mt-2">
                                        {isSignIn ? "Enter your details to sign in to your workspace." : "Get started with your free ZOFU account."}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                                    <AnimatePresence mode="wait">
                                        {isSignUp && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <label className="text-sm font-semibold text-foreground/80 pl-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    disabled={isLoading}
                                                    className="w-full p-4 rounded-xl bg-surface-sunken border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground/80 pl-1">Email</label>
                                        <div className="relative">
                                            <Mail01Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="demo@zofu.ai"
                                                disabled={isLoading}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-sunken border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between pl-1">
                                            <label className="text-sm font-semibold text-foreground/80">Password</label>
                                            {isSignIn && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchView("forgotPassword")}
                                                    className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
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

                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div
                                                key={error}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`text-sm font-medium p-3 rounded-lg text-center ${
                                                    error === "__ACCOUNT_EXISTS__"
                                                        ? "text-amber-700 bg-amber-50 border border-amber-200"
                                                        : error.startsWith("Success")
                                                        ? "text-success bg-success-light/50 border border-success/20"
                                                        : "text-danger bg-danger-light/50 border border-danger/20"
                                                }`}
                                            >
                                                {error === "__ACCOUNT_EXISTS__" ? (
                                                    <span>
                                                        An account with this email already exists.{" "}
                                                        <button
                                                            type="button"
                                                            onClick={() => switchView("signIn")}
                                                            className="font-bold underline hover:no-underline"
                                                        >
                                                            Sign in instead
                                                        </button>
                                                    </span>
                                                ) : error}
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
                                        ) : isSignIn ? "Sign In" : "Create Account"}
                                    </button>
                                </form>

                                <div className="pt-6 border-t border-border mt-8 text-center">
                                    <p className="text-sm text-muted">
                                        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => switchView(isSignIn ? "signUp" : "signIn")}
                                            className="text-foreground font-bold hover:underline"
                                        >
                                            {isSignIn ? "Sign up" : "Sign in"}
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
