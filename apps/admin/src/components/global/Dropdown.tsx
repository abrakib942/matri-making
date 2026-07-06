import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as _ from 'lodash';

export interface ISelectOption {
  parentValue?: number | string;
  value?: boolean | number | string;
  label: string;
}

const SelectSyncField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value?: string;
  options: ISelectOption[];
  isGroupOptions?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  parentValue?: string;
  setFieldValue: (name: string, value: any) => void;
  errorMessage?: string;
}) => {
  const {
    name,
    title,
    placeholder,
    value,
    options,
    isGroupOptions,
    isSearchable = false,
    isClearable = false,
    isDisabled = false,
    parentValue,
    setFieldValue,
    errorMessage = '',
  } = props;

  let tempOptions = [...options];
  if (parentValue != undefined && parentValue != null) {
    tempOptions = _.filter(options, (option: ISelectOption) => option.parentValue === parentValue);
  }

  // Group options if needed
  const groupedOptions = isGroupOptions
    ? _.groupBy(tempOptions, (option: ISelectOption) => option.parentValue || 'default')
    : null;

  const handleValueChange = (newValue: string) => {
    setFieldValue(name, newValue || null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Select value={value || ''} onValueChange={handleValueChange} disabled={isDisabled}>
        <SelectTrigger
          id={name}
          className={cn(errorMessage && 'border-destructive')}
          aria-describedby={`${name}-help`}
        >
          <SelectValue placeholder={placeholder || 'Select an option...'} />
        </SelectTrigger>
        <SelectContent>
          {isGroupOptions && groupedOptions
            ? Object.entries(groupedOptions).map(([groupKey, groupItems]) => (
                <SelectGroup key={groupKey}>
                  <SelectLabel>{groupKey !== 'default' ? groupKey : 'Options'}</SelectLabel>
                  {groupItems.map((option: ISelectOption) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            : tempOptions.map((option: ISelectOption) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
      {errorMessage && (
        <p id={`${name}-help`} className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default SelectSyncField;
