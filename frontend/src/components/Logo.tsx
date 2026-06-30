import { useId } from "react";

export function Logo({ size = 28 }: { size?: number }) {
  const gradientId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a8cff" />
          <stop offset="100%" stopColor="#0040c1" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="7" fill={`url(#${gradientId})`} />
      {/* < bracket */}
      <path d="M10 9L6 14L10 19" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      {/* / slash */}
      <path d="M14.5 9L12.5 19" stroke="white" strokeWidth="2.1" strokeLinecap="round" />
      {/* > bracket */}
      <path d="M17 9L21 14L17 19" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
