'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import _ from 'lodash';
import React, { useState } from 'react';
import { ISelectOption } from './Dropdown';

const SelectASyncField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value?: string;
  options: ISelectOption[];
  loadOptions: (searchKey: string) => void;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  setFieldValue: (name: string, value: any) => void;
  errorMessage?: string;
}) => {
  const {
    name,
    title,
    placeholder,
    value,
    options,
    loadOptions,
    isSearchable = false,
    isClearable = false,
    isDisabled = false,
    setFieldValue,
    errorMessage = '',
  } = props;

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = React.useMemo(
    () =>
      _.debounce((searchKey: string) => {
        if (searchKey.length > 2) {
          loadOptions(searchKey);
        }
      }, 500),
    [loadOptions],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchKey = e.target.value;
    setSearchTerm(searchKey);
    if (isSearchable) {
      debouncedSearch(searchKey);
    }
  };

  const handleValueChange = (newValue: string) => {
    setFieldValue(name, newValue || null);
  };

  const displayOptions =
    options.length === 0 ? [{ value: '', label: 'Enter something to search...' }] : options;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      {isSearchable && (
        <Input
          placeholder="Type to search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-2"
        />
      )}
      <Select value={value || ''} onValueChange={handleValueChange} disabled={isDisabled}>
        <SelectTrigger
          id={name}
          className={cn(errorMessage && 'border-destructive')}
          aria-describedby={`${name}-help`}
        >
          <SelectValue placeholder={placeholder || 'Select an option...'} />
        </SelectTrigger>
        <SelectContent>
          {displayOptions.map((option: ISelectOption) => (
            <SelectItem
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.value === ''}
            >
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

export default SelectASyncField;
