// Turns what the user types in "Modèle(s)" into the list of article names to
// create. Commas / semicolons / new lines separate entries; an entry ending in a
// number range expands it:
//   "VAC1-33"       → VAC1 … VAC33
//   "VAC1-VAC33"    → same
//   "UL 50..52"     → UL 50, UL 51, UL 52
//   "K01-12"        → K01 … K12 (keeps the zero padding)
//   "206, 207"      → 206, 207
export const MAX_VARIANTS = 200;

const RANGE = /^(.*?)(\d+)\s*(?:-|\.\.|→|à)\s*(.*?)(\d+)$/i;

export function expandVariantNames(input: string): string[] {
    const out: string[] = [];
    for (const raw of (input ?? '').split(/[,;\n]+/)) {
        const entry = raw.trim().replace(/\s+/g, ' ');
        if (!entry) continue;
        const m = RANGE.exec(entry);
        // A range needs the same (or no) prefix on the right: "VAC1-VAC33" or "VAC1-33".
        if (m && (m[3].trim() === '' || m[3].trim().toLowerCase() === m[1].trim().toLowerCase())) {
            const [, prefix, startStr, , endStr] = m;
            const start = Number(startStr);
            const end = Number(endStr);
            if (end >= start && end - start < MAX_VARIANTS) {
                const width = startStr.startsWith('0') ? startStr.length : 0;
                for (let n = start; n <= end; n++) out.push(prefix + String(n).padStart(width, '0'));
                continue;
            }
        }
        out.push(entry);
    }
    // Drop duplicates (case-insensitive), keep first spelling and order.
    const seen = new Set<string>();
    return out.filter((n) => !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase())).slice(0, MAX_VARIANTS);
}

// Family guessed from the first name: its leading letters ("VAC12" → "VAC",
// "UL 50" → "UL"). Empty when the name has no letter prefix ("206").
export function guessFamily(names: string[]): string {
    const m = /^([^\d]*[A-Za-zÀ-ÿ][^\d]*)\d/.exec(names[0] ?? '');
    return m ? m[1].trim().replace(/[-_\s]+$/, '') : '';
}
