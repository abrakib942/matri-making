'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface IImageSelectOption {
  value: string;
  imageUrl: string;
}

const ImageSelectSyncField = (props: {
  name: string;
  title: string;
  placeholder?: string;
  value?: string;
  options: IImageSelectOption[];
  setFieldValue: (name: string, value: any) => void;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
    name,
    title,
    placeholder,
    value,
    options,
    setFieldValue,
    isSearchable = false,
    isClearable = false,
    isDisabled = false,
    errorMessage = '',
  } = props;

  const handleValueChange = (newValue: string) => {
    setFieldValue(name, newValue || null);
  };

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Select value={value || ''} onValueChange={handleValueChange} disabled={isDisabled}>
        <SelectTrigger
          id={name}
          className={cn(errorMessage && 'border-destructive')}
          aria-describedby={`${name}-help`}
        >
          <SelectValue placeholder={placeholder || 'Select an option...'}>
            {selectedOption && (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedOption.imageUrl}
                  alt=""
                  className="h-6 w-6 object-cover rounded"
                />
                <span>{selectedOption.imageUrl}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option: IImageSelectOption) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={option.imageUrl} alt="" className="h-8 w-8 object-cover rounded" />
                <span>{option.imageUrl}</span>
              </div>
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

export default ImageSelectSyncField;
