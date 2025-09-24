// Simple deterministic identicon generator (5x5 grid) similar to GitHub-style avatars.
// Given a seed, returns a data URL for an SVG image.

function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashString(s: string): number {
    let h = 2166136261 >>> 0; // FNV-1a 32-bit
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

export function identiconDataUrl(seed: string, cellSize = 20, padding = 10) {
    const h = hashString(seed || "seed");
    const rand = mulberry32(h);

    // Generate a pleasant foreground color
    const hue = Math.floor(rand() * 360);
    const sat = 65 + Math.floor(rand() * 20); // 65-85
    const light = 45 + Math.floor(rand() * 10); // 45-55
    const fg = `hsl(${hue} ${sat}% ${light}%)`;
    const bg = `hsl(${hue} 30% 96%)`;

    // 5x5 symmetric grid, fill left 3 columns and mirror
    const size = 5;
    const total = cellSize * size + padding * 2;
    const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < Math.ceil(size / 2); x++) {
            const v = rand() > 0.5;
            cells[y][x] = v;
            cells[y][size - 1 - x] = v;
        }
    }

    let rects = "";
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!cells[y][x]) continue;
            const rx = padding + x * cellSize;
            const ry = padding + y * cellSize;
            rects += `<rect x="${rx}" y="${ry}" width="${cellSize}" height="${cellSize}" />`;
        }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g fill="${fg}">${rects}</g>
</svg>`;

    const encoded = encodeURIComponent(svg)
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}
