'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import React from 'react';
import { ISelectOption } from './Dropdown';

export interface IMultiSelectOption extends ISelectOption {
  items?: { value: boolean | number | string; label: string }[];
}

const MultiSelectSyncField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value?: string | string[];
  options: IMultiSelectOption[];
  isGroupOptions?: boolean;
  setFieldValue: (name: string, value: any) => void;
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
    name,
    title,
    placeholder,
    value,
    options,
    isGroupOptions,
    setFieldValue,
    isDisabled = false,
    errorMessage = '',
  } = props;

  const [open, setOpen] = React.useState(false);
  const selectedValues = (Array.isArray(value) ? value : value ? [value] : []).map(String);

  const handleSelect = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    setFieldValue(name, newValues);
  };

  const handleRemove = (optionValue: string) => {
    const newValues = selectedValues.filter(v => v !== optionValue);
    setFieldValue(name, newValues);
  };

  const selectedOptions = options.filter(opt => selectedValues.includes(String(opt.value)));

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              errorMessage && 'border-destructive',
              isDisabled && 'opacity-50 cursor-not-allowed',
            )}
            disabled={isDisabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder || 'Select options...'}</span>
              ) : selectedOptions.length <= 5 ? (
                selectedOptions.map(opt => (
                  <Badge key={String(opt.value)} variant="secondary" className="gap-1">
                    {opt.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemove(String(opt.value));
                      }}
                    />
                  </Badge>
                ))
              ) : (
                <span>{selectedOptions.length} items selected</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map(option => {
                  const isSelected = selectedValues.includes(String(option.value));
                  return (
                    <CommandItem
                      key={String(option.value)}
                      value={String(option.value)}
                      onSelect={() => handleSelect(String(option.value))}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errorMessage && (
        <p id={`${name}-help`} className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default MultiSelectSyncField;
