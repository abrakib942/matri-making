'use client';

import { useTranslations } from 'next-intl';
import { useEnums } from '@/lib/providers/enum-provider';
import type { FieldDef } from './profile-sections';
import { calcAge } from './profile-sections';
import { cn } from '@/lib/utils';

interface FormatContext {
  label: (category: string, value?: string | null) => string;
  t: ReturnType<typeof useTranslations>;
  locationNames?: Record<number, string>;
}

export function formatFieldValue(field: FieldDef, raw: unknown, ctx: FormatContext): string {
  if (raw === null || raw === undefined || raw === '') return '';

  switch (field.type) {
    case 'boolean':
      return raw === true ? ctx.t('yes') : raw === false ? ctx.t('no') : '';
    case 'enum':
      return ctx.label(field.enumCategory ?? field.key, String(raw));
    case 'tags': {
      const arr = Array.isArray(raw) ? raw : [raw];
      if (field.enumCategory) {
        return arr.map(v => ctx.label(field.enumCategory!, String(v))).join(', ');
      }
      if (field.key === 'divisionIds' || field.key === 'districtIds') {
        return arr.map(id => ctx.locationNames?.[Number(id)] ?? String(id)).join(', ');
      }
      return arr.map(String).join(', ');
    }
    case 'locationId':
      return ctx.locationNames?.[Number(raw)] ?? '';
    case 'income':
      return raw ? `৳ ${Number(raw).toLocaleString()}` : '';
    case 'age': {
      const age = calcAge(String(raw));
      return age != null ? `${age} ${ctx.t('years')}` : '';
    }
    case 'number':
      return String(raw);
    case 'textarea':
    case 'text':
    case 'date':
    default:
      return String(raw);
  }
}

interface Props {
  label: string;
  value?: string;
  locked?: boolean;
  showEmpty?: boolean;
  className?: string;
}

export function ProfileFieldRow({ label, value, locked, showEmpty, className }: Props) {
  const t = useTranslations('profile');

  if (!locked && !value && !showEmpty) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-[minmax(140px,38%)_1fr] gap-1 sm:gap-4 py-2.5 border-b border-border/40 last:border-0',
        className,
      )}
    >
      <dt className="text-sm text-muted-foreground font-medium">{label}</dt>
      <dd className="text-sm text-foreground">
        {locked ? (
          <span className="text-muted-foreground italic">{t('fieldLocked')}</span>
        ) : (
          <span className="whitespace-pre-wrap">{value || t('notProvided')}</span>
        )}
      </dd>
    </div>
  );
}

export function useFieldFormatter(locationNames?: Record<number, string>) {
  const t = useTranslations('profile');
  const { label } = useEnums();

  return (field: FieldDef, raw: unknown) =>
    formatFieldValue(field, raw, { label, t, locationNames });
}
