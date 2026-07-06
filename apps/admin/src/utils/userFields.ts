import { IField } from '@/components/global/GenericFormGenerator';
import _ from 'lodash';
import { getUserStatusOptions } from './index';

export const getUserManagementFields = (roles: { id: number; name: string }[]): IField[] => [
  {
    type: 'text',
    name: 'name',
    placeholder: 'Enter a name!',
    title: 'Name (Full name)',
    initialValue: null,
    validate: (values: any) => {
      if (!values.name) return 'Required!';

      return null;
    },
  },
  {
    type: 'email',
    name: 'email',
    placeholder: 'Enter an email!',
    title: 'Email',
    initialValue: null,
    validate: (values: any) => {
      if (!values.email) return 'Required!';

      return null;
    },
  },
  {
    type: 'password',
    name: 'password',
    placeholder: 'Enter a password!',
    title: 'Password',
    initialValue: null,
    validate: (values: any) => {
      if (!values.password) return 'Required!';

      return null;
    },
  },
  {
    type: 'multi-select-sync',
    name: 'roleIds',
    placeholder: 'Select roles!',
    title: 'Roles',
    initialValue: null,
    options: _.map(roles, (role: { id: number; name: string }) => ({
      value: role.id,
      label: role.name,
    })),
    validate: (values: any) => {
      if (!values.roleIds || !Array.isArray(values.roleIds) || values.roleIds.length === 0) {
        return 'At least one role is required!';
      }

      return null;
    },
  },
  {
    type: 'select-sync',
    name: 'status',
    placeholder: 'Select a status!',
    title: 'Status',
    initialValue: 'ACTIVE',
    options: getUserStatusOptions(),
    validate: (values: any) => {
      if (!values.status) return 'Status required!';

      return null;
    },
  },
];
