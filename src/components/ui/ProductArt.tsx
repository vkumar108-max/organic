import type { ProductTone } from "@/types";

/**
 * Generated placeholder artwork so the site looks complete before real photos
 * exist. Rendered whenever an image `src` is null. Not a product photograph.
 */
const palettes: Record<ProductTone, { bg1: string; bg2: string; body: string; lid: string; accent: string }> = {
  fruit: { bg1: "#fff3e0", bg2: "#ffe0b2", body: "#f6b04a", lid: "#7a4a1d", accent: "#e8743b" },
  leaf: { bg1: "#e8f5e9", bg2: "#c8e6c9", body: "#5fa564", lid: "#245c2f", accent: "#2d7439" },
  vegetable: { bg1: "#fdeaf1", bg2: "#f8c9db", body: "#c2456f", lid: "#5a1f36", accent: "#8c2d4f" },
  combo: { bg1: "#f3ece0", bg2: "#e6d9c2", body: "#b7794a", lid: "#4a3320", accent: "#3f8f4a" },
  tablet: { bg1: "#e8f1f7", bg2: "#c7dcea", body: "#4d8fb5", lid: "#1f4a66", accent: "#f2f2ec" },
  dry: { bg1: "#f4efe0", bg2: "#e5dbb8", body: "#a8874a", lid: "#4b3a18", accent: "#6f8f3a" },
};

export function ProductArt({ tone, label, variant = 0, className }: { tone: ProductTone; label?: string; variant?: number; className?: string }) {
  const p = palettes[tone];
  const id = `${tone}-${variant}`;
  const shift = [0, 14, -10, 6][variant % 4];
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={label ?? "Product placeholder image"} className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg1} />
          <stop offset="1" stopColor={p.bg2} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#bg-${id})`} />
      <circle cx={320 + shift} cy="90" r="70" fill="#fff" opacity=".35" />
      <ellipse cx="200" cy="345" rx="112" ry="16" fill="#000" opacity=".1" />
      {tone === "tablet" ? (
        <g>
          <rect x="130" y="130" width="140" height="205" rx="22" fill={p.body} />
          <rect x="140" y="92" width="120" height="48" rx="12" fill={p.lid} />
          <rect x="150" y="192" width="100" height="70" rx="10" fill="#fff" opacity=".9" />
          <circle cx="86" cy="330" r="16" fill="#fff" stroke={p.lid} strokeWidth="3" />
          <circle cx="322" cy="322" r="16" fill="#fff" stroke={p.lid} strokeWidth="3" />
        </g>
      ) : (
        <g>
          <path d="M112 150c0-14 10-24 24-24h128c14 0 24 10 24 24l-14 178c-1 12-11 20-23 20H149c-12 0-22-8-23-20L112 150Z" fill={p.body} />
          <rect x="128" y="92" width="144" height="40" rx="10" fill={p.lid} />
          <rect x="136" y="180" width="128" height="94" rx="12" fill="#fff" opacity=".92" />
          <path d={`M170 240c0-22 14-36 36-36 0 24-14 38-36 38Z`} fill={p.accent} />
          <path d="M172 244c6-10 14-18 24-24" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="216" y="204" width="34" height="6" rx="3" fill={p.lid} opacity=".6" />
          <rect x="216" y="220" width="26" height="6" rx="3" fill={p.lid} opacity=".35" />
        </g>
      )}
      {tone === "combo" && (
        <g opacity=".95">
          <rect x="50" y="215" width="64" height="120" rx="12" fill={p.accent} />
          <rect x="290" y="230" width="64" height="105" rx="12" fill={p.lid} />
        </g>
      )}
      {variant === 2 && <ellipse cx="200" cy="352" rx="70" ry="12" fill={p.body} opacity=".5" />}
    </svg>
  );
}
