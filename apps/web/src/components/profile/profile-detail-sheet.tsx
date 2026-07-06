'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProfileFieldRow, useFieldFormatter } from './profile-field-row';
import { ProfileSectionCard } from './profile-section-card';
import {
  getVisibleSections,
  isFieldLocked,
  isFieldVisible,
  shouldShowFieldInView,
  type SectionId,
} from './profile-sections';
import { useProfileLocationNames } from '@/hooks/use-profile-location-names';
import type { ProfileDetail } from '@/types/profile';
import { cn } from '@/lib/utils';

const STICKY_NAV_OFFSET = 112;

interface Props {
  profile: ProfileDetail;
  showSectionNav?: boolean;
  showRequiredFields?: boolean;
  includePrivacy?: boolean;
  previewAsOwner?: boolean;
  className?: string;
}

export function ProfileDetailSheet({
  profile,
  showSectionNav = true,
  showRequiredFields = true,
  includePrivacy = false,
  previewAsOwner = false,
  className,
}: Props) {
  const t = useTranslations('profile');
  const locationNames = useProfileLocationNames(profile);
  const format = useFieldFormatter(locationNames);
  const [activeSection, setActiveSection] = useState<SectionId>('basics');
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  const scrollingToRef = useRef<SectionId | null>(null);

  const sections = useMemo(
    () => getVisibleSections(profile, { includePrivacy }),
    [profile, includePrivacy],
  );

  const access = profile.access;
  const primaryPhoto = profile.media?.find(m => m.isPrimary && m.type === 'PHOTO');
  const canShowPhoto = access?.isManager || access?.canViewPhoto;
  const photoUrl =
    canShowPhoto && primaryPhoto
      ? access?.photoBlurredOnly
        ? primaryPhoto.blurredUrl
        : primaryPhoto.url
      : null;

  const fieldVisible = useCallback(
    (field: (typeof sections)[0]['fields'][0], raw: unknown, locked: boolean) =>
      shouldShowFieldInView(field, raw, locked, showRequiredFields),
    [showRequiredFields],
  );

  const renderSection = (sectionId: SectionId) => {
    if (sectionId === 'media') {
      if (!photoUrl) return null;
      return (
        <ProfileSectionCard
          key="media"
          id="media"
          title={t('sections.media')}
          className="scroll-mt-28"
          ref={el => {
            sectionRefs.current.media = el;
          }}
        >
          <div className="py-3">
            <div className="relative aspect-[3/4] max-w-xs rounded-xl overflow-hidden bg-muted">
              <Image src={photoUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          </div>
        </ProfileSectionCard>
      );
    }

    const section = sections.find(s => s.id === sectionId);
    if (!section) return null;

    const rows = section.fields
      .filter(f => isFieldVisible(f, profile))
      .map(field => {
        const raw = field.getValue(profile);
        const locked = isFieldLocked(field, access, previewAsOwner);
        if (!fieldVisible(field, raw, locked)) return null;

        const value = locked ? '' : format(field, raw);

        return (
          <ProfileFieldRow
            key={field.key}
            label={t(`fields.${field.key}`)}
            value={value}
            locked={locked}
            showEmpty={showRequiredFields && !!field.required}
          />
        );
      })
      .filter(Boolean);

    if (!rows.length && sectionId !== 'basics') return null;

    return (
      <ProfileSectionCard
        key={sectionId}
        id={sectionId}
        title={t(`sections.${sectionId}`)}
        className="scroll-mt-28"
        ref={el => {
          sectionRefs.current[sectionId] = el;
        }}
      >
        {rows}
      </ProfileSectionCard>
    );
  };

  const visibleSectionIds = sections
    .filter(s => s.id !== 'privacy' || includePrivacy)
    .map(s => s.id)
    .filter(id => {
      if (id === 'media') return !!photoUrl;
      const section = sections.find(s => s.id === id);
      if (!section) return false;
      return section.fields.some(f => {
        if (!isFieldVisible(f, profile)) return false;
        const raw = f.getValue(profile);
        const locked = isFieldLocked(f, access, previewAsOwner);
        return fieldVisible(f, raw, locked);
      });
    });

  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id];
    if (!el) return;

    scrollingToRef.current = id;
    setActiveSection(id);

    const top = el.getBoundingClientRect().top + window.scrollY - STICKY_NAV_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });

    window.setTimeout(() => {
      scrollingToRef.current = null;
    }, 600);
  }, []);

  useEffect(() => {
    if (!showSectionNav || visibleSectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        if (scrollingToRef.current) return;

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        const top = visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as SectionId);
        }
      },
      {
        root: null,
        rootMargin: `-${STICKY_NAV_OFFSET}px 0px -55% 0px`,
        threshold: 0,
      },
    );

    for (const id of visibleSectionIds) {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [showSectionNav, visibleSectionIds]);

  return (
    <div ref={scrollRootRef} className={cn('space-y-4', className)}>
      {showSectionNav && visibleSectionIds.length > 0 && (
        <nav className="sticky top-16 z-20 -mx-1 px-1 py-2 bg-background/90 backdrop-blur-md border-b border-border/40">
          <div className="flex flex-wrap gap-2">
            {visibleSectionIds.map(id => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={cn(
                  'chip-filter whitespace-nowrap',
                  activeSection === id && 'chip-filter-active',
                )}
              >
                {t(`sections.${id}`)}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="space-y-4">{visibleSectionIds.map(id => renderSection(id))}</div>
    </div>
  );
}
