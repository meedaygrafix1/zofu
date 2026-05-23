"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES, getTemplate, type TemplateId, type ResumeTemplate } from "@/lib/resumeTemplates";

// ── Line classification helpers ───────────────────────────────────────────────

const isSectionHeader = (line: string): boolean => {
    const t = line.trim();
    if (!t) return false;
    if (/^[A-Z][A-Z &/|,\-:]{2,}$/.test(t)) return true;
    if (/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?|LANGUAGES?|INTERESTS?|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|TECHNICAL SKILLS|CORE COMPETENCIES|PROFESSIONAL SUMMARY|CAREER SUMMARY|VOLUNTEER|REFERENCES|PUBLICATIONS)$/i.test(t)) return true;
    return false;
};

const isBulletLine = (line: string): boolean => /^\s*[•\-\*▪◦–■❖→✓⬥]\s/.test(line);

const isContactLine = (line: string): boolean => {
    const t = line.trim();
    return /[@]/.test(t) ||
        /\b\d{3}[\s\-.)]{0,2}\d{3}[\s\-.)]{0,2}\d{4}\b/.test(t) ||
        /\b(linkedin|github|portfolio|www\.)\b/i.test(t) ||
        (/[|•·,]/.test(t) && t.length < 120 && /@/.test(t));
};

const isSubHeaderLine = (line: string, index: number): boolean => {
    const t = line.trim().replace(/\*\*(.+?)\*\*/g, '$1');
    if (index <= 3) return false;
    if (isBulletLine(line) || isSectionHeader(line)) return false;
    if (/\b(20\d{2}|19\d{2})\b/.test(t) && t.length < 100) return true;
    if (/^[A-Z][a-zA-Z\s&,.\-]+$/.test(t) && t.length < 60) return true;
    return false;
};

const stripBold = (text: string): string => text.replace(/\*\*(.+?)\*\*/g, '$1');

const toBoldHTML = (text: string): string =>
    text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const extractDateFromLine = (text: string): { title: string; date: string } => {
    const dateRegex = /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[–\-—]\s*(Present|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|\d{4}\s*[–\-—]\s*(Present|\d{4}))/i;
    const match = text.match(dateRegex);
    if (match) {
        const dateStr = match[0].trim();
        const rest = text.replace(match[0], '').replace(/\s*[|,–\-—]\s*$/, '').replace(/^\s*[|,–\-—]\s*/, '').trim();
        return { title: rest, date: dateStr };
    }
    return { title: text, date: '' };
};

// ── SVG Thumbnails ────────────────────────────────────────────────────────────

function ClassicThumbnail() {
    return (
        <svg viewBox="0 0 80 106" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
            <rect width="80" height="106" rx="3" fill="white" />
            <rect x="20" y="9" width="40" height="5" rx="1" fill="#1A365D" />
            <rect x="25" y="17" width="30" height="2.5" rx="0.5" fill="#94a3b8" />
            <line x1="6" y1="23" x2="74" y2="23" stroke="#1A365D" strokeWidth="1" />
            <rect x="6" y="27" width="28" height="3" rx="0.5" fill="#1A365D" />
            <line x1="6" y1="33" x2="74" y2="33" stroke="#1A365D" strokeWidth="0.4" />
            <rect x="6" y="37" width="36" height="2.5" rx="0.5" fill="#475569" />
            <circle cx="9" cy="44" r="1.2" fill="#94a3b8" />
            <rect x="13" y="42.5" width="42" height="2" rx="0.5" fill="#cbd5e1" />
            <circle cx="9" cy="50" r="1.2" fill="#94a3b8" />
            <rect x="13" y="48.5" width="34" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="57" width="22" height="3" rx="0.5" fill="#1A365D" />
            <line x1="6" y1="63" x2="74" y2="63" stroke="#1A365D" strokeWidth="0.4" />
            <rect x="6" y="67" width="32" height="2.5" rx="0.5" fill="#475569" />
            <rect x="6" y="73" width="50" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="80" width="18" height="3" rx="0.5" fill="#1A365D" />
            <line x1="6" y1="86" x2="74" y2="86" stroke="#1A365D" strokeWidth="0.4" />
            <rect x="6" y="90" width="60" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="95" width="50" height="2" rx="0.5" fill="#cbd5e1" />
        </svg>
    );
}

function ModernThumbnail() {
    return (
        <svg viewBox="0 0 80 106" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
            <rect width="80" height="106" rx="3" fill="white" />
            <rect x="6" y="9" width="48" height="5.5" rx="1" fill="#4F46E5" />
            <rect x="6" y="18" width="36" height="2.5" rx="0.5" fill="#94a3b8" />
            <rect x="6" y="25" width="3" height="14" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="27" width="26" height="3" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="34" width="38" height="2.5" rx="0.5" fill="#475569" />
            <circle cx="14" cy="41" r="1.2" fill="#94a3b8" />
            <rect x="18" y="39.5" width="38" height="2" rx="0.5" fill="#cbd5e1" />
            <circle cx="14" cy="47" r="1.2" fill="#94a3b8" />
            <rect x="18" y="45.5" width="30" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="54" width="3" height="14" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="56" width="22" height="3" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="63" width="34" height="2.5" rx="0.5" fill="#475569" />
            <circle cx="14" cy="70" r="1.2" fill="#94a3b8" />
            <rect x="18" y="68.5" width="36" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="76" width="3" height="10" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="78" width="18" height="3" rx="0.5" fill="#4F46E5" />
            <rect x="12" y="84" width="55" height="2" rx="0.5" fill="#cbd5e1" />
        </svg>
    );
}

function MinimalThumbnail() {
    return (
        <svg viewBox="0 0 80 106" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
            <rect width="80" height="106" rx="3" fill="#fafafa" />
            <rect x="18" y="11" width="44" height="4.5" rx="0.5" fill="#111" />
            <rect x="22" y="19" width="36" height="2" rx="0.5" fill="#bbb" />
            <line x1="10" y1="25" x2="70" y2="25" stroke="#ddd" strokeWidth="1" />
            <rect x="10" y="31" width="24" height="2.5" rx="0.5" fill="#333" />
            <circle cx="12" cy="39" r="1" fill="#bbb" />
            <rect x="16" y="37.5" width="44" height="2" rx="0.5" fill="#e0e0e0" />
            <circle cx="12" cy="46" r="1" fill="#bbb" />
            <rect x="16" y="44.5" width="36" height="2" rx="0.5" fill="#e0e0e0" />
            <line x1="10" y1="53" x2="70" y2="53" stroke="#ddd" strokeWidth="1" />
            <rect x="10" y="59" width="20" height="2.5" rx="0.5" fill="#333" />
            <rect x="10" y="66" width="32" height="2.5" rx="0.5" fill="#555" />
            <rect x="10" y="72" width="50" height="2" rx="0.5" fill="#e0e0e0" />
            <line x1="10" y1="79" x2="70" y2="79" stroke="#ddd" strokeWidth="1" />
            <rect x="10" y="85" width="16" height="2.5" rx="0.5" fill="#333" />
            <rect x="10" y="91" width="56" height="2" rx="0.5" fill="#e0e0e0" />
            <rect x="10" y="97" width="44" height="2" rx="0.5" fill="#e0e0e0" />
        </svg>
    );
}

function ExecutiveThumbnail() {
    return (
        <svg viewBox="0 0 80 106" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
            <rect width="80" height="106" rx="3" fill="white" />
            <rect x="15" y="9" width="50" height="5" rx="0.5" fill="#1C1C2E" />
            <line x1="6" y1="18" x2="74" y2="18" stroke="#1C1C2E" strokeWidth="1.5" />
            <rect x="20" y="22" width="40" height="2.5" rx="0.5" fill="#94a3b8" />
            <rect x="6" y="30" width="30" height="4" rx="0.5" fill="#1C1C2E" />
            <line x1="6" y1="37" x2="74" y2="37" stroke="#1C1C2E" strokeWidth="1.2" />
            <rect x="6" y="41" width="40" height="3" rx="0.5" fill="#334155" />
            <circle cx="9" cy="48.5" r="1.2" fill="#94a3b8" />
            <rect x="13" y="47" width="44" height="2" rx="0.5" fill="#cbd5e1" />
            <circle cx="9" cy="54.5" r="1.2" fill="#94a3b8" />
            <rect x="13" y="53" width="36" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="61" width="22" height="4" rx="0.5" fill="#1C1C2E" />
            <line x1="6" y1="68" x2="74" y2="68" stroke="#1C1C2E" strokeWidth="1.2" />
            <rect x="6" y="72" width="34" height="3" rx="0.5" fill="#334155" />
            <circle cx="9" cy="79.5" r="1.2" fill="#94a3b8" />
            <rect x="13" y="78" width="38" height="2" rx="0.5" fill="#cbd5e1" />
            <rect x="6" y="86" width="18" height="4" rx="0.5" fill="#1C1C2E" />
            <line x1="6" y1="93" x2="74" y2="93" stroke="#1C1C2E" strokeWidth="1.2" />
            <rect x="6" y="97" width="62" height="2" rx="0.5" fill="#cbd5e1" />
        </svg>
    );
}

const TEMPLATE_THUMBS: Record<TemplateId, () => React.ReactElement> = {
    classic: ClassicThumbnail,
    modern: ModernThumbnail,
    minimal: MinimalThumbnail,
    executive: ExecutiveThumbnail,
};

// ── Live HTML Resume Preview ──────────────────────────────────────────────────

function LiveResumePreview({ text, template }: { text: string; template: ResumeTemplate }) {
    const s = template.styles;
    const lines = text.split('\n');

    const renderLine = (rawLine: string, index: number): React.ReactNode => {
        const trimmed = rawLine.trim();

        // Name: first non-empty line(s) that are short and not contact/header
        const isNameLine = (
            (index === 0 ||
                (index <= 2 &&
                    lines.slice(0, index).every(l => !l.trim()) &&
                    !isContactLine(rawLine) &&
                    !isSectionHeader(rawLine) &&
                    !isBulletLine(rawLine) &&
                    trimmed.length < 60))
            && trimmed.length > 0
        );

        if (!trimmed) {
            return <div key={index} style={{ height: '5px' }} />;
        }

        if (isNameLine) {
            return (
                <div key={index} style={{
                    fontSize: s.nameFontSize,
                    color: s.nameColor,
                    textAlign: s.nameTextAlign,
                    fontWeight: '700',
                    letterSpacing: s.nameLetterSpacing,
                    fontFamily: s.fontFamily,
                    marginBottom: '4px',
                }}>
                    {stripBold(trimmed)}
                </div>
            );
        }

        if (isContactLine(rawLine) && index <= 5) {
            return (
                <div key={index} style={{
                    fontSize: s.contactFontSize,
                    color: s.contactColor,
                    textAlign: s.contactTextAlign,
                    fontFamily: s.fontFamily,
                    marginBottom: '2px',
                }}>
                    {stripBold(trimmed)}
                </div>
            );
        }

        if (isSectionHeader(rawLine)) {
            const sectionStyle: React.CSSProperties = {
                fontSize: s.sectionFontSize,
                color: s.sectionColor,
                fontWeight: s.sectionFontWeight,
                textTransform: s.sectionTextTransform,
                letterSpacing: s.sectionLetterSpacing,
                marginTop: s.sectionMarginTop,
                marginBottom: s.sectionMarginBottom,
                fontFamily: s.fontFamily,
                paddingLeft: s.sectionPaddingLeft,
                paddingBottom: s.sectionPaddingBottom,
                borderBottom: s.sectionBorderBottom,
                borderLeft: s.sectionBorderLeft,
            };
            return <div key={index} style={sectionStyle}>{trimmed}</div>;
        }

        if (isBulletLine(rawLine)) {
            const bulletContent = trimmed.replace(/^[•\-\*▪◦–■❖→✓⬥]\s*/, '');
            return (
                <div key={index} style={{
                    fontSize: s.bodyFontSize,
                    color: s.bodyColor,
                    fontFamily: s.fontFamily,
                    lineHeight: s.lineHeight,
                    paddingLeft: s.bulletIndent,
                    marginBottom: '1px',
                    display: 'flex',
                    gap: '4px',
                }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <span dangerouslySetInnerHTML={{ __html: toBoldHTML(bulletContent) }} />
                </div>
            );
        }

        if (isSubHeaderLine(rawLine, index)) {
            const { title, date } = extractDateFromLine(stripBold(trimmed));
            return (
                <div key={index} style={{
                    fontSize: s.subHeaderFontSize,
                    color: s.subHeaderColor,
                    fontWeight: s.subHeaderFontWeight,
                    fontFamily: s.fontFamily,
                    marginTop: '5px',
                    marginBottom: '2px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                }}>
                    <span dangerouslySetInnerHTML={{ __html: toBoldHTML(title || stripBold(trimmed)) }} />
                    {date && (
                        <span style={{ fontWeight: '400', color: '#999', flexShrink: 0, fontSize: '9.5px' }}>
                            {date}
                        </span>
                    )}
                </div>
            );
        }

        // Regular body text
        return (
            <div key={index} style={{
                fontSize: s.bodyFontSize,
                color: s.bodyColor,
                fontFamily: s.fontFamily,
                lineHeight: s.lineHeight,
                marginBottom: '2px',
            }}
                dangerouslySetInnerHTML={{ __html: toBoldHTML(trimmed) }}
            />
        );
    };

    return (
        <div style={{
            background: s.paperBackground,
            padding: '32px 36px',
            minHeight: '100%',
            fontFamily: s.fontFamily,
        }}>
            {lines.map((line, i) => renderLine(line, i))}
        </div>
    );
}

// ── Template Card ─────────────────────────────────────────────────────────────

function TemplateCard({
    template,
    isSelected,
    onSelect,
}: {
    template: ResumeTemplate;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const Thumb = TEMPLATE_THUMBS[template.id];
    return (
        <button
            onClick={onSelect}
            className={`
                relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden
                hover:shadow-md focus:outline-none
                ${isSelected
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/40 bg-surface-elevated'
                }
            `}
        >
            {/* Thumbnail */}
            <div
                className="w-full flex items-center justify-center border-b border-border/50 overflow-hidden"
                style={{ height: '90px', background: template.id === 'minimal' ? '#f9fafb' : '#ffffff' }}
            >
                <div style={{ height: '80px', padding: '4px' }}>
                    <Thumb />
                </div>
            </div>

            {/* Label */}
            <div className="p-2.5 bg-surface-elevated">
                <div className="flex items-center justify-between gap-1 flex-wrap mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{template.name}</span>
                    {template.badge && template.badgeClass && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${template.badgeClass}`}>
                            {template.badge}
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-muted leading-snug line-clamp-2">{template.description}</p>
            </div>

            {/* Selected checkmark */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm"
                    >
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function TemplatePickerModal({
    isOpen,
    onClose,
    onDownloadPDF,
    onDownloadDOCX,
    resumeText,
    isDownloading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onDownloadPDF: (templateId: TemplateId) => void;
    onDownloadDOCX: (templateId: TemplateId) => void;
    resumeText: string;
    isDownloading: 'pdf' | 'docx' | null;
}) {
    const [selectedId, setSelectedId] = useState<TemplateId>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('zofu-resume-template') as TemplateId;
            if (saved && ['classic', 'modern', 'minimal', 'executive'].includes(saved)) return saved;
        }
        return 'classic';
    });

    const handleSelect = (id: TemplateId) => {
        setSelectedId(id);
        if (typeof window !== 'undefined') {
            localStorage.setItem('zofu-resume-template', id);
        }
    };

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const selectedTemplate = getTemplate(selectedId);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 48, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 48, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative w-full sm:max-w-5xl bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-foreground">Choose a Template</h2>
                                <p className="text-xs text-muted mt-0.5">Select a style, preview it live, then download as PDF or DOCX</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-sunken text-muted hover:text-foreground transition-colors"
                                aria-label="Close template picker"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* ── Body ── */}
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">

                            {/* Left: Template card grid */}
                            <div className="md:w-[296px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto">
                                <div className="p-4">
                                    <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-3">
                                        4 ATS-Friendly Styles
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {TEMPLATES.map(tmpl => (
                                            <TemplateCard
                                                key={tmpl.id}
                                                template={tmpl}
                                                isSelected={selectedId === tmpl.id}
                                                onSelect={() => handleSelect(tmpl.id)}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-muted text-center mt-4 leading-snug">
                                        All templates are single-column,<br />
                                        text-based, and ATS-compatible.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Live preview */}
                            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                {/* Preview bar */}
                                <div className="flex items-center gap-2 px-5 py-3 border-b border-border flex-shrink-0 bg-surface-sunken/50">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ background: selectedTemplate.accentHex }}
                                    />
                                    <span className="text-xs font-semibold text-foreground">{selectedTemplate.name}</span>
                                    <span className="text-[10px] text-muted">— {selectedTemplate.tag}</span>
                                    <span className="ml-auto text-[10px] text-muted italic">Live preview</span>
                                </div>

                                {/* Preview content */}
                                <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-5">
                                    {resumeText ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedId}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="max-w-[680px] mx-auto shadow-xl rounded-sm overflow-hidden"
                                                style={{ fontSize: '10px', zoom: 0.88 }}
                                            >
                                                <LiveResumePreview text={resumeText} template={selectedTemplate} />
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <div className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center mb-3">
                                                <svg className="w-6 h-6 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">No resume to preview</p>
                                            <p className="text-xs text-muted mt-1">Amplify your resume first to see a live preview here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border bg-surface-sunken flex-shrink-0">
                            <p className="text-xs text-muted text-center sm:text-left">
                                <span className="font-semibold text-foreground">{selectedTemplate.name}</span> selected
                                <span className="hidden sm:inline"> · Your preference is saved automatically</span>
                            </p>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                {/* DOCX */}
                                <button
                                    id="template-picker-download-docx"
                                    onClick={() => onDownloadDOCX(selectedId)}
                                    disabled={isDownloading !== null}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border bg-surface-elevated text-sm font-semibold text-foreground hover:bg-surface-sunken transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading === 'docx' ? (
                                        <svg className="w-4 h-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600 text-[9px] font-bold flex-shrink-0">W</span>
                                    )}
                                    {isDownloading === 'docx' ? 'Generating…' : 'Download DOCX'}
                                </button>

                                {/* PDF */}
                                <button
                                    id="template-picker-download-pdf"
                                    onClick={() => onDownloadPDF(selectedId)}
                                    disabled={isDownloading !== null}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloading === 'pdf' ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <span className="flex h-5 w-5 items-center justify-center rounded bg-red-200 text-red-700 text-[9px] font-bold flex-shrink-0">PDF</span>
                                    )}
                                    {isDownloading === 'pdf' ? 'Generating…' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
