export interface ResumeTextSegment {
    text: string;
    bold: boolean;
    url?: string;
}

export function normalizeResumeUrl(value: string): string | null {
    const input = value.trim();
    if (!input || /\s/.test(input)) return null;
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input);
    try {
        const url = new URL(hasScheme ? input : `https://${input}`);
        if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
            return null;
        }
        if (!hasScheme && !url.hostname.includes(".")) return null;
        return url.href.replace(/\(/g, "%28").replace(/\)/g, "%29");
    } catch {
        return null;
    }
}

export function createResumeLink(label: string, url: string): string {
    const escapedLabel = label.trim().replace(/([\\[\]*`])/g, "\\$1");
    return `[${escapedLabel}](${url})`;
}

// The editor stores Markdown; exports use the same labels and destinations.
export function parseResumeInline(text: string, bold = false): ResumeTextSegment[] {
    const segments: ResumeTextSegment[] = [];
    const pattern = /\*\*(.+?)\*\*|\[((?:\\.|[^\]\\\n])+)\]\((https?:\/\/[^\s)]+)\)/g;
    let lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
        const index = match.index!;
        if (index > lastIndex) segments.push({ text: text.slice(lastIndex, index), bold });
        if (match[1] !== undefined) {
            segments.push(...parseResumeInline(match[1], true));
        } else {
            const url = normalizeResumeUrl(match[3]);
            segments.push({
                text: match[2].replace(/\\([\\[\]*`])/g, "$1"),
                bold,
                ...(url ? { url } : {}),
            });
        }
        lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), bold });
    return segments;
}
