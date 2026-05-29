export interface LookupOptions {
  includePastes: boolean;
  includeContactLeaks: boolean;
  includeDuplicateCheck: boolean;
  includeGoogleFootprint: boolean;
}

export interface LookupRequest {
  email: string;
  options?: Partial<LookupOptions>;
}

export interface SocialAccount {
  platform: string;
  username: string;
  profileUrl: string;
  found: boolean;
  sensitive: boolean;
}

export interface RiskFactor {
  factor: string;
  points: number;
  detail: string;
}
