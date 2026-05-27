'use client';

import { exportPdf } from '@/lib/export/pdf';
import { exportXlsx } from '@/lib/export/xlsx';

export function ExportBar({ id, payload }: { id: string; payload: Record<string, unknown> }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-700 bg-background/95 p-3">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        <span className="font-mono text-accent">Export Report:</span>
        <button className="border border-slate-600 px-3 py-1" onClick={() => exportPdf(id, payload)}>PDF</button>
        <button className="border border-slate-600 px-3 py-1" onClick={() => exportXlsx(id, payload)}>XLSX</button>
        <button
          className="border border-slate-600 px-3 py-1"
          onClick={() => {
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `${id}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 250);
          }}
        >
          JSON
        </button>
      </div>
    </div>
  );
}
