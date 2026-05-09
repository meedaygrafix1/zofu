"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon,
  CheckmarkBadge01Icon,
  CheckmarkCircle01Icon,
  Message01Icon,
  FlashIcon,
  BotIcon,
  UserIcon,
  Cancel01Icon,
} from "hugeicons-react";
import { HeroDashboardMockup } from "@/components/HeroDashboardMockup";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import Logo from "@/components/Logo";

const BANNER_ID = "announcement_banner_v1_3_0";

export default function LandingPage() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_ID);
    if (!dismissed) setBannerVisible(true);
  }, []);

  // Measure banner height dynamically
  useEffect(() => {
    if (!bannerVisible || !bannerRef.current) {
      setBannerHeight(0);
      return;
    }
    const el = bannerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBannerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    setBannerHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, [bannerVisible]);

  const dismissBanner = () => {
    localStorage.setItem(BANNER_ID, "dismissed");
    setBannerVisible(false);
  };
  return (
    <div data-theme="light" className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative">

      {/* Announcement Banner — fixed above the navbar */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            ref={bannerRef}
            key="announcement-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 inset-x-0 z-[60] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
              {/* Glow blobs */}
              <div className="absolute left-1/4 top-0 h-full w-32 bg-primary/20 blur-2xl pointer-events-none" />
              <div className="absolute right-1/4 top-0 h-full w-32 bg-accent/20 blur-2xl pointer-events-none" />

              <div className="relative flex items-center gap-2 flex-wrap justify-center">
                <span className="inline-flex items-center gap-1 bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <SparklesIcon className="h-3 w-3" />
                  New
                </span>
                <span className="text-white/90 font-medium">
                  Upload your resume PDF in AI Coach for instant personalized feedback
                </span>
                <span className="hidden sm:inline text-white/40">·</span>
                <Link
                  href="/auth?view=signup"
                  className="hidden sm:inline-flex items-center gap-1 text-primary font-semibold hover:text-primary-hover transition-colors whitespace-nowrap"
                >
                  Try it now →
                </Link>
              </div>

              <button
                id="announcement-banner-close"
                onClick={dismissBanner}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
              >
                <Cancel01Icon className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav
        className="fixed inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-[top] duration-300 ease-in-out"
        style={{ top: bannerHeight }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto" alt="Zofu" />
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Features",    href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing",     href: "#pricing" },
              { label: "FAQ",         href: "#faq" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth?view=signup"
              className="bg-foreground text-background px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-transform hover:scale-105 inline-flex items-center justify-center h-9"
            >
              Start Free
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-foreground transition-transform duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4">
            {[
              { label: "Features",    href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing",     href: "#pricing" },
              { label: "FAQ",         href: "#faq" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {label}
              </a>
            ))}
            <Link href="/auth" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
          </div>
        )}
      </nav>

      <main className="flex-1 transition-[padding-top] duration-300 ease-in-out" style={{ paddingTop: bannerHeight + 64 + 24 }}>
        {/* 1. Hero Section */}
        <section className="border-b border-border border-t mt-8">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-8 relative border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-3xl -z-10 rounded-full" />



            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mx-auto max-w-4xl text-foreground">
              Don't just apply. <br />
              Stand out and get hired.
            </h1>

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto text-balance">
              Stop sending applications into the ATS black hole.<br />
              ZOFU's AI instantly aligns your unique experience with exactly what hiring managers are looking for.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/auth?view=signup"
                className="w-full sm:w-[220px] h-14 px-8 rounded-xl bg-foreground text-background font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Try for Free
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-[220px] h-14 px-8 rounded-xl bg-surface-elevated text-foreground border-2 border-border font-semibold text-lg hover:bg-surface-sunken hover:border-foreground/20 transition-all flex items-center justify-center"
              >
                See How It Works
              </Link>
            </div>

            <HeroDashboardMockup />
          </div>
        </section>

        {/* 2. The Problem Section */}
        <section className="bg-surface-sunken border-b border-border">
          <div className="max-w-7xl mx-auto py-24 px-6 text-center border-x border-border">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">The Resume Black Hole is real.</h2>
              <p className="text-lg text-muted text-balance mx-auto">
                You’re highly qualified, but the ATS doesn’t know it. Generic resumes get filtered out instantly. Manual tailoring takes hours for every single application.
                <span className="font-semibold text-foreground"> ZOFU gets you past the filters in seconds.</span>
              </p>
            </div>
          </div>
        </section>

        {/* 3. The Bento Grid (Features) */}
        <section className="border-b border-border" id="features">
          <div className="max-w-7xl mx-auto py-24 px-6 space-y-12 border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to land the offer.</h2>
              <p className="text-muted text-lg">Powerful AI seamlessly integrated into a beautiful workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              {/* Feature 1: Large */}
              <div className="glass-card md:col-span-2 p-8 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute -right-12 -top-12 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                  <FlashIcon size={200} />
                </div>
                <FlashIcon className="w-8 h-8 text-primary mb-4" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Precision Matching</h3>
                  <p className="text-muted max-w-md">Instantly maps your existing skills to the exact "must-haves" found in the target job description.</p>
                </div>
              </div>

              {/* Feature 2: Square */}
              <div className="glass-card p-8 flex flex-col justify-between group">
                <CheckmarkBadge01Icon className="w-8 h-8 text-success mb-4 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="text-xl font-bold mb-2">ATS Injection</h3>
                  <p className="text-muted">Naturally weaves in vital keywords without forced "keyword stuffing".</p>
                </div>
              </div>

              {/* Feature 3: Square */}
              <div className="glass-card p-8 flex flex-col justify-between group">
                <SparklesIcon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Quantified Impact</h3>
                  <p className="text-muted">Automatically turns "I did X" into "I achieved [Metric] by doing X".</p>
                </div>
              </div>

              {/* Feature 4: Large */}
              <div className="glass-card md:col-span-2 p-8 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                  <Message01Icon size={200} />
                </div>
                <Message01Icon className="w-8 h-8 text-warning mb-4" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Actionable Interview Prep</h3>
                  <p className="text-muted max-w-md">Generates custom behavioral and technical questions tailored directly to the intersection of your resume and the job.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />

        {/* 5. Pricing */}
        <section className="border-b border-border" id="pricing">
          <div className="max-w-7xl mx-auto py-24 px-6 space-y-12 border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing.</h2>
              <p className="text-muted text-lg">Start free. Upgrade when you're ready.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free */}
              <div className="glass-card p-7 flex flex-col border border-border">
                <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Free</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">₦0</span>
                </div>
                <p className="text-sm text-muted mb-6">forever</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {["5 resume optimizations/month","ATS score checker","Basic keyword matching"].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckmarkCircle01Icon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth?view=signup" className="w-full py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-sunken transition-colors text-center">
                  Get started free
                </Link>
              </div>

              {/* Pro — highlighted */}
              <div className="glass-card p-7 flex flex-col border-2 border-foreground/20 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-wide">
                  Most Popular
                </span>
                <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Pro</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">₦2,000</span>
                </div>
                <p className="text-sm text-muted mb-6">/ month</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {["Unlimited optimizations","AI Cover Letter generation","Priority AI processing","Unlimited session history","AI Interview Coach"].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckmarkCircle01Icon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth?view=signup" className="w-full py-2.5 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity text-center">
                  Start free trial
                </Link>
              </div>

              {/* Team */}
              <div className="glass-card p-7 flex flex-col border border-border">
                <p className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Team</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">₦5,000</span>
                </div>
                <p className="text-sm text-muted mb-6">/ month</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {["Everything in Pro","Up to 5 team members","Shared session library","Priority support"].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckmarkCircle01Icon className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth?view=signup" className="w-full py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-surface-sunken transition-colors text-center">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Testimonials */}
        <section className="bg-surface-sunken border-b border-border">
          <div className="max-w-7xl mx-auto py-24 px-6 space-y-12 border-x border-border">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">Real people. Real results.</h2>
              <p className="text-muted text-lg">Job seekers who used ZOFU to land their next role.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I applied to 3 jobs after using ZOFU. Got callbacks on all 3. Never had that happen before.",
                  name: "Tunde A.",
                  role: "Product Manager, Lagos",
                },
                {
                  quote: "The ATS score went from 41 to 87 on the first optimization. I could not believe it was that simple.",
                  name: "Chioma E.",
                  role: "Software Engineer, Abuja",
                },
                {
                  quote: "The interview prep questions were eerily accurate. I was asked almost the same questions in my final round.",
                  name: "David O.",
                  role: "Data Analyst, Remote",
                },
              ].map(({ quote, name, role }) => (
                <div key={name} className="glass-card p-6 flex flex-col gap-4 border border-border">
                  <p className="text-sm text-foreground/80 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                  <div className="mt-auto pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Trust bar */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto py-10 px-6 border-x border-border bg-background/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { stat: "500+", label: "Resumes optimized" },
                { stat: "avg +41pts", label: "ATS score increase" },
                { stat: "3×", label: "More callbacks reported" },
                { stat: "100%", label: "Data never sold or shared" },
              ].map(({ stat, label }) => (
                <div key={label} className="space-y-1">
                  <p className="text-2xl font-extrabold text-foreground">{stat}</p>
                  <p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="border-b border-border" id="faq">
          <div className="max-w-7xl mx-auto py-24 px-6 border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold">Frequently asked questions.</h2>
              </div>
              <dl className="space-y-0 divide-y divide-border">
                {[
                  {
                    q: "Will ZOFU fabricate experience or skills I don't have?",
                    a: "Never. ZOFU only works with what's already in your resume — it rewrites, sharpens, and quantifies your existing experience to better match the job description. Nothing is invented.",
                  },
                  {
                    q: "Does it work with all ATS systems?",
                    a: "Yes. ZOFU optimizes for keyword density, structure, and formatting that passes major ATS platforms including Greenhouse, Lever, Workday, iCIMS, and more.",
                  },
                  {
                    q: "Is my resume data safe?",
                    a: "Your data is encrypted and never sold or shared with third parties. You can delete your sessions at any time from your dashboard.",
                  },
                  {
                    q: "What file formats does ZOFU accept?",
                    a: "You can upload your resume as a PDF (up to 5 MB). After optimization, you can download the result as a PDF or an editable DOCX file.",
                  },
                  {
                    q: "How is ZOFU different from Jobscan or Resume.io?",
                    a: "Jobscan scores your resume. Resume.io helps you build one. ZOFU does both — it reads your existing resume, understands the job description, and actively rewrites your content to maximize match. It also preps you for the interview that follows.",
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="py-6">
                    <dt className="text-sm font-semibold text-foreground mb-2">{q}</dt>
                    <dd className="text-sm text-muted leading-relaxed">{a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 5. Interview Intelligence */}
        <section className="bg-slate-900 text-white border-b border-border relative overflow-hidden dark:bg-slate-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto py-24 px-6 grid md:grid-cols-2 gap-16 items-center border-x border-white/10 relative z-20">
            <div className="space-y-6 z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Don't just get the call.<br />Get the job.</h2>
              <p className="text-lg text-white/70">
                Most tools stop at the resume. ZOFU analyzes the exact "gaps" in your profile vs. the JD and acts as your personal AI Coach, providing the precise questions a recruiter will ask to test those gaps.
              </p>
              <Link
                href="/auth?view=signup"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white text-slate-900 font-semibold text-lg rounded-xl hover:bg-white/90 transition-colors"
              >
                Try the AI Coach <BotIcon className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 z-10 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl pointer-events-none" />
              <div className="flex gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-white/90" />
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm text-white/90">
                  How should I explain my one year career gap during the transition to PM?
                </div>
              </div>
              <div className="flex gap-4 flex-row-reverse relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <BotIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-none p-4 text-sm text-white shadow-inner shadow-primary/10">
                  <strong>Focus on the upskilling.</strong> Since the JD asks for Agile experience, highlight that you spent that year earning your Scrum certification and building a side project using Jira sprints. Frame the gap as an intentional educational pivot.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto py-24 px-6 text-center border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to land your next role?</h2>
              <p className="text-lg text-muted">Join 1,000+ designers and engineers using ZOFU to level up.</p>
              <div className="pt-4">
                <Link
                  href="/auth?view=signup"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-foreground text-background font-semibold text-lg hover:opacity-90 transition-transform hover:scale-105 shadow-xl shadow-black/10"
                >
                  Start Your First Optimization
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-elevated py-12 text-center text-sm text-muted">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Logo className="h-4 w-auto grayscale opacity-50" alt="Zofu" />
        </div>
        <p>&copy; {new Date().getFullYear()} ZOFU. All rights reserved.</p>
      </footer>
    </div>
  );
}
