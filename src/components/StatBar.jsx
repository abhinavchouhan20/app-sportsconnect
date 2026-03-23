export default function StatBar({ label, value, accent = "bg-brand-teal" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${accent}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}
