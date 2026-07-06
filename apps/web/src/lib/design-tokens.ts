export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  intro: 'shadow-[0_8px_32px_rgba(60,40,100,0.06)] hover:shadow-[0_16px_48px_rgba(60,40,100,0.1)] transition-all duration-300',
} as const;

export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

export const sectionSpacing = {
  sm: 'py-16 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-28 md:py-36',
} as const;

export const brand = {
  primary: 'hsl(258 48% 48%)',
  accent: 'hsl(12 72% 58%)',
  surface: 'hsl(36 28% 97%)',
} as const;
