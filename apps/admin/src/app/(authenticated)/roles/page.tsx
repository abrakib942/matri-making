'use client';

import GenericViewGenerator from '@/components/global/GenericViewGenerator';
import { IAction } from '@/components/global/data-table';
import { Card, CardContent } from '@/components/ui/card';
import _ from 'lodash';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Page = () => {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        {useMemo(
          () => (
            <GenericViewGenerator
              name={'role'}
              title="Roles"
              subtitle="Manage role here!"
              viewAll={{
                uri: `/api/v1/roles`,
                ignoredColumns: ['id', 'type', 'createdAt', 'updatedAt'],
                scopedColumns: {
                  users: (item: any) => {
                    if (!item.users || !Array.isArray(item.users) || item.users.length === 0) {
                      return <span className="text-muted-foreground">No users</span>;
                    }
                    const userNames = item.users
                      .map((user: any) => user.name || user.email)
                      .join(', ');
                    return <span>{userNames}</span>;
                  },
                  permissions: (item: any) => {
                    if (!item.permissions || !Array.isArray(item.permissions)) {
                      return <span>0</span>;
                    }
                    return (
                      <span>
                        {item.permissions.length} permission
                        {item.permissions.length !== 1 ? 's' : ''}
                      </span>
                    );
                  },
                },
                actionIdentifier: 'id',
                onDataModify: data =>
                  _.map(data, datum => ({
                    ...datum,
                    // Keep permissions and users for scopedColumns display
                  })),
              }}
              addNew={{
                uri: `/api/v1/roles`,
              }}
              viewOne={{ uri: '/api/v1/roles/{id}', identifier: '{id}' }}
              editExisting={{ uri: '/api/v1/roles/{id}', identifier: '{id}' }}
              removeOne={{
                uri: '/api/v1/roles/{id}',
                identifier: '{id}',
              }}
              customActions={
                [
                  {
                    color: 'default',
                    icon: <ArrowRight className="h-4 w-4" />,
                    text: 'Permissions',
                    callback: (identifier: string | number) => {
                      router.push(`/roles/${identifier}/permissions`);
                    },
                  },
                ] as IAction[]
              }
              fields={[
                {
                  type: 'text',
                  name: 'name',
                  placeholder: 'Enter a name!',
                  title: 'Role Name',
                  initialValue: null,
                  validate: (values: any) => {
                    if (!values.name) return 'Name required!';

                    return null;
                  },
                },
                {
                  type: 'textarea',
                  name: 'description',
                  placeholder: 'Enter a description (optional)!',
                  title: 'Description',
                  initialValue: null,
                  validate: () => null,
                },
              ]}
            />
          ),
          [router],
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
