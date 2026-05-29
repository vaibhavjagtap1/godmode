declare module 'node-whois' {
  interface LookupOptions {
    follow?: number;
    server?: string;
    timeout?: number;
    port?: number;
  }

  type Callback = (error: Error | null, data: string) => void;

  function lookup(query: string, options: LookupOptions, callback: Callback): void;

  export default {
    lookup
  };
}
