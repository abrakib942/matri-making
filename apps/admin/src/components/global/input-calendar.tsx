'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { DATE_FORMAT } from '../../utils/date';

const InputDateField = (props: {
  type?: string;
  name: string;
  title: string;
  placeholder?: string;
  value: string | string[];
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  setFieldError: (field: string, value: string) => void;
  isRange?: boolean;
  isMultiple?: boolean;
  minDate?: Date;
  maxDate?: Date;
  enabledDates?: Date[];
  notEnabledDateSelectionErrorMessage?: string;
  disabledDates?: Date[];
  isDisabled?: boolean;
  errorMessage?: string;
}) => {
  const {
    type = null,
    name,
    title,
    placeholder,
    value,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    isRange,
    isMultiple,
    minDate,
    maxDate,
    enabledDates,
    notEnabledDateSelectionErrorMessage,
    disabledDates,
    isDisabled = false,
    errorMessage = '',
  } = props;

  let tempValue: Date | Date[] | undefined = undefined;
  if (!isRange && !isMultiple && typeof value === 'string') {
    tempValue = !value ? undefined : moment(value, DATE_FORMAT.DATETIME_SERVER).toDate();
  } else if (Array.isArray(value)) {
    tempValue = value.map((element: string) =>
      moment(element, DATE_FORMAT.DATETIME_SERVER).toDate(),
    );
  }

  const [date, setDate] = useState<Date | Date[] | undefined>(tempValue);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setFieldValue(name, null);
      setFieldTouched(name, true);
      return;
    }

    if (enabledDates) {
      const isEnabled = enabledDates.some(
        enabledDate =>
          enabledDate.getDate() === selectedDate.getDate() &&
          enabledDate.getMonth() === selectedDate.getMonth() &&
          enabledDate.getFullYear() === selectedDate.getFullYear(),
      );

      if (!isEnabled) {
        setFieldError(
          name,
          notEnabledDateSelectionErrorMessage ||
            'This date is not available for selection or is not within the allowed dates.',
        );
        return;
      }
    }

    const formattedDate = new Date(
      moment(selectedDate).format(DATE_FORMAT.YEAR_MM_DD),
    ).toISOString();
    setFieldValue(name, formattedDate);
    setFieldTouched(name, true);
    setDate(selectedDate);
  };

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range || !range.from) {
      setFieldValue(name, null);
      setFieldTouched(name, true);
      return;
    }

    const dates = [range.from];
    if (range.to) dates.push(range.to);

    const formattedDates = dates.map((d: Date) => {
      const formattedDate = moment(d).format(DATE_FORMAT.YEAR_MM_DD);
      return new Date(formattedDate).toISOString();
    });

    setFieldValue(name, formattedDates);
    setFieldTouched(name, true);
    setDate(range.to ? [range.from, range.to] : range.from);
  };

  const isDateDisabled = (date: Date) => {
    if (disabledDates) {
      return disabledDates.some(
        disabledDate =>
          disabledDate.getDate() === date.getDate() &&
          disabledDate.getMonth() === date.getMonth() &&
          disabledDate.getFullYear() === date.getFullYear(),
      );
    }
    return false;
  };

  const displayValue = () => {
    if (isRange && Array.isArray(date)) {
      if (date.length === 2 && date[0] && date[1]) {
        return `${format(date[0], 'PPP')} - ${format(date[1], 'PPP')}`;
      }
      return date[0] ? format(date[0], 'PPP') : placeholder || 'Pick a date range';
    }
    if (date instanceof Date) {
      return format(date, 'PPP');
    }
    return placeholder || 'Pick a date';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{title}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              errorMessage && 'border-destructive',
              isDisabled && 'opacity-50 cursor-not-allowed',
            )}
            disabled={isDisabled}
            onBlur={() => setFieldTouched(name, true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {isRange ? (
            <Calendar
              mode="range"
              selected={Array.isArray(date) ? { from: date[0], to: date[1] } : undefined}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              fromDate={minDate}
              toDate={maxDate}
              disabled={isDateDisabled}
            />
          ) : (
            <Calendar
              mode="single"
              selected={date instanceof Date ? date : undefined}
              onSelect={handleDateSelect}
              fromDate={minDate}
              toDate={maxDate}
              disabled={isDateDisabled}
            />
          )}
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

export default InputDateField;
