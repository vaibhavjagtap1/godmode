export function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-700 bg-panel p-4">
      <h2 className="mb-3 font-mono text-sm uppercase text-accent">{title}</h2>
      {children}
    </section>
  );
}
