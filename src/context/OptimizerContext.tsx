"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
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

interface OptimizerContextType {
    resumeText: string;
    setResumeText: (text: string) => void;
    resumeFileName: string;
    setResumeFileName: (name: string) => void;
    jobDescription: string;
    setJobDescription: (text: string) => void;

    coverLetter: string;
    setCoverLetter: (text: string) => void;

    isAmplifying: boolean;
    isGeneratingQuestions: boolean;
    error: string | null;
    setError: (error: string | null) => void;

    amplifiedText: string;
    setAmplifiedText: (text: string) => void;
    atsScore: number | null;
    setAtsScore: (score: number | null) => void;
    keywords: Keywords | null;
    setKeywords: (k: Keywords | null) => void;
    changes: Change[];
    setChanges: (changes: Change[]) => void;
    behavioralQuestions: InterviewQuestion[];
    technicalQuestions: InterviewQuestion[];

    hasResume: boolean;
    hasJD: boolean;
    canAmplify: boolean;
    hasResults: boolean;
    currentStep: number;

    resetAll: () => void;
    handleFileProcessed: (text: string, fileName: string) => void;
    handleAmplify: () => Promise<void>;
    handleGenerateQuestions: () => Promise<void>;

    handleNewSession: () => void;
    handleLoadSession: (id: string) => void;
    sessions: any[];
    activeSessionId: string | null;
    deleteSession: (id: string) => void;
}

const OptimizerContext = createContext<OptimizerContextType | undefined>(undefined);

export function OptimizerProvider({ children }: { children: ReactNode }) {
    const [resumeText, setResumeText] = useState("");
    const [resumeFileName, setResumeFileName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [coverLetter, setCoverLetter] = useState("");

    const [isAmplifying, setIsAmplifying] = useState(false);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [amplifiedText, setAmplifiedText] = useState("");
    const [atsScore, setAtsScore] = useState<number | null>(null);
    const [keywords, setKeywords] = useState<Keywords | null>(null);
    const [changes, setChanges] = useState<Change[]>([]);
    const [behavioralQuestions, setBehavioralQuestions] = useState<InterviewQuestion[]>([]);
    const [technicalQuestions, setTechnicalQuestions] = useState<InterviewQuestion[]>([]);

    const {
        sessions,
        activeSessionId,
        saveSession,
        loadSession,
        deleteSession,
        newSession,
    } = useSessionHistory();

    const hasResume = resumeText.length > 0;
    const hasJD = jobDescription.length > 0;
    const canAmplify = hasResume && hasJD && !isAmplifying;
    const hasResults = amplifiedText.length > 0 || coverLetter.length > 0;
    const currentStep = !hasResume ? 0 : !hasJD ? 1 : !hasResults ? 2 : 3;

    const resetAll = useCallback(() => {
        setResumeText("");
        setResumeFileName("");
        setJobDescription("");
        setCoverLetter("");
        setAmplifiedText("");
        setAtsScore(null);
        setKeywords(null);
        setChanges([]);
        setBehavioralQuestions([]);
        setTechnicalQuestions([]);
        setError(null);
    }, []);

    const handleNewSession = useCallback(() => {
        resetAll();
        newSession();
    }, [resetAll, newSession]);

    const handleLoadSession = useCallback(
        (id: string) => {
            const session = loadSession(id);
            if (session) {
                setResumeText(session.resumeText);
                setResumeFileName(session.resumeFileName);
                setJobDescription(session.jobDescription);
                setCoverLetter(session.coverLetter || "");
                setAmplifiedText(session.amplifiedText);
                setAtsScore(session.atsScore);
                setKeywords(session.keywords);
                setChanges(session.changes);
                setBehavioralQuestions([]);
                setTechnicalQuestions([]);
                setError(null);
            }
        },
        [loadSession]
    );

    const handleFileProcessed = useCallback(
        (text: string, fileName: string) => {
            setResumeText(text);
            setResumeFileName(fileName);
            if (!text) {
                setCoverLetter("");
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

            setCoverLetter(data.coverLetter || "");
            setAmplifiedText(data.amplifiedResume || "");
            setAtsScore(data.atsScore ?? null);
            setKeywords(data.keywords || null);
            setChanges(data.changes || []);

            const newSessionId = await saveSession({
                resumeText,
                resumeFileName,
                jobDescription,
                coverLetter: data.coverLetter || "",
                amplifiedText: data.amplifiedResume || "",
                atsScore: data.atsScore ?? null,
                keywords: data.keywords || null,
                changes: data.changes || [],
            });

            // Only replace state if we are still on the amplify page
            if (window.location.pathname.includes('/app/amplify')) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("session", newSessionId);
                window.history.replaceState({}, "", currentUrl.toString());
            }

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
        <OptimizerContext.Provider value={{
            resumeText, setResumeText,
            resumeFileName, setResumeFileName,
            jobDescription, setJobDescription,
            coverLetter, setCoverLetter,
            isAmplifying, isGeneratingQuestions,
            error, setError,
            amplifiedText, setAmplifiedText,
            atsScore, setAtsScore,
            keywords, setKeywords,
            changes, setChanges,
            behavioralQuestions, technicalQuestions,
            hasResume, hasJD, canAmplify, hasResults, currentStep,
            resetAll, handleFileProcessed, handleAmplify, handleGenerateQuestions,
            handleNewSession, handleLoadSession,
            sessions, activeSessionId, deleteSession
        }}>
            {children}
        </OptimizerContext.Provider>
    );
}

export function useOptimizer() {
    const context = useContext(OptimizerContext);
    if (context === undefined) {
        throw new Error("useOptimizer must be used within an OptimizerProvider");
    }
    return context;
}
