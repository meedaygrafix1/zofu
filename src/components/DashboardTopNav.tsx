"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    Notification01Icon,
    SparklesIcon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    Cancel01Icon,
} from "hugeicons-react";

interface Notification {
    id: string;
    type: "info" | "success" | "update";
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "n1",
        type: "success",
        title: "Resume Parsed Successfully",
        body: "Your resume was extracted and is ready to use in the Optimizer.",
        time: "Just now",
        read: false,
    },
    {
        id: "n2",
        type: "update",
        title: "AI Coach Upgraded",
        body: "Upload PDF resumes directly into the AI Coach for instant analysis.",
        time: "2 hours ago",
        read: false,
    },
    {
        id: "n3",
        type: "info",
        title: "Pro Plan Coming Soon",
        body: "Unlimited optimizations, AI Cover Letters & more launching soon.",
        time: "Yesterday",
        read: true,
    },
];

const TYPE_STYLES = {
    success: {
        icon: CheckmarkCircle02Icon,
        bg: "bg-success/10",
        color: "text-success",
    },
    update: {
        icon: SparklesIcon,
        bg: "bg-primary/10",
        color: "text-primary",
    },
    info: {
        icon: InformationCircleIcon,
        bg: "bg-muted/10",
        color: "text-muted",
    },
};

export default function DashboardTopNav() {
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const panelRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                bellRef.current &&
                !bellRef.current.contains(e.target as Node)
            ) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const dismissNotif = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <header className="
            sticky top-0 z-30 h-14
            flex items-center justify-end gap-2 px-4 lg:px-6
            bg-background/80 backdrop-blur-md
            border-b border-border
            lg:ml-[280px]
            transition-colors duration-200
        ">
            {/* Dark mode toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <div className="relative">
                <button
                    ref={bellRef}
                    id="dashboard-notifications-btn"
                    onClick={() => setNotifOpen((v) => !v)}
                    className="
                        relative w-9 h-9 flex items-center justify-center
                        rounded-full bg-surface-sunken hover:bg-border
                        text-foreground transition-colors
                    "
                    aria-label="Notifications"
                >
                    <Notification01Icon size={18} />
                    {unreadCount > 0 && (
                        <span className="
                            absolute -top-0.5 -right-0.5
                            h-4 w-4 flex items-center justify-center
                            text-[10px] font-bold text-white
                            bg-primary rounded-full
                            ring-2 ring-background
                        ">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Notification panel */}
                <AnimatePresence>
                    {notifOpen && (
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="
                                absolute right-0 top-11 w-[340px]
                                bg-surface-elevated border border-border
                                rounded-2xl shadow-xl shadow-black/10
                                dark:shadow-black/40 overflow-hidden
                            "
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-foreground">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="
                                            h-5 px-1.5 flex items-center justify-center
                                            text-[10px] font-bold text-white
                                            bg-primary rounded-full
                                        ">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Notification list */}
                            <div className="max-h-[360px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center mb-3">
                                            <Notification01Icon size={18} className="text-muted" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">All caught up!</p>
                                        <p className="text-xs text-muted mt-1">No new notifications right now.</p>
                                    </div>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {notifications.map((notif) => {
                                            const style = TYPE_STYLES[notif.type];
                                            const Icon = style.icon;
                                            return (
                                                <motion.div
                                                    key={notif.id}
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`
                                                        group relative flex gap-3 px-4 py-3.5
                                                        border-b border-border/60 last:border-b-0
                                                        hover:bg-surface-sunken transition-colors
                                                        ${!notif.read ? "bg-primary/[0.02]" : ""}
                                                    `}
                                                >
                                                    {/* Unread dot */}
                                                    {!notif.read && (
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                                    )}

                                                    {/* Icon */}
                                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
                                                        <Icon size={15} className={style.color} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground leading-tight">{notif.title}</p>
                                                        <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-snug">{notif.body}</p>
                                                        <p className="text-[11px] text-muted-light mt-1">{notif.time}</p>
                                                    </div>

                                                    {/* Dismiss */}
                                                    <button
                                                        onClick={() => dismissNotif(notif.id)}
                                                        className="
                                                            opacity-0 group-hover:opacity-100 transition-opacity
                                                            shrink-0 w-5 h-5 flex items-center justify-center
                                                            rounded hover:bg-border text-muted hover:text-foreground
                                                        "
                                                        aria-label="Dismiss"
                                                    >
                                                        <Cancel01Icon size={12} />
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Panel footer */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2.5 border-t border-border">
                                    <button
                                        onClick={() => setNotifications([])}
                                        className="text-xs text-muted hover:text-foreground transition-colors font-medium"
                                    >
                                        Clear all notifications
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
