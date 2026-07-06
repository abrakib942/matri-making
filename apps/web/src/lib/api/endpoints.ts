import { api, apiDelete, apiGet, apiPost, apiPut } from './client';
import type {
  AuthTokens,
  AuthUser,
  EnumCatalog,
  LocationItem,
  PlanItem,
  PublicStats,
} from '@/types/api';

export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    preferredLanguage?: string;
  }) => apiPost<{ email: string; requiresVerification: boolean }>('/api/v1/auth/register', body),

  verifyOtp: (body: { email: string; otp: string; purpose: string }) =>
    apiPost<AuthTokens & { user: AuthUser }>('/api/v1/auth/verify-otp', body),

  resendOtp: (body: { email: string; purpose: string }) => apiPost('/api/v1/auth/resend-otp', body),

  signIn: (body: { email: string; password: string }) =>
    apiPost<AuthTokens & { user: AuthUser }>('/api/v1/auth/sign-in', body),

  signOut: (refreshToken: string) => apiPost('/api/v1/auth/sign-out', { refreshToken }),

  forgotPassword: (email: string) => apiPost('/api/v1/auth/forgot-password', { email }),

  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    apiPost('/api/v1/auth/reset-password', body),
};

export const metaApi = {
  getEnums: (lang: string) => apiGet<EnumCatalog>(`/api/v1/meta/enums?lang=${lang}`),
  getLocations: (type?: string, parentId?: number) =>
    apiGet<LocationItem[]>('/api/v1/meta/locations', { type, parentId }),
  getPlans: () => apiGet<{ plans: PlanItem[]; packages: PlanItem[] }>('/api/v1/meta/plans'),
  getStats: () => apiGet<PublicStats>('/api/v1/meta/stats'),
};

export const profileApi = {
  create: (body: {
    mode: string;
    gender: string;
    dateOfBirth: string;
    fullName?: string;
    relationship?: string;
    maritalStatus?: string;
  }) => apiPost<{ id: number }>('/api/v1/profiles', body),
  getMine: () => apiGet('/api/v1/profiles/mine'),
  getById: (id: number) => apiGet(`/api/v1/profiles/${id}`),
  update: (id: number, body: Record<string, unknown>) => apiPut(`/api/v1/profiles/${id}`, body),
  updateIslamic: (id: number, body: Record<string, unknown>) =>
    apiPut(`/api/v1/profiles/${id}/islamic-details`, body),
  updateGeneral: (id: number, body: Record<string, unknown>) =>
    apiPut(`/api/v1/profiles/${id}/general-details`, body),
  updatePreference: (id: number, body: Record<string, unknown>) =>
    apiPut(`/api/v1/profiles/${id}/preference`, body),
  updatePrivacy: (id: number, body: Record<string, unknown>) =>
    apiPut(`/api/v1/profiles/${id}/privacy`, body),
  submit: (id: number) => apiPost(`/api/v1/profiles/${id}/submit`),
};

export const searchApi = {
  search: (body: Record<string, unknown>) =>
    apiPost<{ items: unknown[]; nextCursor: number | null }>('/api/v1/search/profiles', body),
};

export const dashboardApi = {
  get: () => apiGet('/api/v1/dashboard'),
};

export const interestApi = {
  send: (body: { toProfileId: number; message?: string }) => apiPost('/api/v1/interests', body),
  list: (direction?: string) => apiGet('/api/v1/interests', { direction }),
  respond: (id: number, action: 'ACCEPT' | 'REJECT') =>
    apiPut(`/api/v1/interests/${id}/respond`, { action }),
  shortlist: (profileId: number) => apiPost(`/api/v1/profiles/${profileId}/shortlist`),
  removeShortlist: (profileId: number) => apiDelete(`/api/v1/profiles/${profileId}/shortlist`),
  favourite: (profileId: number) => apiPost(`/api/v1/profiles/${profileId}/favourite`),
  listShortlist: () => apiGet('/api/v1/me/shortlist'),
  listFavourites: () => apiGet('/api/v1/me/favourites'),
  listVisitors: () => apiGet('/api/v1/me/visitors'),
};

export const intelligenceApi = {
  recommendations: () => apiGet('/api/v1/recommendations'),
  compatibility: (profileId: number) => apiGet(`/api/v1/profiles/${profileId}/compatibility`),
  readiness: (profileId: number) => apiGet(`/api/v1/profiles/${profileId}/readiness`),
  insights: () => apiGet('/api/v1/me/insights'),
};

export const paymentApi = {
  wallet: () => apiGet('/api/v1/me/wallet'),
  entitlements: () => apiGet('/api/v1/me/entitlements'),
  createOrder: (body: { type: string; itemKey: string }) => apiPost('/api/v1/orders', body),
  unlock: (profileId: number, type: string) =>
    apiPost(`/api/v1/profiles/${profileId}/unlock`, { type }),
  listUnlocks: () => apiGet('/api/v1/me/unlocks'),
  listOrders: () => apiGet('/api/v1/orders'),
};

export const notificationApi = {
  list: (cursor?: number) => apiGet('/api/v1/notifications', { cursor }),
  unreadCount: () => apiGet('/api/v1/notifications/unread-count'),
  markRead: (id: number) => apiPut(`/api/v1/notifications/${id}/read`),
  markAllRead: () => apiPut('/api/v1/notifications/read-all'),
};

export const journeyApi = {
  list: () => apiGet('/api/v1/journeys'),
  updateStage: (id: number, stage: string) => apiPut(`/api/v1/journeys/${id}/stage`, { stage }),
};

export const verificationApi = {
  list: () => apiGet('/api/v1/me/verifications'),
  submit: (body: { type: string; evidenceUrl?: string }) => apiPost('/api/v1/verifications', body),
};

export const ticketApi = {
  list: () => apiGet('/api/v1/me/tickets'),
  create: (body: { subject: string; message: string }) => apiPost('/api/v1/tickets', body),
};

export const contentApi = {
  successStories: () => apiGet('/api/v1/success-stories'),
  cmsPage: (slug: string) => apiGet(`/api/v1/cms/${slug}`),
};
