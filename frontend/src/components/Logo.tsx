import { useId } from "react";

export function Logo({ size = 28 }: { size?: number }) {
  const gId = useId();
  const pId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        {/* Dot grid pattern — same coords used for both dim background and bright lens fill */}
        <pattern id={pId} x="1" y="1" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="white" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="28" height="28" rx="7" fill={`url(#${gId})`} />

      {/* Faint dot grid across entire icon */}
      <rect width="28" height="28" rx="7" fill={`url(#${pId})`} opacity="0.18" />

      {/* Bright dot grid revealed inside the lens — same pattern, perfectly aligned */}
      <circle cx="12" cy="12" r="6.5" fill={`url(#${pId})`} opacity="0.92" />

      {/* Lens ring */}
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="white" strokeWidth="2.2" />

      {/* Handle — attaches at the 45° point on the ring */}
      <line x1="16.6" y1="16.6" x2="21.5" y2="21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
