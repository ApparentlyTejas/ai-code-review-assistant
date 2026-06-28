const ICON_PROPS = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ConnectIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="7" cy="12" r="3.2" />
      <circle cx="17" cy="12" r="3.2" />
      <line x1="10.2" y1="12" x2="13.8" y2="12" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5.5" y="11" width="13" height="9" rx="2.2" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </svg>
  );
}
