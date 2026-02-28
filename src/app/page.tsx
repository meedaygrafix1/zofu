"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  SparklesIcon,
  CheckmarkBadge01Icon,
  Message01Icon,
  FlashIcon,
  File01Icon,
  BotIcon,
  UserIcon
} from "hugeicons-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/zofu-logo.png" alt="Zofu" className="h-6 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="bg-foreground text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition-transform hover:scale-105"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24">
        {/* 1. Hero Section */}
        <section className="border-b border-border border-t mt-8">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-8 relative border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-3xl -z-10 rounded-full" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>The AI Resume Co-Pilot</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mx-auto max-w-4xl text-foreground"
            >
              Don't just apply. <br />
              Stand out and get hired.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted max-w-2xl mx-auto text-balance"
            >
              Stop sending applications into the ATS black hole.<br />
              ZOFU's AI instantly aligns your unique experience with exactly what hiring managers are looking for.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                href="/auth"
                className="w-full sm:w-[280px] px-8 py-4 rounded-full bg-foreground text-white font-semibold text-lg hover:bg-black transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Try for Free
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-[280px] px-8 py-4 rounded-full bg-white text-foreground border-2 border-border font-semibold text-lg hover:bg-surface-sunken hover:border-foreground/20 transition-all flex items-center justify-center"
              >
                See How It Works
              </Link>
            </motion.div>

            {/* Hero Visual Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-20 relative mx-auto max-w-5xl rounded-2xl glass-card overflow-hidden border border-border/50 shadow-2xl p-2 bg-white/50 backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none" />
              <img
                src="/zofu-hero-preview.png"
                alt="ZOFU Interface"
                className="w-full h-auto rounded-xl shadow-sm border border-border/30 opacity-90"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
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
        <section className="border-b border-border">
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
                <div>
                  <FlashIcon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Precision Matching</h3>
                  <p className="text-muted max-w-md">Instantly maps your existing skills to the exact "must-haves" found in the target job description.</p>
                </div>
              </div>

              {/* Feature 2: Square */}
              <div className="glass-card p-8 flex flex-col justify-between group">
                <CheckmarkBadge01Icon className="w-8 h-8 text-success mb-4 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="text-xl font-bold mb-2">ATS Injection</h3>
                  <p className="text-sm text-muted">Naturally weaves in vital keywords without forced "keyword stuffing".</p>
                </div>
              </div>

              {/* Feature 3: Square */}
              <div className="glass-card p-8 flex flex-col justify-between group">
                <SparklesIcon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Quantified Impact</h3>
                  <p className="text-sm text-muted">Automatically turns "I did X" into "I achieved [Metric] by doing X".</p>
                </div>
              </div>

              {/* Feature 4: Large */}
              <div className="glass-card md:col-span-2 p-8 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                  <Message01Icon size={200} />
                </div>
                <Message01Icon className="w-8 h-8 text-warning mb-4" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Actionable Interview Prep</h3>
                  <p className="text-muted max-w-md">Generates custom behavioral and technical questions tailored directly to the intersection of your resume and the job.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works */}
        <section id="how-it-works" className="border-b border-border">
          <div className="max-w-7xl mx-auto py-24 px-6 border-x border-border bg-background/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className="text-muted">The lift is incredibly low. Results are instant.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-border via-border-strong to-border" />

                {[
                  { step: "01", title: "Upload", desc: "Drop your current PDF or Word resume.", icon: File01Icon },
                  { step: "02", title: "Paste", desc: "Paste the Job Description from LinkedIn or Indeed.", icon: FlashIcon },
                  { step: "03", title: "Amplify", desc: "Get an ATS-optimized rewrite and prep cheat sheet.", icon: BotIcon }
                ].map((s, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-white border border-border shadow-sm flex items-center justify-center z-10 text-foreground">
                      <s.icon className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="text-sm font-bold text-primary tracking-widest uppercase">Step {s.step}</div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="text-muted px-4">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Interview Intelligence */}
        <section className="bg-foreground text-white border-b border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto py-24 px-6 grid md:grid-cols-2 gap-16 items-center border-x border-white/10 relative z-20">
            <div className="space-y-6 z-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Don't just get the call.<br />Get the job.</h2>
              <p className="text-lg text-white/70">
                Most tools stop at the resume. ZOFU analyzes the exact "gaps" in your profile vs. the JD and acts as your personal AI Coach, providing the precise questions a recruiter will ask to test those gaps.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Try the AI Coach <BotIcon className="w-4 h-4" />
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
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to land your next role?</h2>
              <p className="text-lg text-muted">Join 1,000+ designers and engineers using ZOFU to level up.</p>
              <div className="pt-4">
                <Link
                  href="/auth"
                  className="inline-flex px-8 py-4 rounded-full bg-foreground text-white font-semibold text-lg hover:bg-black transition-transform hover:scale-105 shadow-xl shadow-black/10"
                >
                  Start Your First Amplification
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12 text-center text-sm text-muted">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/zofu-logo.png" alt="Zofu" className="h-4 w-auto grayscale opacity-50" />
        </div>
        <p>&copy; {new Date().getFullYear()} ZOFU. All rights reserved.</p>
      </footer>
    </div>
  );
}
