const plans = [
  { name: 'FREE', price: '$0', limit: '5 searches/day' },
  { name: 'PLUS', price: '$14.99/mo', limit: '100 searches/day' },
  { name: 'PRO', price: '$29.99/mo', limit: '200 searches/day + bulk + API' },
  { name: 'ENTERPRISE', price: 'Custom', limit: 'Unlimited + SLA' }
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-semibold">Pricing</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded border border-slate-700 bg-panel p-4">
            <p className="font-mono text-xs text-accent">{plan.name}</p>
            <p className="mt-2 text-2xl font-semibold">{plan.price}</p>
            <p className="mt-1 text-sm text-slate-300">{plan.limit}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
