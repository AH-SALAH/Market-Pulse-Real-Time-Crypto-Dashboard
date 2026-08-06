// Pulse Candles mark — matches public/favicon.svg so the header logo and site
// icon stay visually identical.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logomark-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="logomark-candles" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="logomark-pulse" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="15" fill="url(#logomark-tile)" />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="14.25"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="1.5"
      />

      <g strokeLinecap="round">
        <line x1="16" y1="40" x2="16" y2="50" stroke="#34d399" strokeWidth="2.5" />
        <line x1="29" y1="35" x2="29" y2="50" stroke="#34d399" strokeWidth="2.5" />
        <line x1="42" y1="29" x2="42" y2="50" stroke="#34d399" strokeWidth="2.5" />
      </g>

      <g fill="url(#logomark-candles)">
        <rect x="13" y="43" width="6" height="5" rx="1.5" />
        <rect x="26" y="38" width="6" height="10" rx="1.5" />
        <rect x="39" y="32" width="6" height="16" rx="1.5" />
      </g>

      <path
        d="M4,44 L13,44 L16,40 L19,44 L26,44 L29,35 L32,44 L39,44 L42,29 L45,44 L51,44 L55,38 L60,38"
        fill="none"
        stroke="url(#logomark-pulse)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="60" cy="38" r="4.5" fill="#22d3ee" opacity="0.25" />
      <circle cx="60" cy="38" r="2.25" fill="#ecfeff" />
    </svg>
  );
}
