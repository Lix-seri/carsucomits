/** A circular progress mark with the percentage in the middle. */
export function ProgressRing({ value, size = 72, label }: { value: number; size?: number; label: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="img" aria-label={`${label}: ${pct}%`} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth="7" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke="rgb(var(--c-brand-500))" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-lg font-extrabold tabular">{pct}%</span>
    </div>
  );
}
