export default function ApiDocsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  return (
    <iframe
      title="API Docs"
      src={`${apiBase}/api/v1/docs`}
      className="h-screen w-full border-0"
    />
  );
}
