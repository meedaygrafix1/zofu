"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    SparklesIcon,
    File01Icon,
    ArrowUpRight01Icon,
    Tag01Icon,
    CheckmarkCircle01Icon,
    CancelCircleIcon,
    EyeIcon,
    GitCompareIcon,
    Copy01Icon,
    Download04Icon
} from "hugeicons-react";

export function HeroDashboardMockup() {
    const [step, setStep] = useState(0);

    // Animation sequence loop: 0 = Input, 1 = Scanning, 2 = Amplified
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 3);
        }, 4000); // 4-second loop
        return () => clearInterval(timer);
    }, []);

    const isScanning = step === 1;
    const isAmplified = step === 2;

    // Derived states
    const score = isAmplified ? 94 : 42;
    const scoreColors = isAmplified
        ? { stroke: "#10b981", bg: "#d1fae5", text: "#065f46", label: "Excellent" }
        : { stroke: "#ef4444", bg: "#fee2e2", text: "#991b1b", label: "Needs work" };

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-10 md:mt-20 p-3 md:p-6 rounded-2xl bg-white/30 backdrop-blur-3xl border border-border/50 shadow-2xl flex flex-col md:flex-row gap-4 md:h-[600px] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none" />

            {/* LEFT COLUMN: Input (Matches JDInput style) */}
            <div className="hidden md:flex flex-col w-1/4 gap-4 z-10 shrink-0">
                <div className="glass-card p-4 h-1/2 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <File01Icon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Upload Resume</h3>
                    </div>
                    <div className="flex-1 border-2 border-dashed border-border/60 rounded-xl bg-surface-sunken flex items-center justify-center p-4">
                        <div className="text-center">
                            <File01Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                            <p className="text-[10px] font-medium text-foreground">resume_ux_2024.pdf</p>
                            <p className="text-[10px] text-muted-light mt-1">142 KB</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 h-1/2 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Job Description</h3>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Auto-detected</span>
                    </div>
                    <div className="flex-1 bg-surface-sunken border border-border rounded-xl p-3 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-sunken pointer-events-none" />
                        <p className="text-[10px] text-muted leading-relaxed font-mono">
                            Role: Senior Product Designer<br /><br />
                            Responsibilities:<br />
                            - Lead end-to-end design for core web application.<br />
                            - Establish and maintain comprehensive Design Systems.<br />
                            - Ensure WCAG accessibility compliance across UI.<br />
                            - Leverage Prototyping in Figma to secure stakeholder buy-in.<br />
                        </p>
                    </div>
                </div>

                <button
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-semibold shadow-md text-sm transition-all"
                >
                    {isScanning ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <SparklesIcon className="w-4 h-4" />
                        </motion.div>
                    ) : (
                        <SparklesIcon className="w-4 h-4" />
                    )}
                    {isScanning ? "Amplifying..." : "Amplify Resume"}
                </button>
            </div>

            {/* MIDDLE COLUMN: Resume Preview */}
            <div className="flex-1 glass-card flex flex-col z-10 overflow-hidden shadow-sm relative h-[280px] md:h-auto order-2 md:order-none">
                {/* Header Tab Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 bg-white/50">
                    <div className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-sunken p-1 w-full sm:w-auto">
                        <button className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${isAmplified ? "bg-white text-foreground shadow-sm ring-1 ring-border" : "text-muted hover:text-foreground"}`}>
                            <File01Icon className="h-3.5 w-3.5" /> Amplified
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-muted hover:text-foreground transition-all">
                            <GitCompareIcon className="h-3.5 w-3.5" /> Changes
                        </button>
                        <button className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium transition-all ${!isAmplified && !isScanning ? "bg-white text-foreground shadow-sm ring-1 ring-border" : "text-muted hover:text-foreground"}`}>
                            <EyeIcon className="h-3.5 w-3.5" /> Original
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:bg-surface-sunken">
                            <Copy01Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:bg-black/80 hover:shadow-lg">
                            <Download04Icon className="h-4 w-4" />
                            <span className="hidden z-[10] sm:inline">Download</span>
                        </button>
                    </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 p-6 relative bg-white/40 overflow-hidden font-mono text-[11px] md:text-xs leading-relaxed text-muted/80">
                    {/* Scanning Beam (renders over content) */}
                    <motion.div
                        initial={{ top: "-20%", opacity: 0 }}
                        animate={{
                            top: isScanning ? "120%" : "-20%",
                            opacity: isScanning ? [0, 1, 1, 0] : 0
                        }}
                        transition={{ duration: 1.5, ease: "linear", repeat: isScanning ? Infinity : 0 }}
                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/10 to-primary/20 border-b border-primary z-20 pointer-events-none"
                    />

                    <div className="max-w-xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2 border-b border-border pb-4">
                            <h1 className="text-lg font-bold text-foreground font-sans">Alex Designer</h1>
                            <p>alex@example.com • Portfolio • San Francisco, CA</p>
                        </div>

                        {/* Experience Section */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-foreground border-b border-border pb-1 font-sans">EXPERIENCE</h2>

                            <div className="space-y-1">
                                <div className="flex justify-between font-bold text-foreground">
                                    <span>Senior UI/UX Designer</span>
                                    <span>2020 – Present</span>
                                </div>
                                <div className="flex justify-between text-foreground">
                                    <span>Tech Innovators Inc.</span>
                                </div>

                                <ul className="list-disc pl-4 mt-2 space-y-2 text-muted-strong">
                                    <li>
                                        Led the redesign of the core web application, improving user satisfaction
                                        {isAmplified && (
                                            <motion.span
                                                initial={{ opacity: 0, backgroundColor: "#fff" }}
                                                animate={{ opacity: 1, backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                                                className="text-primary font-semibold rounded px-1 ml-1"
                                            >
                                                and establishing comprehensive Design Systems resulting in a 40% increase in dev velocity
                                            </motion.span>
                                        )}.
                                    </li>
                                    <li>
                                        Conducted user interviews to gather feedback and inform design decisions
                                        {isAmplified && (
                                            <motion.span
                                                initial={{ opacity: 0, backgroundColor: "#fff" }}
                                                animate={{ opacity: 1, backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                                                className="text-primary font-semibold rounded px-1 ml-1"
                                            >
                                                while ensuring strict WCAG accessibility compliance across 50+ components
                                            </motion.span>
                                        )}.
                                    </li>
                                    <li>
                                        Created wireframes and mockups for new features
                                        {isAmplified && (
                                            <motion.span
                                                initial={{ opacity: 0, backgroundColor: "#fff" }}
                                                animate={{ opacity: 1, backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                                                className="text-primary font-semibold rounded px-1 ml-1"
                                            >
                                                , leveraging advanced Prototyping in Figma to secure stakeholder buy-in
                                            </motion.span>
                                        )}.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Analysis */}
            <div className="flex flex-col w-full md:w-1/4 gap-4 z-10 shrink-0 order-1 md:order-none">

                {/* ATS Score Card */}
                <div className="glass-card p-4 md:p-5 form-element-bg w-full flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight01Icon className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">ATS Score</h3>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <svg width="120" height="120" className="-rotate-90">
                                <circle cx="60" cy="60" r="45" fill="none" stroke="var(--surface-sunken)" strokeWidth="8" />
                                <motion.circle
                                    cx="60" cy="60" r="45" fill="none"
                                    stroke={scoreColors.stroke}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 45} // 282.74
                                    animate={{ strokeDashoffset: (2 * Math.PI * 45) - ((score / 100) * (2 * Math.PI * 45)) }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span className="text-2xl font-bold text-foreground">
                                    {score}
                                </motion.span>
                                <span className="text-[10px] text-muted">/ 100</span>
                            </div>
                        </div>
                        <motion.div
                            animate={{ backgroundColor: scoreColors.bg, color: scoreColors.text }}
                            className="mt-3 rounded-full px-3 py-1 text-xs font-medium"
                        >
                            {isScanning ? "Analyzing..." : scoreColors.label}
                        </motion.div>
                    </div>
                </div>

                {/* Keyword Checklist */}
                <div className="hidden md:block glass-card p-5 flex-1 overflow-hidden form-element-bg w-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag01Icon className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Keywords</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Added / Missing */}
                        {isAmplified ? (
                            <>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-medium text-primary">Added (3)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Design Systems", "WCAG", "Figma"].map((kw) => (
                                            <motion.span key={kw} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="rounded-md bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/20">
                                                {kw}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2 mt-4">
                                        <CheckmarkCircle01Icon className="h-3.5 w-3.5 text-success" />
                                        <span className="text-xs font-medium text-success">Found (2)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["UI/UX", "Wireframes"].map((kw) => (
                                            <span key={kw} className="rounded-md bg-success-light px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <CheckmarkCircle01Icon className="h-3.5 w-3.5 text-success" />
                                        <span className="text-xs font-medium text-success">Found (2)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["UI/UX", "Wireframes"].map((kw) => (
                                            <span key={kw} className="rounded-md bg-success-light px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2 mt-4">
                                        <CancelCircleIcon className="h-3.5 w-3.5 text-danger" />
                                        <span className="text-xs font-medium text-danger">Missing (3)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["Design Systems", "WCAG", "Figma"].map((kw) => (
                                            <span key={kw} className="rounded-md bg-danger-light px-2 py-0.5 text-[10px] font-medium text-danger border border-danger/20">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
