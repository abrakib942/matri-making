'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import _ from 'lodash';
import GenericViewGenerator from '@/components/global/GenericViewGenerator';
import { getRoles } from '@/apis';
import { IField } from '@/components/global/GenericFormGenerator';
import { getSeverity } from '@/utils';
import { getUserManagementFields } from '@/utils/userFields';

const Page = () => {
  const [roles, setRoles] = useState<{ id: number; name: string }[] | null>(null);

  useEffect(() => {
    getRoles()
      .then(response => {
        if (!response) {
          // showToast('error', 'Unsuccessful!', 'Server not working!');
        } else if (response.statusCode !== 200) {
          // showToast('error', 'Unsuccessful!', response.message);
        } else {
          // showToast('success', 'Success!', response.message);

          setRoles(response.data);
        }
      })
      .catch(error => {
        console.error('error', error);

        // showToast('error', 'Unsuccessful!', 'Something went wrong!');
      })
      .finally(() => {});
  }, []);

  const getBadgeVariant = (status: string) => {
    const severity = getSeverity(status);
    if (severity === 'success') return 'default';
    if (severity === 'danger') return 'destructive';
    if (severity === 'warning') return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {useMemo(
          () =>
            !roles ? null : (
              <GenericViewGenerator
                name={'User'}
                title="Users"
                subtitle="Manage user here!"
                viewAll={{
                  uri: `/api/v1/users`,
                  ignoredColumns: [
                    'id',
                    'password',
                    'otp',
                    'otpAttemptCount',
                    'phone',
                    'nid',
                    'dateOfBirth',
                    'gender',
                    'address',
                    'createdAt',
                    'updatedAt',
                    'directPermissions',
                    'primaryRole',
                  ],
                  scopedColumns: {
                    status: (item: any) => (
                      <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                    ),
                    roles: (item: any) => {
                      if (!item.roles || !Array.isArray(item.roles)) return '-';
                      const roleNames = item.roles.map((role: any) => role.name).join(', ');
                      return roleNames || '-';
                    },
                  },
                  actionIdentifier: 'id',
                  onDataModify: data =>
                    _.map(data, datum => {
                      // Transform roles array to roleIds array for edit form
                      const roleIds = Array.isArray(datum.roles)
                        ? datum.roles.map((role: any) => role.id || role)
                        : [];
                      return {
                        ...datum,
                        roleIds,
                      };
                    }),
                }}
                addNew={{
                  uri: `/api/v1/users`,
                }}
                viewOne={{
                  uri: '/api/v1/users/{id}',
                  identifier: '{id}',
                  onDataModify: (datum: any) => {
                    // Transform roles array to roleIds array for edit form
                    const roleIds = Array.isArray(datum.roles)
                      ? datum.roles.map((role: any) => role.id || role)
                      : [];
                    return {
                      ...datum,
                      roleIds,
                    };
                  },
                }}
                editExisting={{ uri: '/api/v1/users/{id}', identifier: '{id}' }}
                removeOne={{
                  uri: '/api/v1/users/{id}',
                  identifier: '{id}',
                }}
                fields={getUserManagementFields(roles).filter(field => field.name !== 'status')}
                editFields={getUserManagementFields(roles)
                  .filter(field => field.name !== 'password')
                  .map(field =>
                    field.name !== 'email' ? { ...field } : { ...field, isDisabled: true },
                  )}
              />
            ),
          [roles],
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
