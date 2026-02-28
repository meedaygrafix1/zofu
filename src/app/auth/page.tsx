"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon, Mail01Icon, LockKeyIcon } from "hugeicons-react";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password || (!isSignIn && !name)) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            if (isSignIn) {
                // Sign In logic
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
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        // Crucial for email link routing
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setIsLoading(false);
                    return;
                }

                // Usually Supabase requires email verification.
                // If it auto-logs in, we can redirect. Otherwise, show a message.

                // Show a success message instead of redirecting because the session isn't active yet
                setError("Success! Please check your email to confirm your account.");
                setIsLoading(false);
                return;
            }
        } catch (err: any) {
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

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
                            {!isSignIn && (
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
                            <label className="text-sm font-semibold text-foreground/80 pl-1">Password</label>
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
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-sm font-medium p-3 rounded-lg text-center ${error.startsWith('Success') ? 'text-success bg-success-light/50 border border-success/20' : 'text-danger bg-danger-light/50 border border-danger/20'}`}
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
                            ) : isSignIn ? (
                                "Sign In"
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-border mt-8 text-center">
                        <p className="text-sm text-muted">
                            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                    setIsSignIn(!isSignIn);
                                    setError("");
                                }}
                                className="text-foreground font-bold hover:underline"
                            >
                                {isSignIn ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
