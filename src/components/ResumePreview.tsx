"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Copy01Icon, CheckmarkCircle01Icon, EyeIcon, GitCompareIcon,
    File01Icon, File02Icon, PencilEdit01Icon, TickDouble01Icon,
} from "hugeicons-react";
import ReactMarkdown from 'react-markdown';
import TemplatePickerModal from './TemplatePickerModal';
import { type TemplateId, getTemplate } from '@/lib/resumeTemplates';

interface Change {
    section: string;
    original: string;
    amplified: string;
    reason: string;
}
const cleanMarkdownForExport = (text: string) => {
    return text.split('\n').map(line => {
        let clean = line.replace(/^#{1,6}\s*/, '');
        if (/^\s*\*\s/.test(clean)) {
            clean = clean.replace(/^\s*\*\s/, '• ');
        } else if (/^\s*\*(?!\*)/.test(clean)) {
            clean = clean.replace(/^\s*\*(?!\*)/, '• ');
        }
        clean = clean.replace(/\*\*/g, '___BOLD___');
        // Remove italic asterisks but preserve literal ones like C++*
        clean = clean.replace(/(^|\s)\*([a-zA-Z0-9.,]+)\*(\s|$)/g, '$1$2$3');
        clean = clean.replace(/___BOLD___/g, '**');
        return clean;
    }).join('\n');
};

interface ResumePreviewProps {
    originalText: string;
    amplifiedText: string;
    coverLetter?: string;
    changes: Change[];
    isLoading: boolean;
    isPro?: boolean;
    onEdit?: (text: string) => void;
}

export default function ResumePreview({
    originalText,
    amplifiedText,
    coverLetter,
    changes,
    isLoading,
    isPro = true,
    onEdit,
}: ResumePreviewProps) {
    const [viewMode, setViewMode] = useState<"amplified" | "diff" | "original" | "coverLetter">("amplified");
    const [copied, setCopied] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'pdf' | 'docx' | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync editor content when amplifiedText changes externally (e.g. after new amplify run)
    useEffect(() => {
        if (editorRef.current && !isEditing) {
            editorRef.current.innerText = amplifiedText;
            countWords(amplifiedText);
        }
    }, [amplifiedText, isEditing]);

    const countWords = useCallback((text: string) => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length);
    }, []);

    const handleEditorInput = useCallback(() => {
        if (!editorRef.current) return;
        const text = editorRef.current.innerText;
        countWords(text);
        onEdit?.(text);
    }, [onEdit, countWords]);

    const execCmd = (cmd: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, value);
    };

    const enterEditMode = () => {
        setIsEditing(true);
        setViewMode("amplified");
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.innerText = amplifiedText;
                editorRef.current.focus();
                countWords(amplifiedText);
            }
        }, 50);
    };

    const exitEditMode = () => {
        setIsEditing(false);
    };

    const textToCopy = viewMode === "coverLetter" ? coverLetter || "" : amplifiedText;
    const textToDownload = viewMode === "coverLetter" ? coverLetter || "" : amplifiedText;

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadAsPDF = async (templateId: TemplateId) => {
        setIsDownloading("pdf");
        try {
            const { default: jsPDF } = await import("jspdf");
            const doc = new jsPDF({ unit: "mm", format: "a4" });
            const tmpl = getTemplate(templateId).pdf;

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = tmpl.margin;
            const usableWidth = pageWidth - margin * 2;
            const bottomMargin = 15;

            // Parse markdown bold: splits text into segments of {text, bold}
            const parseBoldSegments = (text: string) => {
                const segments: { text: string; bold: boolean }[] = [];
                const regex = /\*\*(.+?)\*\*/g;
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        segments.push({ text: text.slice(lastIndex, match.index), bold: false });
                    }
                    segments.push({ text: match[1], bold: true });
                    lastIndex = regex.lastIndex;
                }
                if (lastIndex < text.length) {
                    segments.push({ text: text.slice(lastIndex), bold: false });
                }
                return segments.length > 0 ? segments : [{ text, bold: false }];
            };

            // Render text that wraps naturally and respects bold markers
            const printRichText = (text: string, startX: number, maxWidth: number, fontSize: number, baseLineHeight = 4.5, alignRight: boolean = false) => {
                doc.setFontSize(fontSize);
                let currentX = startX;

                if (alignRight) {
                    doc.setFont("helvetica", "normal");
                    doc.text(stripBold(text), startX, cursorY, { align: "right" });
                    return;
                }

                const segments = parseBoldSegments(text);
                for (let i = 0; i < segments.length; i++) {
                    const seg = segments[i];
                    doc.setFont("helvetica", seg.bold ? "bold" : "normal");

                    const tokens = seg.text.split(/(\s+)/);
                    for (const token of tokens) {
                        if (!token) continue;
                        const tokenWidth = doc.getTextWidth(token);

                        if (currentX + tokenWidth > startX + maxWidth && currentX > startX && !token.match(/^\s+$/)) {
                            cursorY += baseLineHeight;
                            addPageIfNeeded(baseLineHeight);
                            currentX = startX;
                        }

                        if (currentX === startX && token.match(/^\s+$/)) {
                            continue; // omit leading spaces wrapped to a new line
                        }

                        doc.text(token, currentX, cursorY);
                        currentX += tokenWidth;
                    }
                }
            };

            // Strip bold markers for width calculation / heuristic matching
            const stripBold = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');

            const rawLines = cleanMarkdownForExport(textToDownload).split("\n");

            // Heuristic detectors
            const isSectionHeader = (line: string) => {
                const trimmed = line.trim();
                if (!trimmed) return false;
                // ALL-CAPS words (at least 2 chars), possibly with separators like | or :
                if (/^[A-Z][A-Z &/|,\-:]{2,}$/.test(trimmed)) return true;
                // Common resume headers
                if (/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?|LANGUAGES?|INTERESTS?|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|TECHNICAL SKILLS|CORE COMPETENCIES|PROFESSIONAL SUMMARY|CAREER SUMMARY|VOLUNTEER|REFERENCES|PUBLICATIONS)$/i.test(trimmed)) return true;
                return false;
            };

            const isBullet = (line: string) => /^\s*[•\-\*▪◦–■❖→✓⬥]\s/.test(line);
            const isContactLine = (line: string) => {
                const trimmed = line.trim();
                // Contains email, phone, URL, or pipe-separated contact info
                return /[@]/.test(trimmed) || /\b\d{3}[\s\-.)]{0,2}\d{3}[\s\-.)]{0,2}\d{4}\b/.test(trimmed) ||
                    /\b(linkedin|github|portfolio|www\.)\b/i.test(trimmed) ||
                    (/[|•·,]/.test(trimmed) && trimmed.length < 120 && /@/.test(trimmed));
            };
            const isSubHeader = (line: string) => {
                const trimmed = stripBold(line.trim());
                // Mixed case with a date pattern or pipe/dash separator, often "Company Name | Role | Date"
                if (/\b(20\d{2}|19\d{2})\b/.test(trimmed) && trimmed.length < 100) return true;
                // Bold-style sub-headers: starts uppercase, short, no bullet
                if (/^[A-Z][a-zA-Z\s&,.\-]+$/.test(trimmed) && trimmed.length < 60 && !isBullet(line) && !isSectionHeader(line)) return true;
                return false;
            };

            // Extract date portion from a sub-header line for right-alignment
            const extractDate = (text: string) => {
                // Match patterns like "Jan 2020 – Present", "2020 - 2023", "May 2019 – Dec 2021"
                const dateRegex = /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[–\-—]\s*(Present|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|\d{4}\s*[–\-—]\s*(Present|\d{4}))/i;
                const match = text.match(dateRegex);
                if (match) {
                    const dateStr = match[0].trim();
                    const rest = text.replace(match[0], '').replace(/\s*[|,–\-—]\s*$/, '').replace(/^\s*[|,–\-—]\s*/, '').trim();
                    return { title: rest, date: dateStr };
                }
                return { title: text, date: '' };
            };

            let cursorY = margin;
            const addPageIfNeeded = (spaceNeeded: number) => {
                if (cursorY + spaceNeeded > pageHeight - bottomMargin) {
                    doc.addPage();
                    cursorY = margin;
                }
            };

            rawLines.forEach((rawLine, index) => {
                const trimmed = rawLine.trim();

                // Empty line — small spacing
                if (!trimmed) {
                    cursorY += 2;
                    return;
                }

                // First non-empty line = Name
                if (index === 0 || (index <= 2 && !isContactLine(rawLine) && !isSectionHeader(rawLine) && !isBullet(rawLine) && rawLine.trim().length < 50 && rawLines.slice(0, index).every(l => !l.trim()))) {
                    addPageIfNeeded(10);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(tmpl.nameSize);
                    doc.setTextColor(...tmpl.nameRGB);
                    if (tmpl.nameAlign === 'center') {
                        doc.text(stripBold(trimmed), pageWidth / 2, cursorY, { align: "center" });
                    } else {
                        doc.text(stripBold(trimmed), margin, cursorY);
                    }
                    doc.setTextColor(0, 0, 0);
                    cursorY += 8;
                    return;
                }

                // Contact info line (email, phone, linkedin, etc.)
                if (isContactLine(rawLine) && index <= 5) {
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(tmpl.contactSize);
                    doc.setTextColor(...tmpl.contactRGB);
                    const wrappedLines = doc.splitTextToSize(stripBold(trimmed), usableWidth) as string[];
                    for (const wl of wrappedLines) {
                        addPageIfNeeded(4.5);
                        if (tmpl.contactAlign === 'center') {
                            doc.text(wl, pageWidth / 2, cursorY, { align: "center" });
                        } else {
                            doc.text(wl, margin, cursorY);
                        }
                        cursorY += 4.5;
                    }
                    doc.setTextColor(0, 0, 0);
                    return;
                }

                // Section header (EXPERIENCE, EDUCATION, etc.)
                if (isSectionHeader(rawLine)) {
                    cursorY += tmpl.sectionSpaceBefore;
                    addPageIfNeeded(10);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(tmpl.sectionSize);
                    doc.setTextColor(...tmpl.sectionRGB);
                    const sectionTextX = tmpl.dividerFull ? margin : margin + 5;
                    if (!tmpl.dividerFull) {
                        // Modern: draw left accent bar before text
                        doc.setFillColor(...tmpl.dividerRGB);
                        doc.rect(margin, cursorY - 3.5, 2.5, 4.5, 'F');
                    }
                    const headerText = tmpl.sectionUppercase ? stripBold(trimmed).toUpperCase() : stripBold(trimmed);
                    doc.text(headerText, sectionTextX, cursorY);
                    doc.setTextColor(0, 0, 0);
                    cursorY += 1.2;
                    if (tmpl.dividerFull) {
                        doc.setDrawColor(...tmpl.dividerRGB);
                        doc.setLineWidth(0.4);
                        doc.line(margin, cursorY, pageWidth - margin, cursorY);
                    }
                    cursorY += 4;
                    return;
                }

                // Sub-header (Company, Role, Dates) — dates right-aligned
                if (isSubHeader(rawLine) && index > 3) {
                    cursorY += 1.5;
                    addPageIfNeeded(7);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(tmpl.subHeaderSize);
                    const { title, date } = extractDate(stripBold(trimmed));
                    if (date) {
                        printRichText(`**${title}**`, margin, usableWidth, tmpl.subHeaderSize);
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(9.5);
                        doc.text(date, pageWidth - margin, cursorY, { align: "right" });
                    } else {
                        printRichText(`**${stripBold(trimmed)}**`, margin, usableWidth, tmpl.subHeaderSize);
                    }
                    cursorY += 5;
                    return;
                }

                // Bullet point
                if (isBullet(rawLine)) {
                    addPageIfNeeded(tmpl.lineHeight + 0.5);
                    const bulletIndent = 4;
                    const textIndent = bulletIndent + 3.5;
                    const bulletText = trimmed.replace(/^[•\-\*▪◦–■❖→✓⬥]\s*/, "");

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(tmpl.bodySize);
                    doc.text("•", margin + bulletIndent, cursorY);
                    printRichText(bulletText, margin + textIndent, usableWidth - textIndent, tmpl.bodySize);
                    cursorY += tmpl.lineHeight;
                    return;
                }

                // Regular body text
                addPageIfNeeded(tmpl.lineHeight);
                printRichText(trimmed, margin, usableWidth, tmpl.bodySize);
                cursorY += tmpl.lineHeight;
            });

            doc.save("amplified-resume.pdf");
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setIsDownloading(null);
        }
    };

    const downloadAsDOCX = async (templateId: TemplateId) => {
        setIsDownloading("docx");
        try {
            const { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType, BorderStyle, TabStopPosition, TabStopType } = await import("docx");
            const { saveAs } = await import("file-saver");
            const tmpl = getTemplate(templateId).docx;

            const rawLines = cleanMarkdownForExport(textToDownload).split("\n");

            const stripBoldDocx = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');

            const isSectionHeader = (line: string) => {
                const t = stripBoldDocx(line.trim());
                if (!t) return false;
                if (/^[A-Z][A-Z &/|,\-:]{2,}$/.test(t)) return true;
                if (/^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS?|ACHIEVEMENTS?|AWARDS?|LANGUAGES?|INTERESTS?|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|TECHNICAL SKILLS|CORE COMPETENCIES|PROFESSIONAL SUMMARY|CAREER SUMMARY|VOLUNTEER|REFERENCES|PUBLICATIONS)$/i.test(t)) return true;
                return false;
            };
            const isBullet = (line: string) => /^\s*[•\-\*▪◦–■❖→✓⬥]\s/.test(line);
            const isContactLine = (line: string) => {
                const t = line.trim();
                return /[@]/.test(t) || /\b\d{3}[\s\-.)]{0,2}\d{3}[\s\-.)]{0,2}\d{4}\b/.test(t) ||
                    /\b(linkedin|github|portfolio|www\.)\b/i.test(t);
            };
            const isSubHeaderDocx = (line: string) => {
                const t = stripBoldDocx(line.trim());
                if (/\b(20\d{2}|19\d{2})\b/.test(t) && t.length < 100) return true;
                if (/^[A-Z][a-zA-Z\s&,.\-]+$/.test(t) && t.length < 60 && !isBullet(line) && !isSectionHeader(line)) return true;
                return false;
            };
            const extractDateDocx = (text: string) => {
                const dateRegex = /((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[–\-—]\s*(Present|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|\d{4}\s*[–\-—]\s*(Present|\d{4}))/i;
                const match = text.match(dateRegex);
                if (match) {
                    const dateStr = match[0].trim();
                    const rest = text.replace(match[0], '').replace(/\s*[|,–\-—]\s*$/, '').replace(/^\s*[|,–\-—]\s*/, '').trim();
                    return { title: rest, date: dateStr };
                }
                return { title: text, date: '' };
            };

            // Parse markdown bold into TextRun array for DOCX
            const makeTextRuns = (text: string, baseFont: string = "Calibri", baseSize: number = 21, baseBold: boolean = false, color?: string) => {
                const runs: InstanceType<typeof TextRun>[] = [];
                const regex = /\*\*(.+?)\*\*/g;
                let lastIndex = 0;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        runs.push(new TextRun({ text: text.slice(lastIndex, match.index), font: baseFont, size: baseSize, bold: baseBold, ...(color ? { color } : {}) }));
                    }
                    runs.push(new TextRun({ text: match[1], font: baseFont, size: baseSize, bold: true, ...(color ? { color } : {}) }));
                    lastIndex = regex.lastIndex;
                }
                if (lastIndex < text.length) {
                    runs.push(new TextRun({ text: text.slice(lastIndex), font: baseFont, size: baseSize, bold: baseBold, ...(color ? { color } : {}) }));
                }
                return runs.length > 0 ? runs : [new TextRun({ text, font: baseFont, size: baseSize, bold: baseBold, ...(color ? { color } : {}) })];
            };

            const paragraphs: InstanceType<typeof Paragraph>[] = [];

            rawLines.forEach((rawLine, index) => {
                const trimmed = rawLine.trim();

                if (!trimmed) {
                    paragraphs.push(new Paragraph({ spacing: { after: 60 } }));
                    return;
                }

                // Name (first line)
                if (index === 0) {
                    paragraphs.push(new Paragraph({
                        alignment: tmpl.nameCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
                        spacing: { after: 20 },
                        children: makeTextRuns(trimmed, "Calibri", tmpl.nameFontSize, true, tmpl.nameColorHex),
                    }));
                    return;
                }

                // Contact info
                if (isContactLine(rawLine) && index <= 5) {
                    paragraphs.push(new Paragraph({
                        alignment: tmpl.nameCenter ? AlignmentType.CENTER : AlignmentType.LEFT,
                        spacing: { after: 20 },
                        children: makeTextRuns(trimmed, "Calibri", tmpl.contactFontSize, false, tmpl.contactColorHex),
                    }));
                    return;
                }

                // Section header
                if (isSectionHeader(rawLine)) {
                    const sectionText = tmpl.sectionUppercase ? stripBoldDocx(trimmed).toUpperCase() : stripBoldDocx(trimmed);
                    paragraphs.push(new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 180, after: 60 },
                        border: tmpl.hasSectionBorder
                            ? { bottom: { style: BorderStyle.SINGLE, size: 2, color: tmpl.sectionBorderColorHex, space: 1 } }
                            : {},
                        children: [new TextRun({ text: sectionText, bold: true, font: "Calibri", size: tmpl.sectionFontSize, color: tmpl.sectionColorHex })],
                    }));
                    return;
                }

                // Sub-header (Company, Role, Dates) — dates right-aligned via tab stop
                if (isSubHeaderDocx(rawLine) && index > 3) {
                    const { title, date } = extractDateDocx(stripBoldDocx(trimmed));
                    const children = date
                        ? [
                            new TextRun({ text: title, bold: true, font: "Calibri", size: tmpl.subHeaderFontSize }),
                            new TextRun({ text: "\t", font: "Calibri", size: tmpl.subHeaderFontSize }),
                            new TextRun({ text: date, font: "Calibri", size: 19 }),
                        ]
                        : makeTextRuns(trimmed, "Calibri", tmpl.subHeaderFontSize, true);
                    paragraphs.push(new Paragraph({
                        spacing: { before: 80, after: 20 },
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                        children,
                    }));
                    return;
                }

                // Bullet point
                if (isBullet(rawLine)) {
                    const bulletText = trimmed.replace(/^[•\-\*▪◦–■❖→✓⬥]\s*/, "");
                    paragraphs.push(new Paragraph({
                        bullet: { level: 0 },
                        spacing: { after: 20 },
                        children: makeTextRuns(bulletText, "Calibri", tmpl.bodyFontSize),
                    }));
                    return;
                }

                // Regular text
                paragraphs.push(new Paragraph({
                    spacing: { after: 20 },
                    children: makeTextRuns(trimmed, "Calibri", tmpl.bodyFontSize),
                }));
            });

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: tmpl.marginTwips, bottom: tmpl.marginTwips, left: tmpl.marginTwips, right: tmpl.marginTwips },
                        },
                    },
                    children: paragraphs,
                }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "amplified-resume.docx");
        } catch (err) {
            console.error("DOCX generation failed:", err);
        } finally {
            setIsDownloading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="glass-card h-full flex flex-col">
                <div className="border-b border-border p-4">
                    <div className="shimmer h-5 w-48 rounded-lg" />
                </div>
                <div className="flex-1 p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div
                                className="shimmer h-4 rounded"
                                style={{ width: `${70 + Math.random() * 30}%` }}
                            />
                            {i % 3 === 0 && (
                                <div className="shimmer h-4 w-1/2 rounded" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!amplifiedText && !originalText) {
        return (
            <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-ultra-light mb-4">
                    <File01Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Resume Preview
                </h3>
                <p className="text-sm text-muted max-w-xs">
                    Upload your resume and paste a job description, then click
                    &quot;Amplify&quot; to see your optimized resume here.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex w-full sm:w-auto overflow-x-auto no-scrollbar rounded-lg bg-surface-sunken p-1 snap-x shadow-inner">
                    <div className="flex min-w-max w-full">
                        {[
                            { id: "amplified" as const, label: "Amplified", icon: File01Icon },
                            { id: "coverLetter" as const, label: "Cover Letter", icon: File02Icon },
                            { id: "diff" as const, label: "Changes", icon: GitCompareIcon },
                            { id: "original" as const, label: "Original", icon: EyeIcon },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => { setViewMode(id); if (id !== "amplified") setIsEditing(false); }}
                                className={`
                                    flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all snap-center whitespace-nowrap
                                    ${viewMode === id
                                        ? "bg-surface-elevated text-foreground shadow-sm"
                                        : "text-muted hover:text-foreground"
                                    }
                                `}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {amplifiedText && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Edit / Done toggle — only on Amplified tab */}
                        {viewMode === "amplified" && onEdit && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={isEditing ? exitEditMode : enterEditMode}
                                className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium transition-all ${isEditing
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                                    : "bg-surface-elevated border border-border text-foreground shadow-sm hover:bg-surface-sunken"
                                    }`}
                            >
                                {isEditing
                                    ? <><TickDouble01Icon className="h-3.5 w-3.5" /> Done</>
                                    : <><PencilEdit01Icon className="h-3.5 w-3.5" /> Edit</>}
                            </motion.button>
                        )}

                        {/* Copy Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={copyToClipboard}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-surface-elevated border border-border text-foreground shadow-sm hover:bg-surface-sunken sm:bg-transparent sm:border-transparent sm:shadow-none sm:text-muted sm:hover:bg-surface-sunken sm:hover:text-foreground transition-all"
                        >
                            {copied ? (
                                <CheckmarkCircle01Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-success" />
                            ) : (
                                <Copy01Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                            )}
                            <span className="sm:hidden">{copied ? "Copied!" : "Copy"}</span>
                            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                        </motion.button>

                        {/* Download — opens template picker */}
                        <motion.button
                            id="resume-download-btn"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowTemplatePicker(true)}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-medium bg-primary text-white shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <svg className="h-4 w-4 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Formatting Toolbar — visible only in edit mode */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border bg-surface-sunken"
                    >
                        {/* Bold */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("bold"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border font-bold text-sm text-foreground transition-colors" title="Bold (Ctrl+B)">
                            B
                        </button>
                        {/* Italic */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("italic"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border italic text-sm text-foreground transition-colors" title="Italic (Ctrl+I)">
                            I
                        </button>
                        {/* Underline */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("underline"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border underline text-sm text-foreground transition-colors" title="Underline (Ctrl+U)">
                            U
                        </button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Bullet list */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("insertUnorderedList"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border text-foreground transition-colors" title="Bullet list">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
                                <circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
                            </svg>
                        </button>
                        {/* Ordered list */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("insertOrderedList"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border text-foreground transition-colors" title="Numbered list">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                                <path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                            </svg>
                        </button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Undo */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("undo"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border text-foreground transition-colors" title="Undo (Ctrl+Z)">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                            </svg>
                        </button>
                        {/* Redo */}
                        <button onMouseDown={e => { e.preventDefault(); execCmd("redo"); }}
                            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-border text-foreground transition-colors" title="Redo (Ctrl+Shift+Z)">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                            </svg>
                        </button>

                        <div className="ml-auto text-[10px] text-muted font-mono">{wordCount} words</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {viewMode === "amplified" && (
                        <motion.div
                            key="amplified"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="prose prose-sm prose-blue max-w-none text-foreground"
                        >
                            {isEditing ? (
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onInput={handleEditorInput}
                                    className="whitespace-pre-wrap text-sm leading-relaxed outline-none min-h-[300px] focus:ring-2 focus:ring-primary/20 rounded-lg p-2 -m-2 transition-all"
                                    style={{ caretColor: "var(--color-primary)" }}
                                />
                            ) : (
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    <ReactMarkdown>{amplifiedText || originalText}</ReactMarkdown>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {viewMode === "coverLetter" && coverLetter && (
                        <motion.div
                            key="coverLetter"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="prose prose-sm prose-blue max-w-none text-foreground"
                        >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                <ReactMarkdown>{coverLetter}</ReactMarkdown>
                            </div>
                        </motion.div>
                    )}

                    {viewMode === "coverLetter" && !coverLetter && (
                        <motion.div
                            key="coverLetter-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-ultra-light mb-4">
                                <File02Icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Cover Letter</h3>
                            <p className="text-sm text-muted max-w-xs">
                                Your personalized cover letter will appear here after you click &quot;Optimize&quot;. It&apos;s crafted automatically from your resume and the job description.
                            </p>
                        </motion.div>
                    )}



                    {viewMode === "diff" && (
                        <motion.div
                            key="diff"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            {changes.length > 0 ? (
                                changes.map((change, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="rounded-xl border border-border overflow-hidden"
                                    >
                                        <div className="bg-surface-sunken px-4 py-2 border-b border-border">
                                            <span className="text-xs font-semibold text-foreground">
                                                {change.section}
                                            </span>
                                            <p className="text-xs text-muted mt-0.5">
                                                {change.reason}
                                            </p>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="diff-removed text-xs rounded-md">
                                                {change.original}
                                            </div>
                                            <div className="diff-added text-xs rounded-md">
                                                {change.amplified}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-sm text-muted text-center py-8">
                                    No changes to display yet.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {viewMode === "original" && (
                        <motion.div
                            key="original"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                                {originalText}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Template Picker Modal */}
            <TemplatePickerModal
                isOpen={showTemplatePicker}
                onClose={() => setShowTemplatePicker(false)}
                onDownloadPDF={downloadAsPDF}
                onDownloadDOCX={downloadAsDOCX}
                resumeText={textToDownload}
                isDownloading={isDownloading}
            />
        </div>
    );
}
