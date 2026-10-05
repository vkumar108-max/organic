export function DetailList({ items, columns = 2 }: { items: { label: string; value: React.ReactNode }[]; columns?: 1 | 2 | 3 }) {
  const cols = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" }[columns];
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${cols}`}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{i.label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{i.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
