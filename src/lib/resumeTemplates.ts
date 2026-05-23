export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive';

type RGB = [number, number, number];

export interface TemplateStyles {
    fontFamily: string;
    nameFontSize: string;
    nameColor: string;
    nameTextAlign: 'center' | 'left';
    nameLetterSpacing?: string;
    contactFontSize: string;
    contactColor: string;
    contactTextAlign: 'center' | 'left';
    sectionFontSize: string;
    sectionColor: string;
    sectionTextTransform: 'uppercase' | 'none';
    sectionFontWeight: string;
    sectionLetterSpacing?: string;
    sectionBorderBottom?: string;
    sectionBorderLeft?: string;
    sectionPaddingLeft?: string;
    sectionPaddingBottom?: string;
    sectionMarginTop: string;
    sectionMarginBottom: string;
    subHeaderFontSize: string;
    subHeaderColor: string;
    subHeaderFontWeight: string;
    bodyFontSize: string;
    bodyColor: string;
    lineHeight: string;
    bulletIndent: string;
    paperBackground: string;
}

export interface PDFTokens {
    nameSize: number;
    nameRGB: RGB;
    nameAlign: 'center' | 'left';
    contactSize: number;
    contactRGB: RGB;
    contactAlign: 'center' | 'left';
    sectionSize: number;
    sectionRGB: RGB;
    sectionUppercase: boolean;
    dividerRGB: RGB;
    /** true = full-width horizontal rule; false = left accent bar (Modern) */
    dividerFull: boolean;
    subHeaderSize: number;
    bodySize: number;
    lineHeight: number;
    margin: number;
    sectionSpaceBefore: number;
}

export interface DOCXTokens {
    /** Half-points (e.g. 36 = 18 pt) */
    nameFontSize: number;
    nameColorHex: string;
    nameCenter: boolean;
    contactFontSize: number;
    contactColorHex: string;
    sectionFontSize: number;
    sectionColorHex: string;
    sectionUppercase: boolean;
    sectionBorderColorHex: string;
    hasSectionBorder: boolean;
    subHeaderFontSize: number;
    bodyFontSize: number;
    /** Page margin in twips (1440 = 1 inch) */
    marginTwips: number;
}

export interface ResumeTemplate {
    id: TemplateId;
    name: string;
    tag: string;
    description: string;
    badge?: string;
    badgeClass?: string;
    accentHex: string;
    styles: TemplateStyles;
    pdf: PDFTokens;
    docx: DOCXTokens;
}

export const TEMPLATES: ResumeTemplate[] = [
    // ── Classic ─────────────────────────────────────────────────────────────
    {
        id: 'classic',
        name: 'Classic',
        tag: 'Traditional',
        description: 'Timeless navy layout trusted by Fortune 500 recruiters.',
        badge: 'Most Popular',
        badgeClass: 'bg-emerald-500 text-white',
        accentHex: '#1A365D',
        styles: {
            fontFamily: 'Georgia, "Times New Roman", serif',
            nameFontSize: '22px',
            nameColor: '#1A365D',
            nameTextAlign: 'center',
            contactFontSize: '10px',
            contactColor: '#555',
            contactTextAlign: 'center',
            sectionFontSize: '11px',
            sectionColor: '#1A365D',
            sectionTextTransform: 'uppercase',
            sectionFontWeight: '700',
            sectionLetterSpacing: '0.06em',
            sectionBorderBottom: '1.5px solid #1A365D',
            sectionPaddingBottom: '3px',
            sectionMarginTop: '16px',
            sectionMarginBottom: '5px',
            subHeaderFontSize: '10.5px',
            subHeaderColor: '#222',
            subHeaderFontWeight: '600',
            bodyFontSize: '10px',
            bodyColor: '#333',
            lineHeight: '1.55',
            bulletIndent: '14px',
            paperBackground: '#ffffff',
        },
        pdf: {
            nameSize: 18,
            nameRGB: [26, 54, 93],
            nameAlign: 'center',
            contactSize: 8.5,
            contactRGB: [70, 70, 70],
            contactAlign: 'center',
            sectionSize: 11,
            sectionRGB: [26, 54, 93],
            sectionUppercase: true,
            dividerRGB: [26, 54, 93],
            dividerFull: true,
            subHeaderSize: 10,
            bodySize: 9.5,
            lineHeight: 4.5,
            margin: 15,
            sectionSpaceBefore: 3.5,
        },
        docx: {
            nameFontSize: 36,
            nameColorHex: '1A365D',
            nameCenter: true,
            contactFontSize: 18,
            contactColorHex: '555555',
            sectionFontSize: 22,
            sectionColorHex: '1A365D',
            sectionUppercase: true,
            sectionBorderColorHex: '1A365D',
            hasSectionBorder: true,
            subHeaderFontSize: 21,
            bodyFontSize: 20,
            marginTwips: 720,
        },
    },

    // ── Modern ───────────────────────────────────────────────────────────────
    {
        id: 'modern',
        name: 'Modern',
        tag: 'Contemporary',
        description: 'Bold indigo accents and left-aligned flow for forward-thinking professionals.',
        badge: 'Trending',
        badgeClass: 'bg-indigo-500 text-white',
        accentHex: '#4F46E5',
        styles: {
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            nameFontSize: '24px',
            nameColor: '#4F46E5',
            nameTextAlign: 'left',
            contactFontSize: '10px',
            contactColor: '#666',
            contactTextAlign: 'left',
            sectionFontSize: '10.5px',
            sectionColor: '#4F46E5',
            sectionTextTransform: 'uppercase',
            sectionFontWeight: '700',
            sectionLetterSpacing: '0.08em',
            sectionBorderLeft: '3px solid #4F46E5',
            sectionPaddingLeft: '8px',
            sectionPaddingBottom: '0px',
            sectionMarginTop: '16px',
            sectionMarginBottom: '6px',
            subHeaderFontSize: '10.5px',
            subHeaderColor: '#222',
            subHeaderFontWeight: '600',
            bodyFontSize: '10px',
            bodyColor: '#444',
            lineHeight: '1.5',
            bulletIndent: '14px',
            paperBackground: '#ffffff',
        },
        pdf: {
            nameSize: 20,
            nameRGB: [79, 70, 229],
            nameAlign: 'left',
            contactSize: 8.5,
            contactRGB: [90, 90, 90],
            contactAlign: 'left',
            sectionSize: 11,
            sectionRGB: [79, 70, 229],
            sectionUppercase: true,
            dividerRGB: [79, 70, 229],
            dividerFull: false,
            subHeaderSize: 10,
            bodySize: 9.5,
            lineHeight: 4.5,
            margin: 15,
            sectionSpaceBefore: 4,
        },
        docx: {
            nameFontSize: 40,
            nameColorHex: '4F46E5',
            nameCenter: false,
            contactFontSize: 18,
            contactColorHex: '666666',
            sectionFontSize: 22,
            sectionColorHex: '4F46E5',
            sectionUppercase: true,
            sectionBorderColorHex: '4F46E5',
            hasSectionBorder: true,
            subHeaderFontSize: 21,
            bodyFontSize: 20,
            marginTwips: 720,
        },
    },

    // ── Minimal ──────────────────────────────────────────────────────────────
    {
        id: 'minimal',
        name: 'Minimal',
        tag: 'Clean',
        description: 'All-black typography and generous whitespace — content speaks for itself.',
        accentHex: '#111111',
        badgeClass: '',
        styles: {
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            nameFontSize: '20px',
            nameColor: '#111',
            nameTextAlign: 'center',
            contactFontSize: '10px',
            contactColor: '#888',
            contactTextAlign: 'center',
            sectionFontSize: '10px',
            sectionColor: '#222',
            sectionTextTransform: 'uppercase',
            sectionFontWeight: '600',
            sectionLetterSpacing: '0.12em',
            sectionBorderBottom: '1px solid #e0e0e0',
            sectionPaddingBottom: '4px',
            sectionMarginTop: '20px',
            sectionMarginBottom: '6px',
            subHeaderFontSize: '10.5px',
            subHeaderColor: '#333',
            subHeaderFontWeight: '600',
            bodyFontSize: '10px',
            bodyColor: '#555',
            lineHeight: '1.65',
            bulletIndent: '12px',
            paperBackground: '#fafafa',
        },
        pdf: {
            nameSize: 17,
            nameRGB: [17, 17, 17],
            nameAlign: 'center',
            contactSize: 8.5,
            contactRGB: [120, 120, 120],
            contactAlign: 'center',
            sectionSize: 10.5,
            sectionRGB: [50, 50, 50],
            sectionUppercase: true,
            dividerRGB: [210, 210, 210],
            dividerFull: true,
            subHeaderSize: 10,
            bodySize: 9.5,
            lineHeight: 5,
            margin: 18,
            sectionSpaceBefore: 5,
        },
        docx: {
            nameFontSize: 34,
            nameColorHex: '111111',
            nameCenter: true,
            contactFontSize: 17,
            contactColorHex: '888888',
            sectionFontSize: 21,
            sectionColorHex: '333333',
            sectionUppercase: true,
            sectionBorderColorHex: 'e0e0e0',
            hasSectionBorder: true,
            subHeaderFontSize: 21,
            bodyFontSize: 20,
            marginTwips: 1008,
        },
    },

    // ── Executive ────────────────────────────────────────────────────────────
    {
        id: 'executive',
        name: 'Executive',
        tag: 'Leadership',
        description: 'Commanding dark charcoal design for senior and C-suite candidates.',
        badge: 'Premium Look',
        badgeClass: 'bg-slate-700 text-white',
        accentHex: '#1C1C2E',
        styles: {
            fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
            nameFontSize: '21px',
            nameColor: '#1C1C2E',
            nameTextAlign: 'center',
            nameLetterSpacing: '0.06em',
            contactFontSize: '10px',
            contactColor: '#666',
            contactTextAlign: 'center',
            sectionFontSize: '11px',
            sectionColor: '#1C1C2E',
            sectionTextTransform: 'uppercase',
            sectionFontWeight: '800',
            sectionLetterSpacing: '0.1em',
            sectionBorderBottom: '2px solid #1C1C2E',
            sectionPaddingBottom: '3px',
            sectionMarginTop: '16px',
            sectionMarginBottom: '5px',
            subHeaderFontSize: '11px',
            subHeaderColor: '#1C1C2E',
            subHeaderFontWeight: '700',
            bodyFontSize: '10px',
            bodyColor: '#333',
            lineHeight: '1.5',
            bulletIndent: '14px',
            paperBackground: '#ffffff',
        },
        pdf: {
            nameSize: 18,
            nameRGB: [28, 28, 46],
            nameAlign: 'center',
            contactSize: 8.5,
            contactRGB: [90, 90, 90],
            contactAlign: 'center',
            sectionSize: 11,
            sectionRGB: [28, 28, 46],
            sectionUppercase: true,
            dividerRGB: [28, 28, 46],
            dividerFull: true,
            subHeaderSize: 10,
            bodySize: 9.5,
            lineHeight: 4.5,
            margin: 15,
            sectionSpaceBefore: 3.5,
        },
        docx: {
            nameFontSize: 36,
            nameColorHex: '1C1C2E',
            nameCenter: true,
            contactFontSize: 18,
            contactColorHex: '666666',
            sectionFontSize: 22,
            sectionColorHex: '1C1C2E',
            sectionUppercase: true,
            sectionBorderColorHex: '1C1C2E',
            hasSectionBorder: true,
            subHeaderFontSize: 21,
            bodyFontSize: 20,
            marginTwips: 720,
        },
    },
];

export const DEFAULT_TEMPLATE_ID: TemplateId = 'classic';

export function getTemplate(id: TemplateId): ResumeTemplate {
    return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}
