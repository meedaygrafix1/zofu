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
} from "hugeicons-react";
import { SessionData } from "@/hooks/useSessionHistory";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors relative z-10 bg-[#f9fafb] ${session.id === activeSessionId && isOptimizerPath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'} pr-8 md:pr-3 md:group-hover/session:pr-8`}
            >
                <Link
                    href={`/app/amplify?session=${session.id}`}
                    onClick={() => {
                        if (window.innerWidth < 1024) onToggle();
                    }}
                    className="flex-1 flex items-center gap-3 min-w-0 pr-2"
                >
                    <File01Icon className={`h-4.5 w-4.5 shrink-0 ${session.id === activeSessionId && isOptimizerPath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                    <span className="truncate">{session.title}</span>
                </Link>

                <div className={`flex items-center gap-2 shrink-0 md:group-hover/session:hidden ${session.atsScore !== null ? '' : ''}`}>
                    {session.atsScore !== null && (
                        <div className="flex items-center justify-center h-5 px-1.5 bg-[#111827] rounded-full text-[10px] font-bold text-white shadow-sm">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:group-hover/session:flex items-center justify-center h-6 w-6 rounded hover:bg-danger/10 text-[#9ca3af] hover:text-danger z-20 transition-colors cursor-pointer"
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
            <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Workspace Switcher */}
                <div className="p-4 pt-6 lg:pt-4">
                    <div className="flex items-center p-2 pl-3 bg-transparent rounded-xl">
                        <Link href="/app" className="flex items-center block">
                            <img src="/zofu-logo.png" alt="Zofu Logo" className="h-7 w-auto object-contain" />
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 pb-5">
                    <div className="relative flex items-center">
                        <Search01Icon className="absolute left-3 h-4 w-4 text-[#9ca3af]" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f3f4f6] text-sm text-[#111827] font-medium rounded-xl pl-9 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-[#e5e7eb] transition-all placeholder:text-[#9ca3af] placeholder:font-normal"
                        />
                        <kbd className="absolute right-3 text-[10px] font-bold text-[#6b7280] bg-white border border-[#e5e7eb] px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">

                    {/* Workspace Category */}
                    <div className="mb-6">
                        <div className="px-3 mb-2 text-[11px] font-bold text-[#9ca3af]">Workspace</div>
                        <div className="space-y-1">
                            <Link href="/app"
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isOverviewPath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'}`}
                            >
                                <Home01Icon className={`h-4.5 w-4.5 ${isOverviewPath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                                Overview
                            </Link>

                            <Link
                                href="/app/amplify"
                                onClick={() => {
                                    if (window.innerWidth < 1024) onToggle();
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isOptimizerPath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'}`}
                            >
                                <SparklesIcon className={`h-4.5 w-4.5 ${isOptimizerPath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                                Optimizer
                            </Link>

                            <Link
                                href="/app/coach"
                                onClick={() => {
                                    if (window.innerWidth < 1024) onToggle();
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isCoachPath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FlashIcon className={`h-4.5 w-4.5 ${isCoachPath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                                    AI Coach
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* History Category */}
                    <div>
                        <div className="px-3 mb-2 text-[11px] font-bold text-[#9ca3af]">Sessions</div>
                        <div className="space-y-1">
                            {filteredSessions.length === 0 ? (
                                <p className="text-[12px] text-[#9ca3af] px-3 py-2">
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
                    <div className="px-3 mb-2 text-[11px] font-bold text-[#9ca3af]">Settings</div>
                    <div className="space-y-1">
                        <Link
                            href="/app/profile"
                            onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isProfilePath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'}`}
                        >
                            <UserIcon className={`h-4.5 w-4.5 ${isProfilePath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                            Profile
                        </Link>

                        <Link
                            href="/app/billing"
                            onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isBillingPath ? 'bg-[#e5e7eb] text-[#111827] font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827] font-medium'}`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCardIcon className={`h-4.5 w-4.5 ${isBillingPath ? 'text-[#111827]' : 'text-[#6b7280]'}`} />
                                Billing
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-warning-light text-warning border border-warning/20">
                                Soon
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Footer - Sign Out */}
                <div className="p-4 border-t border-[#e5e7eb]">
                    <button
                        onClick={onLogoutClick}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                    >
                        <Logout01Icon className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
