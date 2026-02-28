"use client";

import { useState, useCallback, useEffect } from "react";

export interface SessionData {
    id: string;
    title: string;
    timestamp: number;
    resumeText: string;
    resumeFileName: string;
    jobDescription: string;
    amplifiedText: string;
    atsScore: number | null;
    keywords: {
        found: string[];
        missing: string[];
        added: string[];
    } | null;
    changes: {
        section: string;
        original: string;
        amplified: string;
        reason: string;
    }[];
}

const BASE_STORAGE_KEY = "jobamplify_sessions";

function generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractTitle(jd: string): string {
    // Try to extract a job title from the first meaningful line
    const lines = jd.trim().split("\n").filter(Boolean);
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        return firstLine.length > 50 ? firstLine.slice(0, 47) + "..." : firstLine;
    }
    return "Untitled Session";
}

export function useSessionHistory() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch active user to namespace storage tightly
    useEffect(() => {
        async function fetchUser() {
            try {
                const { createClient } = await import('@/utils/supabase/client');
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user?.id) {
                    setUserId(session.user.id);
                }
            } catch (err) {
                console.error("Failed to fetch user session", err);
            } finally {
                setIsInitialized(true);
            }
        }
        fetchUser();
    }, []);

    const storageKey = userId ? `${BASE_STORAGE_KEY}_${userId}` : null;

    // Load sessions from localStorage only after user is known
    useEffect(() => {
        if (!isInitialized || !storageKey) return;

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                setSessions(JSON.parse(stored));
            }
            // Explicitly force a fresh dashboard on initial load
            setActiveSessionId(null);
        } catch {
            // Ignore parse errors
        }
    }, [isInitialized, storageKey]);

    // Persist sessions to user-specific localStorage key
    const persist = useCallback((updated: SessionData[]) => {
        if (!storageKey) return;

        setSessions(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
            // Storage full, ignore
        }
    }, [storageKey]);

    const saveSession = useCallback(
        (data: Omit<SessionData, "id" | "title" | "timestamp">): string => {
            const id = activeSessionId || generateId();
            const session: SessionData = {
                ...data,
                id,
                title: extractTitle(data.jobDescription),
                timestamp: Date.now(),
            };

            const updated = [
                session,
                ...sessions.filter((s) => s.id !== id),
            ].slice(0, 20); // Keep max 20 sessions

            persist(updated);
            setActiveSessionId(id);
            return id;
        },
        [sessions, activeSessionId, persist]
    );

    const loadSession = useCallback(
        (id: string): SessionData | null => {
            const session = sessions.find((s) => s.id === id) || null;
            if (session) setActiveSessionId(id);
            return session;
        },
        [sessions]
    );

    const deleteSession = useCallback(
        (id: string) => {
            const updated = sessions.filter((s) => s.id !== id);
            persist(updated);
            if (activeSessionId === id) setActiveSessionId(null);
        },
        [sessions, activeSessionId, persist]
    );

    const newSession = useCallback(() => {
        setActiveSessionId(null);
    }, []);

    return {
        sessions,
        activeSessionId,
        saveSession,
        loadSession,
        deleteSession,
        newSession,
    };
}
