import type { ProfileDetail, ProfileMembership } from '@/types/profile';

export function unwrapMineProfile(data: unknown): ProfileDetail | null {
  if (!data) return null;

  const list = Array.isArray(data)
    ? data
    : ((data as { profiles?: unknown[] })?.profiles ?? [data]);

  if (!list.length) return null;

  const first = list[0] as ProfileMembership | ProfileDetail;
  if (first && typeof first === 'object' && 'profile' in first && first.profile) {
    return first.profile;
  }
  return first as ProfileDetail;
}
