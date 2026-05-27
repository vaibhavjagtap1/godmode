export class ContactLeakService {
  redact(value: string): string {
    if (value.includes('@')) {
      const [name, domain] = value.split('@');
      return `${name.slice(0, 2)}***@${domain}`;
    }

    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return `${cleaned.slice(0, 3)}-XXXXX-${cleaned.slice(-3)}`;
    }

    return 'REDACTED';
  }

  sanitizeSnippet(snippet: string): string {
    return snippet.replace(/[<>]/g, '').slice(0, 150);
  }
}
