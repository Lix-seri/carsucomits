export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-line p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
