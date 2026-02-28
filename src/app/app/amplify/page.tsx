"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon } from "hugeicons-react";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import JDInput from "@/components/JDInput";
import AmplifyButton from "@/components/AmplifyButton";
import StepIndicator from "@/components/StepIndicator";
import ResumePreview from "@/components/ResumePreview";
import ATSScoreCard from "@/components/ATSScoreCard";
import KeywordChecklist from "@/components/KeywordChecklist";
import InterviewPrep from "@/components/InterviewPrep";
import { useSessionHistory } from "@/hooks/useSessionHistory";

interface Keywords {
  found: string[];
  missing: string[];
  added: string[];
}

interface Change {
  section: string;
  original: string;
  amplified: string;
  reason: string;
}

interface InterviewQuestion {
  question: string;
  context: string;
  suggestedPoints: string[];
}

function SessionLoader({ onLoad, onReset }: { onLoad: (id: string) => void, onReset: () => void }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  useEffect(() => {
    if (sessionId) {
      onLoad(sessionId);
    } else {
      onReset();
    }
  }, [sessionId, onLoad, onReset]);

  return null;
}

export default function Home() {
  // Input state
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Processing state
  const [isAmplifying, setIsAmplifying] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [amplifiedText, setAmplifiedText] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<Keywords | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [behavioralQuestions, setBehavioralQuestions] = useState<
    InterviewQuestion[]
  >([]);
  const [technicalQuestions, setTechnicalQuestions] = useState<
    InterviewQuestion[]
  >([]);

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Custom hooks
  const {
    sessions,
    activeSessionId,
    saveSession,
    loadSession,
    deleteSession,
    newSession,
  } = useSessionHistory();

  const handleSignOut = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  // Derived state
  const hasResume = resumeText.length > 0;
  const hasJD = jobDescription.length > 0;
  const canAmplify = hasResume && hasJD && !isAmplifying;
  const hasResults = amplifiedText.length > 0;

  const currentStep = !hasResume ? 0 : !hasJD ? 1 : !hasResults ? 2 : 3;

  const resetAll = useCallback(() => {
    setResumeText("");
    setResumeFileName("");
    setJobDescription("");
    setAmplifiedText("");
    setAtsScore(null);
    setKeywords(null);
    setChanges([]);
    setBehavioralQuestions([]);
    setTechnicalQuestions([]);
    setError(null);
  }, []);

  const handleNewSession = useCallback(() => {
    // Only reset if we're not loading from a parameter (which handles its own flow)
    resetAll();
    newSession();
    setSidebarOpen(false);
  }, [resetAll, newSession]);

  const handleLoadSession = useCallback(
    (id: string) => {
      const session = loadSession(id);
      if (session) {
        setResumeText(session.resumeText);
        setResumeFileName(session.resumeFileName);
        setJobDescription(session.jobDescription);
        setAmplifiedText(session.amplifiedText);
        setAtsScore(session.atsScore);
        setKeywords(session.keywords);
        setChanges(session.changes);
        setBehavioralQuestions([]);
        setTechnicalQuestions([]);
        setError(null);
        setSidebarOpen(false);
      }
    },
    [loadSession]
  );

  const handleFileProcessed = useCallback(
    (text: string, fileName: string) => {
      setResumeText(text);
      setResumeFileName(fileName);
      if (!text) {
        setAmplifiedText("");
        setAtsScore(null);
        setKeywords(null);
        setChanges([]);
        setBehavioralQuestions([]);
        setTechnicalQuestions([]);
      }
    },
    []
  );

  const handleAmplify = async () => {
    if (!canAmplify) return;

    setIsAmplifying(true);
    setError(null);

    try {
      const response = await fetch("/api/amplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Amplification failed");
      }

      setAmplifiedText(data.amplifiedResume || "");
      setAtsScore(data.atsScore ?? null);
      setKeywords(data.keywords || null);
      setChanges(data.changes || []);

      // Auto-save session
      const newSessionId = saveSession({
        resumeText,
        resumeFileName,
        jobDescription,
        amplifiedText: data.amplifiedResume || "",
        atsScore: data.atsScore ?? null,
        keywords: data.keywords || null,
        changes: data.changes || [],
      });

      // Update the URL without triggering a page reload so we stay on the results
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("session", newSessionId);
      window.history.replaceState({}, "", currentUrl.toString());

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAmplifying(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!hasResults) return;

    setIsGeneratingQuestions(true);

    try {
      const response = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate");
      }

      setBehavioralQuestions(data.behavioral || []);
      setTechnicalQuestions(data.technical || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Suspense fallback={null}>
        <SessionLoader onLoad={handleLoadSession} onReset={resetAll} />
      </Suspense>

      {/* Sidebar (Fixed width 280px via its own classes) */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={deleteSession}
        resumeContext={resumeText}
        jobContext={jobDescription}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Main workspace - offset by the fixed sidebar width on desktop */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">

        {/* Mobile Header Navigation */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
          {/* Left: Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5 text-foreground transition-colors"
            aria-label="Open sidebar"
          >
            <div className="flex flex-col gap-1.5 items-center justify-center w-5">
              <span className="h-0.5 w-full bg-foreground rounded-full"></span>
              <span className="h-0.5 w-full bg-foreground rounded-full"></span>
              <span className="h-0.5 w-3/4 self-start bg-foreground rounded-full"></span>
            </div>
          </button>

          {/* Center: Logo */}
          <Link href="/app" className="flex items-center">
            <img src="/zofu-logo.png" alt="Zofu Logo" className="h-6 w-auto object-contain" />
          </Link>

          {/* Right: Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-danger hover:bg-danger/10 transition-colors"
            aria-label="Sign Out"
          >
            <svg className="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
            <div className="flex flex-col gap-6">
              {/* Step Indicator (Only visible on main dashboard) */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center bg-white/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm"
              >
                <StepIndicator currentStep={currentStep} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12"
              >
                {/* Left Pane — Input */}
                <div className="lg:col-span-3 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-5"
                  >
                    <FileUpload
                      onFileProcessed={handleFileProcessed}
                      isProcessing={isAmplifying}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-5"
                  >
                    <JDInput
                      value={jobDescription}
                      onChange={(v) => {
                        setJobDescription(v);
                        if (hasResults) {
                          setAmplifiedText("");
                          setAtsScore(null);
                          setKeywords(null);
                          setChanges([]);
                        }
                      }}
                      disabled={isAmplifying}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-3"
                  >
                    <AmplifyButton
                      onClick={handleAmplify}
                      disabled={!canAmplify}
                      isLoading={isAmplifying}
                    />

                    {/* Only show "New Session" if there's an active session or a resume uploaded */}
                    {(activeSessionId || hasResume) && (
                      <button
                        onClick={handleNewSession}
                        disabled={isAmplifying}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-surface-sunken hover:border-border/80 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <svg className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Start New Session
                      </button>
                    )}
                  </motion.div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-danger/20 bg-danger-light/50 p-4"
                    >
                      <p className="text-xs font-medium text-danger">{error}</p>
                    </motion.div>
                  )}
                </div>

                {/* Middle Pane — Resume Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-6 min-h-[600px]"
                >
                  <ResumePreview
                    originalText={resumeText}
                    amplifiedText={amplifiedText}
                    changes={changes}
                    isLoading={isAmplifying}
                  />
                </motion.div>

                {/* Right Pane — Analysis Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ATSScoreCard score={atsScore} isLoading={isAmplifying} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <KeywordChecklist keywords={keywords} isLoading={isAmplifying} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <InterviewPrep
                      behavioral={behavioralQuestions}
                      technical={technicalQuestions}
                      isLoading={isAmplifying}
                      onGenerate={handleGenerateQuestions}
                      canGenerate={hasResults}
                      isGenerating={isGeneratingQuestions}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Footer info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-xs text-muted-light">
                Zofu amplifies your existing experience — it never fabricates
                skills or achievements.
              </p>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Sign Out</h3>
                <p className="text-sm text-muted">
                  Are you sure you want to sign out of Zofu? You will need to sign back in to access your workspace.
                </p>
              </div>

              <div className="p-4 bg-surface-sunken border-t border-border flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 flex items-center gap-2 text-sm font-semibold rounded-lg bg-danger text-white hover:bg-danger-hover transition-colors shadow-sm"
                >
                  <Logout01Icon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
