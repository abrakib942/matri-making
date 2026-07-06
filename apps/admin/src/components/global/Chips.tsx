import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChipsField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value?: string[];
  setFieldValue: (name: string, value: any) => void;
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
    name,
    title,
    placeholder,
    value = [],
    setFieldValue,
    isDisabled = false,
    errorMessage = '',
  } = props;
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newValue = [...value, inputValue.trim()];
      setFieldValue(name, newValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const newValue = value.slice(0, -1);
      setFieldValue(name, newValue);
    }
  };

  const removeChip = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    setFieldValue(name, newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <div
        className={cn(
          'flex flex-wrap gap-2 p-2 border rounded-md min-h-[2.5rem]',
          errorMessage && 'border-destructive',
        )}
      >
        {value.map((chip, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {chip}
            {!isDisabled && (
              <button
                type="button"
                onClick={() => removeChip(index)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          id={name}
          name={name}
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 min-w-[120px]"
        />
      </div>
      {errorMessage && (
        <p id={`${name}-help`} className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default ChipsField;
