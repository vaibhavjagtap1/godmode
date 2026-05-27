export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
      <form className="space-y-3 rounded border border-slate-700 bg-panel p-4">
        <input className="w-full border border-slate-600 bg-transparent p-2" placeholder="Email" type="email" />
        <input className="w-full border border-slate-600 bg-transparent p-2" placeholder="Password" type="password" />
        <button className="w-full border border-accent bg-accent/10 p-2 text-accent" type="submit">Sign in</button>
      </form>
    </div>
  );
}
