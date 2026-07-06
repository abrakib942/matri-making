/**
 * GenericFormGenerator field-type cookbook.
 *
 * Copy examples from here when creating new *Fields.ts files for CRUD pages.
 * This file is not wired to any route — it documents supported field shapes only.
 *
 * Submit output conventions:
 * - `date` / `date-range` → ISO date strings via the calendar picker
 * - `time` → `HH:mm` string, or `null` when empty
 *
 * Tips:
 * - Use `validate` with `normalizeTimeForInput` when comparing time values
 * - Pair separate `date` + `time` fields when the API stores them independently
 * - `information` is omitted from submit payloads; wire display-only copy via `show` if needed
 */
import { IField } from '../components/global/GenericFormGenerator';
import { normalizeTimeForInput } from './date';
import { getGeneralStatusOptions } from './index';

export const getSampleFields = (): IField[] => [
  {
    type: 'hidden',
    name: 'id',
    title: 'ID',
    placeholder: '',
    initialValue: null,
  },
  {
    type: 'text',
    name: 'title',
    title: 'Title',
    placeholder: 'Enter a title',
    initialValue: null,
    validate: values => (!values.title ? 'Required!' : null),
  },
  {
    type: 'email',
    name: 'email',
    title: 'Email',
    placeholder: 'name@example.com',
    initialValue: null,
  },
  {
    type: 'number',
    name: 'quantity',
    title: 'Quantity',
    placeholder: '0',
    initialValue: null,
  },
  {
    type: 'password',
    name: 'password',
    title: 'Password',
    placeholder: 'Enter a password',
    initialValue: null,
  },
  {
    type: 'tel',
    name: 'phone',
    title: 'Phone',
    placeholder: '+880...',
    initialValue: null,
  },
  {
    type: 'textarea',
    name: 'description',
    title: 'Description',
    placeholder: 'Enter a description',
    initialValue: null,
  },
  {
    type: 'date',
    name: 'eventDate',
    title: 'Event date',
    placeholder: 'Pick a date',
    initialValue: null,
  },
  {
    type: 'date-multiple',
    name: 'availableDates',
    title: 'Available dates',
    placeholder: 'Pick dates',
    initialValue: null,
  },
  {
    type: 'date-range',
    name: 'bookingRange',
    title: 'Booking range',
    placeholder: 'Pick a range',
    initialValue: null,
  },
  {
    type: 'time',
    name: 'startTime',
    title: 'Start time',
    placeholder: '09:00',
    initialValue: null,
  },
  {
    type: 'time',
    name: 'endTime',
    title: 'End time',
    placeholder: '17:00',
    initialValue: null,
    step: 60,
    validate: values => {
      const start = normalizeTimeForInput(values.startTime as string);
      const end = normalizeTimeForInput(values.endTime as string);
      if (start && end && end <= start) {
        return 'End time must be after start time';
      }
      return null;
    },
  },
  {
    type: 'richtext',
    name: 'body',
    title: 'Body',
    placeholder: 'Write content...',
    initialValue: null,
  },
  {
    type: 'select-sync',
    name: 'status',
    title: 'Status',
    placeholder: 'Select status',
    initialValue: 'ACTIVE',
    options: getGeneralStatusOptions(),
  },
  {
    type: 'select-async',
    name: 'categoryId',
    title: 'Category',
    placeholder: 'Search categories',
    initialValue: null,
    options: [],
    loadOptions: () => {},
    isSearchable: true,
    isClearable: true,
  },
  {
    type: 'multi-select-sync',
    name: 'tagIds',
    title: 'Tags',
    placeholder: 'Select tags',
    initialValue: null,
    options: [
      { value: '1', label: 'Tag A' },
      { value: '2', label: 'Tag B' },
    ],
  },
  {
    type: 'chips',
    name: 'keywords',
    title: 'Keywords',
    placeholder: 'Add a keyword',
    initialValue: null,
  },
  {
    type: 'file-select',
    name: 'attachments',
    title: 'Attachments',
    placeholder: 'Upload files',
    initialValue: null,
    acceptType: 'image/*',
    multiple: true,
  },
  {
    type: 'information',
    name: 'infoNote',
    title: 'Note',
    placeholder: 'Display-only information field',
    initialValue: null,
  },
];
