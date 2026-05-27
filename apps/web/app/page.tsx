import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">BehindTheEmail</p>
        <h1 className="text-4xl font-semibold">Email-to-Identity Intelligence Platform</h1>
        <p className="max-w-2xl text-slate-300">Investigate professional identity signals, breaches, social profiles, and risk posture from a single email address.</p>
      </header>
      <div className="flex gap-3">
        <Link href="/lookup" className="border border-accent bg-accent/10 px-4 py-2 text-accent">Start Lookup</Link>
        <Link href="/pricing" className="border border-slate-600 px-4 py-2">Pricing</Link>
      </div>
    </div>
  );
}
