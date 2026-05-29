'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function LookupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiPost<{ meta: { lookupId: string } }>('/api/v1/lookup', { email, options: { includePastes: true, includeContactLeaks: true, includeDuplicateCheck: true, includeGoogleFootprint: true } });
      router.push(`/lookup/${result.meta.lookupId}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold">Lookup</h1>
      <form onSubmit={onSubmit} className="rounded border border-slate-700 bg-panel p-4">
        <label className="mb-2 block font-mono text-xs uppercase text-accent">Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-slate-600 bg-transparent p-2" placeholder="target@company.com" />
        <button disabled={loading} className="mt-3 border border-accent bg-accent/10 px-4 py-2 text-accent">
          {loading ? 'Scanning...' : 'Start Scan'}
        </button>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </form>
    </div>
  );
}
