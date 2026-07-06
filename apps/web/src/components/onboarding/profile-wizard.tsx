'use client';

import { ProfileModeType } from '@/types/api';
import { ProfileSectionEditor } from '@/components/profile/profile-section-editor';

interface ProfileWizardProps {
  mode: ProfileModeType;
  editMode?: boolean;
  onComplete?: () => void;
}

/** Thin wrapper — tabbed section editor replaces the linear wizard. */
export function ProfileWizard({ mode, editMode, onComplete }: ProfileWizardProps) {
  return <ProfileSectionEditor mode={mode} loadFromMine={editMode} onComplete={onComplete} />;
}
