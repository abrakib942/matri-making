'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { formatTimeForSubmit, normalizeTimeForInput } from '../../utils/date';

const InputTimeField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value: string | null;
  setFieldValue: (field: string, value: string | null) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  isDisabled?: boolean;
  errorMessage?: string;
  step?: number;
}) => {
  const {
    name,
    title,
    placeholder,
    value,
    setFieldValue,
    setFieldTouched,
    isDisabled = false,
    errorMessage = '',
    step = 60,
  } = props;

  const [displayValue, setDisplayValue] = useState(() => normalizeTimeForInput(value));

  useEffect(() => {
    setDisplayValue(normalizeTimeForInput(value));
  }, [value]);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Input
        id={name}
        type="time"
        name={name}
        placeholder={placeholder}
        value={displayValue}
        step={step}
        onChange={e => {
          const nextValue = formatTimeForSubmit(e.target.value);
          setDisplayValue(normalizeTimeForInput(e.target.value));
          setFieldValue(name, nextValue);
          setFieldTouched(name, true);
        }}
        onBlur={() => setFieldTouched(name, true)}
        disabled={isDisabled}
        className={cn(errorMessage && 'border-destructive')}
        aria-describedby={`${name}-help`}
      />
      {errorMessage && (
        <p id={`${name}-help`} className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputTimeField;
