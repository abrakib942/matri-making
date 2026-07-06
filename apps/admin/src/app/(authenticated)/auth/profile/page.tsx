'use client';

import { getProfile } from '@/apis';
import { getUserManagementFields } from '@/utils/userFields';
import { BreadCrumb, GenericFormGenerator } from '@/components';
import { IField } from '@/components/global/GenericFormGenerator';
import { Card, CardContent } from '@/components/ui/card';
import { getAccessToken, getAccessType, getUser } from '@/libs/auth';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

const ProfilePage = () => {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth check is handled by layout, but we still need user data for API call
    if (authLoading) return;

    if (!isAuthenticated || !authUser) {
      // This shouldn't happen due to layout protection, but handle gracefully
      return;
    }

    // Use cookies for API authentication
    const accessType = getAccessType() || '';
    const accessToken = getAccessToken() || '';

    if (!accessType || !accessToken) {
      console.error('Missing authentication tokens');
      setLoading(false);
      return;
    }

    getProfile(`${accessType} ${accessToken}`)
      .then(response => {
        if (!response || response.statusCode !== 200) {
          console.error('Failed to get profile');
          return;
        }

        setUser(response.data);
      })
      .catch(error => {
        console.error('error', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, authUser, authLoading]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Failed to load profile</div>;
  }

  return (
    <>
      <BreadCrumb />
      <Card>
        <CardContent className="pt-6">
          <GenericFormGenerator
            datum={user}
            fields={getUserManagementFields([{ id: user.roleId, name: user.role.name }])
              .filter((field: IField) => field.name !== 'password')
              .map((field: IField) => ({ ...field, isDisabled: true }))}
            callback={values => {
              // console.debug({ values });
            }}
            submitButtonShow={false}
            enableReinitialize={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ProfilePage;
