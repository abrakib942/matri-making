import React, { FocusEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TextAreaField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
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
      <Textarea
        id={name}
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

export default TextAreaField;
