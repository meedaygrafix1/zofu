"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationType = "info" | "success" | "update" | "error";

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    addNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;
    markAllRead: () => void;
    dismissNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return "Yesterday";
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const addNotification = useCallback(
        (n: Omit<AppNotification, "id" | "time" | "read">) => {
            const now = new Date();
            const id = `notif-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`;
            const newNotif: AppNotification = {
                ...n,
                id,
                time: formatTime(now),
                read: false,
            };
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20)); // cap at 20
        },
        []
    );

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, markAllRead, dismissNotification, clearAll }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
    return ctx;
}
