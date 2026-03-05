"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export interface SessionData {
    id: string;
    title: string;
    timestamp: number;
    resumeText: string;
    resumeFileName: string;
    jobDescription: string;
    coverLetter: string;
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

const BASE_STORAGE_KEY = "zofu_sessions";

function generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractTitle(jd: string): string {
    const lines = jd.trim().split("\n").filter(Boolean);
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        return firstLine.length > 50 ? firstLine.slice(0, 47) + "..." : firstLine;
    }
    return "Untitled Session";
}

// Convert a SessionData object to a Supabase row
function toRow(session: SessionData, userId: string) {
    return {
        id: session.id,
        user_id: userId,
        title: session.title,
        created_at: session.timestamp,
        resume_text: session.resumeText,
        resume_file_name: session.resumeFileName,
        job_description: session.jobDescription,
        cover_letter: session.coverLetter,
        amplified_text: session.amplifiedText,
        ats_score: session.atsScore,
        keywords: session.keywords,
        changes: session.changes,
    };
}

// Convert a Supabase row to a SessionData object
function fromRow(row: Record<string, unknown>): SessionData {
    return {
        id: row.id as string,
        title: row.title as string,
        timestamp: row.created_at as number,
        resumeText: row.resume_text as string,
        resumeFileName: row.resume_file_name as string,
        jobDescription: row.job_description as string,
        coverLetter: (row.cover_letter as string) || "",
        amplifiedText: row.amplified_text as string,
        atsScore: (row.ats_score as number) ?? null,
        keywords: (row.keywords as SessionData["keywords"]) ?? null,
        changes: (row.changes as SessionData["changes"]) ?? [],
    };
}

export function useSessionHistory() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const supabaseRef = useRef(createClient());

    // Fetch active user — use getUser() for server-verified identity
    useEffect(() => {
        async function fetchUser() {
            try {
                const supabase = supabaseRef.current;
                const { data: { user }, error } = await supabase.auth.getUser();
                if (user?.id && !error) {
                    setUserId(user.id);
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            } finally {
                setIsInitialized(true);
            }
        }
        fetchUser();
    }, []);

    const storageKey = userId ? `${BASE_STORAGE_KEY}_${userId}` : null;

    // Load sessions from Supabase (primary) with localStorage fallback
    useEffect(() => {
        if (!isInitialized || !userId || !storageKey) return;

        let cancelled = false;

        async function loadSessions() {
            const supabase = supabaseRef.current;
            const key = storageKey!;

            try {
                const { data, error } = await supabase
                    .from("sessions")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(20);

                if (!cancelled && data && !error) {
                    const loaded = data.map(fromRow);
                    setSessions(loaded);
                    // Update localStorage cache
                    try {
                        localStorage.setItem(key, JSON.stringify(loaded));
                    } catch { /* ignore */ }
                    return;
                }

                if (error) {
                    console.error("Failed to load sessions from Supabase, falling back to localStorage", error);
                }
            } catch (err) {
                console.error("Supabase fetch error, falling back to localStorage", err);
            }

            // Fallback: load from localStorage
            if (!cancelled) {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        setSessions(JSON.parse(stored));
                    }
                } catch { /* ignore */ }
            }
        }

        loadSessions();
        setActiveSessionId(null);

        return () => { cancelled = true; };
    }, [isInitialized, userId, storageKey]);

    // Persist to localStorage cache
    const persistLocal = useCallback((updated: SessionData[]) => {
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch { /* ignore */ }
    }, [storageKey]);

    const saveSession = useCallback(
        async (data: Omit<SessionData, "id" | "title" | "timestamp">): Promise<string> => {
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
            ].slice(0, 20);

            setSessions(updated);
            persistLocal(updated);
            setActiveSessionId(id);

            // Persist to Supabase
            if (userId) {
                try {
                    const supabase = supabaseRef.current;
                    const { error: upsertError } = await supabase
                        .from("sessions")
                        .upsert(toRow(session, userId), { onConflict: "id" });
                    if (upsertError) {
                        console.error("Failed to save session to Supabase:", upsertError.message);
                    }
                } catch (err) {
                    console.error("Failed to save session to Supabase", err);
                }
            }

            return id;
        },
        [sessions, activeSessionId, persistLocal, userId]
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
        async (id: string) => {
            const updated = sessions.filter((s) => s.id !== id);
            setSessions(updated);
            persistLocal(updated);
            if (activeSessionId === id) setActiveSessionId(null);

            // Delete from Supabase
            if (userId) {
                try {
                    const supabase = supabaseRef.current;
                    await supabase.from("sessions").delete().eq("id", id);
                } catch (err) {
                    console.error("Failed to delete session from Supabase", err);
                }
            }
        },
        [sessions, activeSessionId, persistLocal, userId]
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
