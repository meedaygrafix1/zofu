"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FlashIcon,
    Home01Icon,
    SparklesIcon,
    File01Icon,
    Menu01Icon,
    Cancel01Icon,
    Search01Icon,
    CheckmarkBadge01Icon,
    Logout01Icon,
    Delete02Icon,
    UserIcon,
    CreditCardIcon,
    Gif01Icon,
} from "hugeicons-react";
import { SessionData } from "@/hooks/useSessionHistory";
import { useProStatus } from "@/hooks/useProStatus";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WhatsNewModal, { useWhatsNew } from "@/components/WhatsNewModal";
import Logo from "@/components/Logo";

interface SidebarProps {
    sessions: SessionData[];
    activeSessionId: string | null;
    onNewSession: () => void;
    onLoadSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    resumeContext?: string;
    jobContext?: string;
    isOpen: boolean;
    onToggle: () => void;
    onLogoutClick: () => void;
}

interface SwipeableSessionItemProps {
    session: SessionData;
    activeSessionId: string | null;
    isOptimizerPath: boolean;
    onToggle: () => void;
    onDeleteSession: (id: string) => void;
}

function SwipeableSessionItem({ session, activeSessionId, isOptimizerPath, onToggle, onDeleteSession }: SwipeableSessionItemProps) {
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    return (
        <div className="relative group/session overflow-hidden">
            {/* Delete Background (Revealed on swipe) */}
            <div className="absolute inset-y-0 right-0 w-16 bg-danger/10 text-danger flex items-center justify-center rounded-r-lg">
                <Delete02Icon className="h-5 w-5" strokeWidth={2} />
            </div>

            {/* Swipeable Container */}
            <motion.div
                drag={isTouchDevice ? "x" : false}
                dragConstraints={{ left: -64, right: 0 }}
                dragElastic={0.1}
                whileDrag={{ scale: 0.98 }}
                onDragEnd={(e, info) => {
                    if (info.offset.x < -40) {
                        onDeleteSession(session.id);
                    }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors relative z-10 bg-surface-sunken ${session.id === activeSessionId && isOptimizerPath ? 'bg-border text-foreground font-semibold' : 'text-muted hover:bg-border/60 hover:text-foreground font-medium'} pr-8 md:pr-3 md:group-hover/session:pr-8`}
            >
                <Link
                    href={`/app/amplify?session=${session.id}`}
                    onClick={() => {
                        if (window.innerWidth < 1024) onToggle();
                    }}
                    className="flex-1 flex items-center gap-3 min-w-0 pr-2"
                >
                    <File01Icon className={`h-4.5 w-4.5 shrink-0 ${session.id === activeSessionId && isOptimizerPath ? 'text-foreground' : 'text-muted'}`} />
                    <span className="truncate">{session.title}</span>
                </Link>

                <div className={`flex items-center gap-2 shrink-0 md:group-hover/session:hidden ${session.atsScore !== null ? '' : ''}`}>
                    {session.atsScore !== null && (
                        <div className="flex items-center justify-center h-5 px-1.5 bg-foreground rounded-full text-[10px] font-bold text-background shadow-sm">
                            {session.atsScore}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Desktop Delete Button (Hover) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteSession(session.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:group-hover/session:flex items-center justify-center h-6 w-6 rounded hover:bg-danger/10 text-muted-light hover:text-danger z-20 transition-colors cursor-pointer"
                title="Delete session"
                aria-label="Delete session"
            >
                <Delete02Icon className="h-4 w-4" strokeWidth={2} />
            </button>
        </div>
    );
}

export default function Sidebar({
    sessions,
    activeSessionId,
    onNewSession,
    onLoadSession,
    onDeleteSession,
    isOpen,
    onToggle,
    onLogoutClick,
}: SidebarProps) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const { isPro } = useProStatus();
    const { isOpen: isWhatsNewOpen, open: openWhatsNew, close: closeWhatsNew } = useWhatsNew();

    const isOverviewPath = pathname === "/app";
    const isOptimizerPath = pathname?.startsWith("/app/amplify");
    const isCoachPath = pathname?.startsWith("/app/coach");
    const isProfilePath = pathname?.startsWith("/app/profile");
    const isBillingPath = pathname?.startsWith("/app/billing");

    const handleNewSessionClick = () => {
        onNewSession();
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    const handleLoadSessionClick = (id: string) => {
        onLoadSession(id);
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={onToggle}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            {/* The sidebar is now fixed to the left permanently on large screens. */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-surface-sunken border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Workspace Switcher */}
                <div className="p-4 pt-6 lg:pt-4">
                    <div className="flex items-center p-2 pl-3 bg-transparent rounded-xl">
                        <Link href="/app" className="flex items-center block">
                            <Logo className="h-7 w-auto" alt="Zofu Logo" />
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 pb-5">
                    <div className="relative flex items-center">
                        <Search01Icon className="absolute left-3 h-4 w-4 text-muted-light" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-elevated/60 dark:bg-border/40 text-sm text-foreground font-medium rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-border transition-all placeholder:text-muted-light placeholder:font-normal border border-border/60"
                        />
                        <kbd className="absolute right-3 text-[10px] font-bold text-muted bg-surface-elevated border border-border px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">

                    {/* Workspace Category */}
                    <div className="mb-6">
                        <div className="px-3 mb-2 text-[11px] font-bold text-muted-light tracking-wider uppercase">Workspace</div>
                        <div className="space-y-1">
                            <Link href="/app"
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isOverviewPath ? 'bg-foreground/10 dark:bg-foreground/15 text-foreground font-semibold' : 'text-muted hover:bg-foreground/5 hover:text-foreground font-medium'}`}
                            >
                                <Home01Icon className={`h-4.5 w-4.5 ${isOverviewPath ? 'text-foreground' : 'text-muted-light'}`} />
                                Overview
                            </Link>

                            <Link
                                href="/app/amplify"
                                onClick={() => {
                                    if (window.innerWidth < 1024) onToggle();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isOptimizerPath ? 'bg-foreground/10 dark:bg-foreground/15 text-foreground font-semibold' : 'text-muted hover:bg-foreground/5 hover:text-foreground font-medium'}`}
                            >
                                <SparklesIcon className={`h-4.5 w-4.5 ${isOptimizerPath ? 'text-foreground' : 'text-muted-light'}`} />
                                Optimizer
                            </Link>

                            <Link
                                href="/app/coach"
                                onClick={() => {
                                    if (window.innerWidth < 1024) onToggle();
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isCoachPath ? 'bg-foreground/10 dark:bg-foreground/15 text-foreground font-semibold' : 'text-muted hover:bg-foreground/5 hover:text-foreground font-medium'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FlashIcon className={`h-4.5 w-4.5 ${isCoachPath ? 'text-foreground' : 'text-muted-light'}`} />
                                    AI Coach
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* History Category */}
                    <div>
                        <div className="px-3 mb-2 text-[11px] font-bold text-muted-light tracking-wider uppercase">Sessions</div>
                        <div className="space-y-1">
                            {filteredSessions.length === 0 ? (
                                <p className="text-[12px] text-muted-light px-3 py-2">
                                    {searchQuery ? "No sessions match your search." : "No saved sessions."}
                                </p>
                            ) : (
                                (searchQuery ? filteredSessions : filteredSessions.slice(0, 3)).map((session) => (
                                    <SwipeableSessionItem
                                        key={session.id}
                                        session={session}
                                        activeSessionId={activeSessionId}
                                        isOptimizerPath={isOptimizerPath!}
                                        onToggle={onToggle}
                                        onDeleteSession={onDeleteSession}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Category */}
                <div className="px-4 pb-4">
                    <div className="px-3 mb-2 text-[11px] font-bold text-muted-light tracking-wider uppercase">Settings</div>
                    <div className="space-y-1">
                        <Link
                            href="/app/profile"
                            onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isProfilePath ? 'bg-foreground/10 dark:bg-foreground/15 text-foreground font-semibold' : 'text-muted hover:bg-foreground/5 hover:text-foreground font-medium'}`}
                        >
                            <UserIcon className={`h-4.5 w-4.5 ${isProfilePath ? 'text-foreground' : 'text-muted-light'}`} />
                            Profile
                        </Link>

                        <Link
                            href="/app/billing"
                            onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${isBillingPath ? 'bg-foreground/10 dark:bg-foreground/15 text-foreground font-semibold' : 'text-muted hover:bg-foreground/5 hover:text-foreground font-medium'}`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCardIcon className={`h-4.5 w-4.5 ${isBillingPath ? 'text-foreground' : 'text-muted-light'}`} />
                                Billing
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-warning-light text-warning border border-warning/20">
                                Soon
                            </span>
                        </Link>

                        {/* What's New */}
                        <button
                            id="whats-new-sidebar-btn"
                            onClick={openWhatsNew}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted hover:bg-foreground/5 hover:text-foreground font-medium transition-all duration-150 group"
                        >
                            <div className="flex items-center gap-3">
                                <Gif01Icon className="h-4.5 w-4.5 text-muted-light group-hover:text-foreground transition-colors" />
                                What&apos;s New
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
                                New
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pro Upsell Banner (free users only) */}
                {!isPro && (
                    <div className="px-4 pb-3">
                        <a
                            href="/app/billing"
                            className="flex flex-col gap-1 w-full rounded-xl bg-gradient-to-br from-foreground to-foreground/80 p-3.5 text-white group hover:opacity-95 transition-opacity"
                        >
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                                    <SparklesIcon className="h-3.5 w-3.5" />
                                    Pro Plan
                                </span>
                                <span className="text-[10px] font-bold bg-white/15 px-1.5 py-0.5 rounded-full">Coming Soon</span>
                            </div>
                            <p className="text-[12px] font-semibold leading-snug">Unlock AI Cover Letters &amp; more</p>
                            <p className="text-[11px] text-white/60 mt-0.5">₦2,000/mo · Unlimited optimizations</p>
                        </a>
                    </div>
                )}

                {/* Footer - Sign Out */}
                <div className="p-4 border-t border-[#e5e7eb] dark:border-white/10">
                    <button
                        onClick={onLogoutClick}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                    >
                        <Logout01Icon className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* What's New Modal */}
            <WhatsNewModal isOpen={isWhatsNewOpen} onClose={closeWhatsNew} />
        </>
    );
}
