# ZOFU — AI Resume Optimizer
### Product Proposal & Feature Documentation
**Version 1.3.0 · May 2026**

---

## Executive Summary

**Zofu** (zofu.app) is an AI-powered resume optimization platform built for the modern job seeker. Where traditional tools either grade your resume or help you build one from scratch, Zofu does something fundamentally different — it **reads your existing resume, deeply understands a target job description, and actively rewrites your content** to maximize your match score against Applicant Tracking Systems (ATS) and hiring managers.

Zofu is live, functional, and already helping job seekers in Nigeria and across Africa land more interviews. We're seeking a strategic partner or investor to help us scale distribution, invest in AI model quality, and accelerate the paid plan rollout.

---

## The Problem We're Solving

> **75% of resumes are never seen by a human.** They are filtered out by ATS software before they reach a recruiter's desk.

The modern job application process is broken for candidates:

- **ATS Black Hole:** Resumes that don't contain the exact keywords in a job description are automatically rejected — regardless of how qualified the applicant is.
- **Time-Intensive Tailoring:** Properly customizing a resume for each application can take 1–2 hours. Most candidates apply with a generic resume and get no callbacks.
- **Generic Tools Don't Solve It:** Resume builders help you format. Score checkers tell you what's wrong. Neither one *fixes* it for you.
- **Interview Unpreparedness:** Even candidates who get through the ATS filter are often blindsided by the specific behavioral and technical questions a role demands.

**Zofu collapses this entire workflow — upload, optimize, prep — into a single, seamless session.**

---

## What Zofu Does (The Core Value Proposition)

Zofu takes a job seeker's uploaded resume (PDF) and a target job description, then:

1. **Parses and understands the resume** — extracting skills, experience, and achievements
2. **Analyzes the job description** — identifying required keywords, must-have skills, and the hiring signal
3. **Rewrites the resume content** — amplifying existing experience with precise language, stronger metrics, and naturally injected keywords
4. **Scores the result** — providing an ATS compatibility score (0–100) before and after optimization
5. **Generates interview prep** — creating behavioral and technical questions tailored to the gap between the candidate's profile and the job
6. **Produces a cover letter** — a personalized, job-specific cover letter written automatically from the resume and JD
7. **Allows download** — in PDF or DOCX format with a choice of 4 professional resume templates

This is the complete job application workflow, end-to-end, in one tool.

---

## Product Architecture & Pages

### 1. Marketing Landing Page (`/`)

A polished, conversion-focused landing page with:

- **Announcement Banner** — dismissable, session-persistent, announces the latest features
- **Hero Section** — bold value proposition and dual CTAs (Try for Free / See How It Works)
- **Live Dashboard Mockup** — an interactive, animated preview of the actual product interface embedded in the hero
- **Problem Statement** — clearly frames the ATS Black Hole with empathy
- **Feature Bento Grid** — visual layout of the 4 core features (Precision Matching, ATS Injection, Quantified Impact, Interview Prep)
- **How It Works Section** — step-by-step walkthrough with animated UI illustrations
- **Pricing Section** — three transparent tiers (Free, Pro, Team)
- **Testimonials** — real early-user quotes with name and role
- **Trust Bar** — key stats: 500+ resumes optimized, avg +41 pts ATS score increase, 3× more callbacks reported
- **FAQ** — answers to the most common objections
- **AI Coach Showcase** — a dark-theme section with a live chat mockup demonstrating the AI Coach
- **Final CTA + Footer**

### 2. Authentication (`/auth`)

Supabase-powered sign-in / sign-up flow with email/password and OAuth support.

### 3. App Dashboard (`/app`)

The main workspace overview for authenticated users, featuring:

- **Sidebar Navigation** — fixed 280px sidebar with session history, search, navigation to all product pages, Pro upsell banner
- **Optimize a New Resume CTA** — primary action card
- **Quick Stats Widgets** — Total Optimizations count, Average ATS Score across all sessions
- **Recent Activity Table** — lists the last 10 optimization sessions with session name, date, and ATS score badge (color-coded: green ≥80, yellow ≥60, red <60)
- **Session Management** — click any row to restore a session; swipe-to-delete on mobile; hover-delete on desktop

### 4. Optimizer (`/app/amplify`) — Core Feature

The main product workspace. A three-pane layout:

#### Left Pane — Inputs
- **Resume Upload** (`FileUpload` component): Drag-and-drop or click-to-upload a PDF (up to 5 MB). The file is sent to `/api/amplify/parse` which extracts the plain text using `pdf-parse`.
- **Job Description Input** (`JDInput`): A textarea where users paste or type the target job description.
- **Amplify Button** (`AmplifyButton`): Disabled until both inputs are provided. On click, calls the `/api/amplify` endpoint and streams the AI response.
- **New Session Button**: Appears once a session is active, allowing the user to start fresh without losing history.
- **Step Indicator** (`StepIndicator`): A top-bar progress indicator showing Upload → Paste JD → Amplify → Review

#### Center Pane — Resume Preview (`ResumePreview`)
A tabbed preview panel with four views:

| Tab | Description |
|-----|-------------|
| **Amplified** | The AI-rewritten resume, rendered from Markdown. Includes a rich-text inline editor (Bold, Italic, Underline, Lists, Undo/Redo) and live word count. |
| **Cover Letter** | The auto-generated, job-specific cover letter. Pro-only; free users see a blurred preview. |
| **Changes** | A diff view showing each section that was modified, with original text (red), new text (green), and an AI explanation of why the change was made. |
| **Original** | Read-only view of the original uploaded resume text for comparison. |

**Action Buttons (header):**
- **Edit / Done** — toggles an inline contenteditable editor on the Amplified view
- **Copy** — copies the current tab's text to clipboard
- **Download** — opens the Template Picker Modal

#### Right Pane — Analysis Sidebar
- **ATS Score Card** (`ATSScoreCard`): Animated circular progress ring displaying the compatibility score (0–100) with color-coded status labels (Excellent / Good / Needs Work).
- **Keyword Checklist** (`KeywordChecklist`): Three categorized keyword lists:
  - ✅ **Found** — keywords already in the original resume (green badges)
  - ✨ **Added** — keywords injected by the AI (primary-color badges)
  - ❌ **Missing** — keywords still absent after optimization (red badges)
- **Interview Prep** (`InterviewPrep`): Behavioral and technical interview questions, each expandable to reveal context and specific talking points tailored to the role.

### 5. Template Picker Modal
Triggered when the user clicks **Download**, this full-screen modal allows:

- **4 ATS-Friendly Resume Templates:**

| Template | Style | Accent |
|----------|-------|--------|
| **Classic** | Traditional, centered name, navy header dividers | #1A365D |
| **Modern** | Left accent bars, indigo color, clean layout | #4F46E5 |
| **Minimal** | Minimal, light gray, centered, elegant | #111 |
| **Executive** | Bold, dark headers with double dividers | #1C1C2E |

- **Live Preview Pane** — renders the user's actual resume text inside the selected template in real-time, with fluid zoom scaling on mobile
- **Download Options** — PDF (via `jspdf`) and DOCX (via `docx` + `file-saver`)
- Template preference is saved to `localStorage` automatically

### 6. AI Coach (`/app/coach`)

A conversational AI chat interface — a fully featured career coaching assistant:

- **Context-aware** — automatically receives the resume and job description from the current session (or the user can upload a fresh PDF directly in the chat)
- **Streaming responses** — powered by the Vercel AI SDK with Google Gemini
- **Starter Prompts** — four pre-built quick-start questions:
  - "How do I pass ATS screening?"
  - "Tips for salary negotiation"
  - "How to explain career gaps?"
  - "Extract keywords from the job description"
- **PDF Attachment** — users can attach a resume PDF directly in the chat input for instant parsing and feedback (v1.3.0 feature)
- **File Size Limit Modal** — a custom, polished modal that fires when the uploaded PDF exceeds 5 MB, with helpful compression tips and links
- **Markdown Rendering** — AI responses are rendered as rich Markdown (headers, bullets, code blocks, etc.)
- **Auto-scroll** — the chat window always scrolls to the latest message

### 7. Billing (`/app/billing`)

A subscription management page displaying all three pricing tiers with "Coming Soon" state on paid plans. Shows the user's current plan and notifies them that data is preserved when paid plans launch.

### 8. Profile (`/app/profile`)

User account settings page.

---

## Feature Deep-Dives

### AI Resume Amplification Engine
The core AI pipeline is a streaming endpoint at `/api/amplify`. It:

1. Receives the parsed resume text and the job description
2. Calls Google Gemini (via `@ai-sdk/google`) with a structured prompt
3. Returns a JSON payload containing:
   - `amplifiedText` — the full rewritten resume in Markdown
   - `coverLetter` — a job-tailored cover letter
   - `atsScore` — a numeric ATS compatibility score (0–100)
   - `keywords` — an object with `found`, `missing`, and `added` arrays
   - `changes` — an array of diff objects (`section`, `original`, `amplified`, `reason`)
4. Uses `jsonrepair` to safely parse potentially malformed JSON from AI output

**Key Guardrail:** Zofu never fabricates experience. The AI prompt is explicitly instructed to work only with what exists in the user's resume, rewriting and quantifying existing content rather than inventing new achievements.

### ATS Scoring Methodology
Zofu computes an ATS compatibility score based on:
- Keyword match density between the resume and the job description
- Presence of critical must-have skills from the JD
- Structural formatting signals (section headers, bullet points, contact info)
- Role-specific terminology alignment

The score is color-coded and labeled:
- **80–100** → Excellent (green)
- **60–79** → Good (amber)
- **0–59** → Needs Work (red)

Early user data shows an **average improvement of +41 points** after one optimization.

### Session Persistence & History
All optimization sessions are persisted in **Supabase** (PostgreSQL). Each session stores:
- Session ID, title, and timestamp
- Original resume text
- Amplified resume text
- Cover letter
- ATS score
- Keywords and changes

Users can restore any past session from the sidebar or the dashboard activity table. On mobile, sessions support swipe-to-delete gestures. Sessions are scoped to the authenticated user and are never shared.

### Cover Letter Generation (Pro Feature)
After amplification, Zofu automatically generates a personalized cover letter:
- Written in the first person from the candidate's perspective
- References specific points from both the resume and job description
- Professionally formatted with a greeting, body paragraphs, and closing
- Available in the **Cover Letter** tab of the Resume Preview
- Downloadable as PDF or DOCX using the Template Picker
- Free users see a blurred preview with an upgrade prompt (gated in v1.3.0)

### Interview Preparation
The Interview Prep panel (right sidebar on the Optimizer page) generates:

**Behavioral Questions** — Scenario-based questions probing past behavior (STAR format expected):
> _"Tell me about a time you led a cross-functional team under a tight deadline."_

**Technical Questions** — Role-specific technical questions aligned to the skills gap:
> _"How would you design a scalable notification system for a high-traffic application?"_

Each question expands to reveal:
- **Context** — why this question is likely to be asked for this specific role
- **Talking Points** — 3–5 suggested points the candidate should cover in their answer

Questions are generated separately from the main amplification, via the `/api/interview-questions` endpoint, triggered by a "Generate" button after the initial optimization.

### PDF & DOCX Export Engine
Zofu features a fully client-side, browser-based export pipeline with no server roundtrips for export:

**PDF Export (via `jspdf`)**
- Renders the resume markdown as a pixel-perfect A4 PDF
- Smart content detection: identifies name, contact info, section headers, sub-headers, bullet points, and body text
- Applies template-specific typography (font sizes, colors, spacing, accent bars, divider lines)
- Right-aligns date ranges on sub-header rows automatically
- Multi-page support with automatic overflow handling

**DOCX Export (via `docx`)**
- Generates a fully editable Word document
- Preserves bold, bullets, section formatting, and tab stops for date alignment
- Template-specific font sizes and colors applied via the `TextRun` and `Paragraph` APIs
- File saved via `file-saver` as `amplified-resume.docx`

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.6 (App Router, Server/Client Components) |
| **Language** | TypeScript 5 |
| **UI** | React 19 with Tailwind CSS 4 |
| **Animations** | Framer Motion 12 |
| **Icons** | Hugeicons React, Lucide React |
| **AI / LLM** | Google Gemini via Vercel AI SDK (`@ai-sdk/google`, `ai`) |
| **Auth & DB** | Supabase (Auth + PostgreSQL) |
| **PDF Parsing** | `pdf-parse` (server-side) |
| **PDF Export** | `jspdf` (client-side) |
| **DOCX Export** | `docx` + `file-saver` (client-side) |
| **Markdown** | `react-markdown` |
| **Deployment** | Vercel (production) |

---

## Pricing Model

### Free Plan — ₦0/month
- 5 resume optimizations per month
- ATS score checker
- Basic keyword matching

### Pro Plan — ₦2,000/month *(Launching Soon)*
- Unlimited resume optimizations
- AI Cover Letter generation
- Priority AI processing
- Unlimited session history
- AI Interview Coach

### Team Plan — ₦5,000/month *(Launching Soon)*
- Everything in Pro
- Up to 5 team members
- Shared session library
- Priority support

> **Note:** Pricing is denominated in Nigerian Naira, targeting the Nigerian market as the primary launch geography, with plans to expand to other African markets and globally in USD.

---

## Traction & Early Metrics

| Metric | Value |
|--------|-------|
| Resumes optimized | 500+ |
| Avg. ATS score improvement | +41 points |
| Callback rate increase (reported) | 3× |
| Data privacy | 100% — never sold or shared |
| Current version | v1.3.0 |

**User Testimonials:**
> *"I applied to 3 jobs after using ZOFU. Got callbacks on all 3. Never had that happen before."*
> — Tunde A., Product Manager, Lagos

> *"The ATS score went from 41 to 87 on the first optimization. I could not believe it was that simple."*
> — Chioma E., Software Engineer, Abuja

> *"The interview prep questions were eerily accurate. I was asked almost the same questions in my final round."*
> — David O., Data Analyst, Remote

---

## Competitive Landscape

| Tool | What It Does | What It Doesn't Do |
|------|-------------|-------------------|
| **Jobscan** | Scores your resume against a JD | Doesn't rewrite anything |
| **Resume.io** | Helps you build a new resume | Doesn't tailor to a specific JD |
| **Rezi** | AI resume builder | Starts from scratch, not from your existing resume |
| **ChatGPT (manual)** | Can help with edits | No structured workflow, no ATS scoring, no session history |
| **Zofu** | Reads your resume, understands the JD, rewrites it, scores it, preps you for the interview, and exports it | — |

**Key Differentiators:**
1. **Full workflow** — not just scoring or building, but the entire journey
2. **Works from existing resumes** — no need to start over
3. **African-market pricing** — designed to be accessible in Nigeria and across Africa
4. **Privacy-first** — data is not sold or shared, sessions are deletable
5. **Interview intelligence** — unique combination of resume optimization + interview prep in one product

---

## Product Roadmap

### Shipped (Current — v1.3.0)
- [x] Core AI resume optimization with streaming
- [x] ATS scoring (0–100)
- [x] Keyword analysis (found / added / missing)
- [x] AI Cover Letter generation
- [x] Interview Prep (behavioral + technical questions)
- [x] PDF & DOCX export with 4 professional templates
- [x] Session history with Supabase persistence
- [x] AI Coach (conversational career advisor)
- [x] PDF upload in AI Coach for direct resume feedback
- [x] Pro feature gating (Cover Letter)
- [x] Mobile-responsive UI with swipe gestures
- [x] Dark mode support
- [x] What's New modal for version updates

### Coming Soon
- [ ] Stripe / Paystack payment integration (Pro & Team plans)
- [ ] LinkedIn profile import
- [ ] Bulk resume optimization for career coaches
- [ ] Resume score history tracking across versions
- [ ] Job description auto-fetch from a URL
- [ ] Job board integrations (tracking applied jobs)
- [ ] Multi-language support (French for Francophone Africa)
- [ ] Mobile app (React Native)

---

## Why Partner With Us?

- **Market Timing:** The African tech job market is growing rapidly, with millions of professionals competing for fewer opportunities. Resume quality is a critical differentiator.
- **Proven Demand:** 500+ optimizations completed organically, with zero paid marketing.
- **Technical Foundation:** Built on production-grade infrastructure (Next.js, Supabase, Vercel, Google Gemini) with a clean, scalable codebase.
- **Clear Monetization Path:** Paid plans are architected and ready — we're one Paystack integration away from recurring revenue.
- **Defensible Product:** The combination of ATS optimization + interview prep + AI coaching in one seamless session creates real switching costs for users.
- **Founder-Led:** Built by someone deeply familiar with the pain of job searching in Africa's tech ecosystem.

---

## Contact

**Product:** Zofu — AI Resume Optimizer
**Website:** [https://zofu.app](https://zofu.app)
**Current Version:** v1.3.0

---

*© 2026 ZOFU. All rights reserved. This document is confidential and intended for prospective investors and partners only.*
