"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload01Icon,
    File01Icon,
    CheckmarkCircle01Icon,
    FlashIcon,
    SparklesIcon,
    BotIcon,
} from "hugeicons-react";

/* ─── CARD 1: Upload ────────────────────────────────────────────────────── */
function UploadVisual({ play }: { play: boolean }) {
    const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
    const [progress, setProgress] = useState(0);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!play) return;
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setPhase(0); setProgress(0);

        const q = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };

        q(() => setPhase(1), 500);
        q(() => setPhase(2), 1300);
        for (let i = 0; i <= 100; i += 8) {
            q(() => setProgress(Math.min(i, 100)), 1300 + i * 14);
        }
        q(() => setPhase(3), 2800);
        q(() => { setPhase(0); setProgress(0); }, 5200);
        return () => timers.current.forEach(clearTimeout);
    }, [play]);

    return (
        <div className="relative flex flex-col gap-3 p-4 h-full">
            <div className="flex items-center gap-1.5 mb-0.5">
                <div className="h-2 w-2 rounded-full bg-danger/40" />
                <div className="h-2 w-2 rounded-full bg-warning/40" />
                <div className="h-2 w-2 rounded-full bg-success/40" />
                <div className="ml-auto text-[9px] font-medium text-muted">Resume Upload</div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 3 ? (
                    <motion.div key="done"
                        initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col gap-2.5 flex-1"
                    >
                        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-light/40 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10">
                                <CheckmarkCircle01Icon className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground">Sarah_Chen_Resume.pdf</p>
                                <p className="text-[10px] text-success font-medium">Parsed · 847 words extracted</p>
                            </div>
                        </div>
                        <div className="flex-1 rounded-xl border border-border bg-surface-sunken/60 p-3 space-y-1.5 overflow-hidden">
                            {[
                                { t: "name", v: "SARAH CHEN" },
                                { t: "bar", v: "85%" },
                                { t: "text", v: "Product Manager · 6 years" },
                                { t: "bar", v: "65%" },
                                { t: "header", v: "EXPERIENCE" },
                                { t: "bar", v: "50%" },
                                { t: "sub", v: "Acme Corp | Sr. PM" },
                                { t: "bar", v: "90%" },
                                { t: "bullet", v: "• Led cross-functional teams of 12+" },
                                { t: "bar", v: "75%" },
                            ].map((item, i) => (
                                item.t === "bar"
                                    ? <div key={i} className="h-1.5 rounded-full bg-border/60" style={{ width: item.v }} />
                                    : <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        className={`text-[9px] truncate ${item.t === "name" ? "font-extrabold text-foreground text-[10px]" : item.t === "header" ? "font-bold uppercase tracking-wide text-foreground/70" : item.t === "sub" ? "font-semibold text-foreground/80" : "text-muted"}`}>
                                        {item.v}
                                    </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="drop" exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-2.5">
                        <motion.div
                            animate={phase === 1
                                ? { borderColor: "var(--primary)", backgroundColor: "rgba(59,130,246,0.04)", scale: 1.01 }
                                : { borderColor: "var(--border)", backgroundColor: "transparent", scale: 1 }}
                            transition={{ type: "spring", stiffness: 280, damping: 22 }}
                            className="flex-1 relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5 text-center"
                        >
                            <AnimatePresence>
                                {phase === 1 && (
                                    <motion.div key="chip"
                                        initial={{ opacity: 0, y: -22, x: 16, rotate: 8 }}
                                        animate={{ opacity: 1, y: 0, x: 0, rotate: -2 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.85 }}
                                        className="absolute -top-5 right-2 flex items-center gap-1.5 rounded-lg border border-border bg-white px-2 py-1.5 shadow-lg text-[10px] font-semibold text-foreground"
                                    >
                                        <File01Icon className="h-3 w-3 text-primary" />
                                        resume.pdf
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <motion.div
                                animate={phase === 1 ? { scale: 1.18, y: -4 } : { scale: 1, y: 0 }}
                                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${phase === 1 ? "bg-primary-ultra-light" : "bg-surface-sunken"}`}
                            >
                                <Upload01Icon className={`h-6 w-6 ${phase === 1 ? "text-primary" : "text-muted"}`} />
                            </motion.div>
                            <div>
                                <p className="text-[11px] font-semibold text-foreground">{phase === 1 ? "Drop to upload" : "Drag & drop your resume"}</p>
                                <p className="text-[9.5px] text-muted mt-0.5">PDF only · Max 10MB</p>
                            </div>
                        </motion.div>

                        <AnimatePresence>
                            {phase === 2 && (
                                <motion.div key="prog" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="rounded-xl border border-border bg-white p-3 space-y-2"
                                >
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <File01Icon className="h-3 w-3 text-primary animate-pulse" />
                                            Parsing resume…
                                        </span>
                                        <span className="text-primary font-bold tabular-nums">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                                        <motion.div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── CARD 2: Paste – self-running typewriter ───────────────────────────── */
const JD_SAMPLE = `Senior Product Manager

We're looking for a data-driven PM with 5+ years launching 0→1 products. You'll own the roadmap, work cross-functionally with Engineering & Design, and drive KPIs using SQL analytics.

Requirements:
• Proven track record in Agile environments
• Strong SQL and analytical mindset
• Experience with A/B testing frameworks`;

function PasteVisual({ play: _play }: { play: boolean }) {
    const [text, setText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        let index = 0;
        let isDeleting = false;
        setText(""); setDeleting(false);

        const tick = () => {
            if (!isDeleting) {
                index++;
                setText(JD_SAMPLE.slice(0, index));
                if (index >= JD_SAMPLE.length) {
                    const t = setTimeout(() => { isDeleting = true; setDeleting(true); tick(); }, 2200);
                    timers.current.push(t);
                    return;
                }
                const t = setTimeout(tick, 14 + Math.random() * 10);
                timers.current.push(t);
            } else {
                index -= 3;
                if (index < 0) index = 0;
                setText(JD_SAMPLE.slice(0, index));
                if (index === 0) {
                    const t = setTimeout(() => { isDeleting = false; setDeleting(false); tick(); }, 800);
                    timers.current.push(t);
                    return;
                }
                const t = setTimeout(tick, 8);
                timers.current.push(t);
            }
        };

        const start = setTimeout(tick, 500);
        timers.current.push(start);
        return () => timers.current.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col gap-2.5 p-4 h-full">
            <div className="flex items-center gap-1.5 mb-0.5">
                <div className="h-2 w-2 rounded-full bg-danger/40" />
                <div className="h-2 w-2 rounded-full bg-warning/40" />
                <div className="h-2 w-2 rounded-full bg-success/40" />
                <div className="ml-auto text-[9px] font-medium text-muted">Job Description</div>
            </div>

            <div className={`relative flex-1 rounded-xl border overflow-hidden transition-all duration-300 ${
                text.length > 10
                    ? deleting
                        ? "border-warning shadow-[0_0_0_3px_rgba(245,158,11,0.08)]"
                        : "border-primary shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                    : "border-border"
            }`}>
                <div className="absolute inset-0 overflow-hidden p-3">
                    <div className="text-[9.5px] leading-[15px] text-foreground font-mono whitespace-pre-wrap break-words">
                        {text || <span className="text-muted-light">Paste the full job description here…</span>}
                        {text.length > 0 && (
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                className={`inline-block w-[1.5px] h-[10px] ml-0.5 align-middle ${deleting ? "bg-warning" : "bg-primary"}`}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-muted">
                <File01Icon className="h-3.5 w-3.5 shrink-0" />
                Paste the complete JD for best results
            </div>
        </div>
    );
}

/* ─── CARD 3: Optimize – self-running ATS score loader ──────────────────── */
const ATS_STATS = [
    { label: "Keyword Match", startPct: 31, endPct: 94, color: "bg-primary" },
    { label: "Impact Score",  startPct: 28, endPct: 91, color: "bg-accent" },
    { label: "Readability",   startPct: 72, endPct: 98, color: "bg-success" },
    { label: "ATS Format",    startPct: 55, endPct: 88, color: "bg-warning" },
];

const BEFORE_SCORE = 31;
const AFTER_SCORE  = 94;

function OptimizeVisual({ play: _play }: { play: boolean }) {
    const [phase, setPhase] = useState<"idle" | "loading" | "result">("idle");
    const [score, setScore] = useState(BEFORE_SCORE);
    const [statPcts, setStatPcts] = useState(ATS_STATS.map(s => s.startPct));
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];

        const q = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };

        const runCycle = () => {
            setPhase("idle");
            setScore(BEFORE_SCORE);
            setStatPcts(ATS_STATS.map(s => s.startPct));

            q(() => setPhase("loading"), 600);

            q(() => {
                setPhase("result");
                const steps = 40;
                for (let i = 0; i <= steps; i++) {
                    const eased = 1 - Math.pow(1 - i / steps, 3);
                    const currentScore = Math.round(BEFORE_SCORE + (AFTER_SCORE - BEFORE_SCORE) * eased);
                    const currentStats = ATS_STATS.map(s => Math.round(s.startPct + (s.endPct - s.startPct) * eased));
                    q(() => { setScore(currentScore); setStatPcts(currentStats); }, i * 45);
                }
                q(runCycle, steps * 45 + 2500);
            }, 1400);
        };

        runCycle();
        return () => timers.current.forEach(clearTimeout);
    }, []);

    const scoreColor  = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-danger";
    const gaugeStroke = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";
    const circumference = 2 * Math.PI * 36;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-1 border-b border-border px-3 py-2 bg-surface-sunken/60 shrink-0">
                {["Optimized", "Original"].map((t, i) => (
                    <div key={t} className={`rounded-md px-2 py-0.5 text-[8.5px] font-semibold ${i === 0 ? "bg-white shadow text-foreground" : "text-muted"}`}>{t}</div>
                ))}
                <div className="ml-auto text-[8px] font-semibold text-muted">ATS Analysis</div>
            </div>

            <AnimatePresence mode="wait">
                {phase === "loading" && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center gap-4 p-5"
                    >
                        <div className="relative h-20 w-20">
                            <div className="absolute inset-0 rounded-full border-4 border-border" />
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <SparklesIcon className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[11px] font-semibold text-foreground">Analyzing resume…</div>
                            <div className="text-[9.5px] text-muted mt-0.5">Matching against job description</div>
                        </div>
                        <div className="w-full space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="shimmer h-2 rounded" style={{ width: `${70 - i * 15}%` }} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {(phase === "result" || phase === "idle") && (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center gap-4 p-4"
                    >
                        {/* Big gauge only */}
                        <div className="relative h-32 w-32 shrink-0">
                            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--surface-sunken)" strokeWidth="6" />
                                <motion.circle
                                    cx="40" cy="40" r="36" fill="none"
                                    stroke={gaugeStroke}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                                    transition={{ duration: 0.08 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-[30px] font-extrabold tabular-nums leading-none ${scoreColor}`}>{score}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wide text-muted mt-1">ATS Score</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Section ──────────────────────────────────────────────────────── */
const STEPS = [
    {
        step: "01", title: "Upload Your Resume",
        desc: "Drop your PDF resume. Our parser extracts every detail — work history, skills, and impact statements — ready to be precision-tailored.",
        icon: Upload01Icon,
        accent: "from-primary/6 via-primary/3 to-transparent",
        badge: "bg-primary-ultra-light text-primary border-primary/20",
        Visual: UploadVisual,
    },
    {
        step: "02", title: "Paste the Job Description",
        desc: "Copy the full JD from LinkedIn, Indeed, or any job board. ZOFU instantly identifies every requirement to match you against.",
        icon: File01Icon,
        accent: "from-accent/6 via-accent/3 to-transparent",
        badge: "bg-accent-light text-accent border-accent/20",
        Visual: PasteVisual,
    },
    {
        step: "03", title: "Get Your Optimized Resume",
        desc: "AI rewrites your resume to perfectly match the JD — keywords injected naturally, impact quantified, ATS score maximized.",
        icon: FlashIcon,
        accent: "from-success/6 via-success/3 to-transparent",
        badge: "bg-success-light text-success border-success/20",
        Visual: OptimizeVisual,
    },
];

export function HowItWorksSection() {
    const [playing, setPlaying] = useState([false, false, false]);

    useEffect(() => {
        const CYCLE = 9000;
        const intervals: ReturnType<typeof setInterval>[] = [];

        STEPS.forEach((_, i) => {
            const fire = () => {
                setPlaying(prev => { const n = [...prev]; n[i] = true; return n; });
                setTimeout(() => setPlaying(prev => { const n = [...prev]; n[i] = false; return n; }), 200);
            };
            const delay = setTimeout(() => {
                fire();
                const iv = setInterval(fire, CYCLE);
                intervals.push(iv);
            }, i * 600);
            return () => clearTimeout(delay);
        });

        return () => intervals.forEach(clearInterval);
    }, []);

    return (
        <section id="how-it-works" className="border-b border-border">
            <div className="max-w-7xl mx-auto py-24 px-6 border-x border-border bg-background/80 backdrop-blur-sm">

                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-5"
                    >
                        <BotIcon className="w-3.5 h-3.5" />
                        How It Works
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
                    >
                        From resume to offer<br className="hidden md:block" /> in 3 steps.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
                        className="text-lg text-muted max-w-xl mx-auto"
                    >
                        The lift is incredibly low. The results are instant.
                    </motion.p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {STEPS.map(({ step, title, desc, icon: Icon, accent, badge, Visual }, i) => (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="group flex flex-col rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Visual */}
                            <div className={`relative h-[280px] shrink-0 bg-gradient-to-br ${accent} border-b border-border overflow-hidden`}>
                                <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

                                <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${badge}`}>
                                    <Icon className="h-3 w-3" />
                                    Step {step}
                                </div>

                                <div className="absolute inset-3 top-10 rounded-xl border border-border/60 bg-white shadow-md overflow-hidden">
                                    <Visual play={playing[i]} />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex flex-col gap-2 p-6 flex-1">
                                <h3 className="text-lg font-bold text-foreground leading-snug">{title}</h3>
                                <p className="text-sm text-muted leading-relaxed">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
