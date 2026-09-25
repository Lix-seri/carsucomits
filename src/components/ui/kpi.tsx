export function Kpi({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
