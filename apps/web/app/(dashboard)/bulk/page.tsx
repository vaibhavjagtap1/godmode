'use client';

import { FormEvent, useState } from 'react';
import { apiPost } from '@/lib/api';

export default function BulkPage() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const emails = value.split(/\s|,|;/).filter(Boolean);
    const response = await apiPost('/api/v1/bulk', { emails });
    setResult(response as Record<string, unknown>);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-4 text-3xl font-semibold">Bulk Upload</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded border border-slate-700 bg-panel p-4">
        <textarea value={value} onChange={(event) => setValue(event.target.value)} className="h-40 w-full border border-slate-600 bg-transparent p-2" placeholder="one email per line" />
        <button className="border border-accent bg-accent/10 px-4 py-2 text-accent">Queue jobs</button>
      </form>
      {result ? <pre className="mt-4 overflow-auto rounded border border-slate-700 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre> : null}
    </div>
  );
}
