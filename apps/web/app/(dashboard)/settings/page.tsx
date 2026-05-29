export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <section className="rounded border border-slate-700 bg-panel p-4">
        <h2 className="font-mono text-xs uppercase text-accent">API Keys</h2>
        <p className="mt-2 text-sm text-slate-300">Generate and revoke API keys for REST access.</p>
      </section>
      <section className="rounded border border-slate-700 bg-panel p-4">
        <h2 className="font-mono text-xs uppercase text-accent">Subscription</h2>
        <p className="mt-2 text-sm text-slate-300">Manage billing and plan upgrades through Stripe.</p>
      </section>
    </div>
  );
}
