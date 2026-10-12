import type { ArticleListResponse, ContactAccepted, ContactPayload } from '@datagateways/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export type ContactErrorKind = 'rateLimited' | 'generic';

export interface PartnerApplicationPayload {
  readonly companyName: string;
  readonly companyWebsite?: string;
  readonly region: string;
  readonly country: string;
  readonly contactName: string;
  readonly workEmail: string;
  readonly phone: string;
  readonly companySize: string;
  readonly businessDescription?: string;
}

export interface PartnerApplicationAccepted {
  readonly data: { readonly id: string };
  readonly emailSent: boolean;
  readonly emailError?: string;
}

export interface PublicPartner {
  readonly id: string;
  readonly company: string;
  readonly region: string;
  readonly country: string | null;
  readonly focusArea: string;
  readonly tier: 'Bronze' | 'Silver' | 'Gold';
  readonly logoUrl: string | null;
}

export class ContactError extends Error {
  constructor(readonly kind: ContactErrorKind) {
    super(kind);
    this.name = 'ContactError';
  }
}

const postJson = async <TResponse>(path: string, payload: unknown): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) throw new ContactError('rateLimited');
  if (!response.ok) throw new ContactError('generic');

  return (await response.json()) as TResponse;
};

export const postContact = (payload: ContactPayload): Promise<ContactAccepted> =>
  postJson<ContactAccepted>('/api/contact', payload);

export const postPartnerApplication = (
  payload: PartnerApplicationPayload,
): Promise<PartnerApplicationAccepted> =>
  postJson<PartnerApplicationAccepted>('/api/public/partner-requests', payload);

export const fetchPublicPartners = async (): Promise<readonly PublicPartner[]> => {
  const response = await fetch(`${API_BASE_URL}/api/public/partners`, {
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Partner directory request failed with ${response.status}`);

  const result = (await response.json()) as { data: readonly PublicPartner[] };
  return result.data;
};

export const fetchArticles = async (category?: string): Promise<ArticleListResponse> => {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/resources${query}`);

  if (!response.ok) throw new Error(`Resources request failed with ${response.status}`);

  return (await response.json()) as ArticleListResponse;
};
