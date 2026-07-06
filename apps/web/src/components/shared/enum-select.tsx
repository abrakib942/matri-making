'use client';

import { Label } from '@/components/ui/label';
import { useEnums } from '@/lib/providers/enum-provider';
import { cn } from '@/lib/utils';

interface EnumSelectProps {
  category: string;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function EnumSelect({
  category,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  className,
  disabled,
  required,
}: EnumSelectProps) {
  const { catalog, isLoading } = useEnums();
  const options = catalog[category] ?? [];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || isLoading}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
