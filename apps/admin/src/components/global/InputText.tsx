import React, { FocusEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const InputTextField = (props: {
  type?: string;
  name: string;
  title: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
    type = null,
    name,
    title,
    placeholder,
    value,
    onChange,
    onBlur,
    isDisabled = false,
    errorMessage = '',
  } = props;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Input
        id={name}
        type={type ?? 'text'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
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

export default InputTextField;
