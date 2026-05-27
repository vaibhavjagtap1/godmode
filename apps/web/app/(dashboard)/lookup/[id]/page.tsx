'use client';

import { useEffect, useState } from 'react';
import { ExportBar } from '@/components/report/ExportBar';
import { ReportSection } from '@/components/report/ReportSection';
import { RiskScoreGauge } from '@/components/report/RiskScoreGauge';

export default function LookupReportPage({ params }: { params: { id: string } }) {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? window.localStorage.getItem('bte_user_id') ?? '' : '';
    fetch(`${apiBase}/api/v1/searches/${params.id}`, { headers: userId ? { 'x-user-id': userId } : {} })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.resultJson) {
          setPayload(data.resultJson as Record<string, unknown>);
        }
      });
  }, [apiBase, params.id]);

  const risk = (payload?.riskScore as { score?: number } | undefined)?.score ?? 0;
  const identityFlags = ((payload?.identity as { identityFlags?: unknown } | undefined)?.identityFlags ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-8 pb-24">
      <header className="rounded border border-slate-700 bg-panel p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Intelligence Report</p>
        <h1 className="mt-2 text-2xl font-semibold">Lookup {params.id}</h1>
      </header>

      <RiskScoreGauge score={risk} />

      <ReportSection title="Identity Overview">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.identity ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Professional Profile">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.professional ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Domain Intelligence">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.domain ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Data Breach Report">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.breaches ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Unofficial Leak & Paste Exposure">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.pastes ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Leaked Contact Information">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.contactLeaks ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Social Accounts">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.socialAccounts ?? [], null, 2)}</pre>
      </ReportSection>

      <ReportSection title="GitHub Deep Dive">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.github ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Identity Consistency Analysis">
        <pre className="overflow-auto text-xs">{JSON.stringify(identityFlags, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Google Footprint">
        <pre className="overflow-auto text-xs">{JSON.stringify(payload?.googleFootprint ?? {}, null, 2)}</pre>
      </ReportSection>

      <ReportSection title="Disclaimer">
        <p className="text-sm text-slate-300">This report contains only publicly available information. Use responsibly and in accordance with applicable laws.</p>
      </ReportSection>

      {payload ? <ExportBar id={params.id} payload={payload} /> : null}
    </div>
  );
}
