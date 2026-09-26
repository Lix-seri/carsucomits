/** A small daily bar chart with an accessible summary. Data is real; nothing is drawn when all zero. */
export function BarChart({ data, label, barClass = "fill-brand-500" }: { data: { day: string; count: number }[]; label: string; barClass?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((n, d) => n + d.count, 0);
  const w = 100 / data.length;
  return (
    <figure>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${label}: ${total} in the last ${data.length} days`} className="h-24 w-full">
        {data.map((d, i) => {
          const h = (d.count / max) * 36;
          return <rect key={d.day} x={i * w + w * 0.18} y={40 - Math.max(h, 0.8)} width={w * 0.64} height={Math.max(h, 0.8)} rx="0.8" className={d.count ? barClass : "fill-line"} />;
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-muted">
        <span>{new Date(data[0].day).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
        <span>Today</span>
      </figcaption>
    </figure>
  );
}
