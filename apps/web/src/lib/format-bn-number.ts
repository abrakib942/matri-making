const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(value: string | number): string {
  return String(value).replace(/\d/g, d => BN_DIGITS[Number(d)] ?? d);
}

export function formatBnNumber(n: number, locale?: string): string {
  const formatted = n.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US');
  if (locale === 'bn') {
    return toBnDigits(formatted);
  }
  return formatted;
}

export function formatYear(year: number, locale?: string): string {
  return locale === 'bn' ? toBnDigits(year) : String(year);
}
