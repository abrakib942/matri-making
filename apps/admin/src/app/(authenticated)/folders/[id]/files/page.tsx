'use client';

import { getFolderById } from '@/apis';
import { UrlBasedColumnItem } from '@/components';
import GenericViewGenerator from '@/components/global/GenericViewGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGeneralStatusOptions } from '@/utils';
import _ from 'lodash';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const Page = () => {
  const params = useParams();
  const folderId = params.id as string;

  const [folder, setFolder] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    getFolderById(parseInt(folderId))
      .then(response => {
        if (!response) {
          // showToast('error', 'Unsuccessful!', 'Server not working!');
        }

        if (response.statusCode !== 200) {
          // showToast('error', 'Unsuccessful!', response.message);
        } else {
          // showToast('success', 'Success!', response.message);

          setFolder(response.data);
        }
      })
      .catch(error => {
        console.error('error', error);

        // showToast('error', 'Unsuccessful!', 'Something went wrong!');
      })
      .finally(() => {});
  }, [folderId]);

  return (
    <Card>
      {folder && (
        <CardHeader>
          <CardTitle>{folder.name}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={folder ? '' : 'pt-6'}>
        {useMemo(
          () =>
            !folder ? null : (
              <GenericViewGenerator
                name={'file'}
                title="Files"
                subtitle="Manage file here!"
                viewAll={{
                  uri: `/api/v1/folders/${folderId}/files`,
                  ignoredColumns: ['id', 'folderId', 'folder', 'type', 'createdAt', 'updatedAt'],
                  scopedColumns: {
                    url: (item: any) => <UrlBasedColumnItem url={item.url} />,
                  },
                  actionIdentifier: 'id',
                  onDataModify: data =>
                    _.map(data, datum => ({
                      ...datum,
                      folder: datum.folder.name,
                    })),
                }}
                addNew={{
                  uri: `/api/v1/files`,
                }}
                viewOne={{
                  uri: `/api/v1/files/{id}`,
                  identifier: '{id}',
                }}
                editExisting={{
                  uri: `/api/v1/files/{id}`,
                  identifier: '{id}',
                }}
                removeOne={{
                  uri: '/api/v1/files/{id}',
                  identifier: '{id}',
                }}
                fields={[
                  {
                    type: 'select-sync',
                    name: 'folderId',
                    placeholder: 'Select folder ID',
                    title: 'Folder',
                    initialValue: parseInt(folderId),
                    options: !folder
                      ? []
                      : [
                          {
                            value: folder.id,
                            label: folder.name,
                          },
                        ],
                    validate: (values: any) => {
                      if (!values.folderId) return 'Required!';

                      return null;
                    },
                    isDisabled: true,
                  },
                  {
                    type: 'select-sync',
                    name: 'type',
                    placeholder: 'Select type!',
                    title: 'TYPE',
                    initialValue: 'UNSPECIFIED',
                    options: [
                      {
                        value: 'UNSPECIFIED',
                        label: 'UNSPECIFIED',
                      },
                      {
                        value: 'IMAGE',
                        label: 'IMAGE',
                      },
                      {
                        value: 'GIF',
                        label: 'GIF',
                      },
                      {
                        value: 'VIDEO',
                        label: 'VIDEO',
                      },
                      {
                        value: 'DOCUMENT',
                        label: 'DOCUMENT',
                      },
                    ],
                  },
                  {
                    type: 'file-select',
                    name: 'url',
                    placeholder: 'Select a file or enter URL!',
                    title: 'Select File',
                    initialValue: null,
                    acceptType: '*/*',
                    maxFileSize: 1048576,
                    multiple: false,
                    validate: (values: any) => {
                      if (!values.url) return 'Required!';

                      return null;
                    },
                  },
                  {
                    type: 'text',
                    name: 'name',
                    placeholder: 'Enter a name!',
                    title: 'File Name',
                    initialValue: null,
                    validate: (values: any) => {
                      if (!values.name) return 'Required!';

                      return null;
                    },
                  },
                  {
                    type: 'select-sync',
                    name: 'status',
                    placeholder: 'Select status!',
                    title: 'Status',
                    initialValue: 'ACTIVE',
                    options: getGeneralStatusOptions(),
                    validate: (values: any) => {
                      if (!values.status) return 'Required!';

                      return null;
                    },
                  },
                ]}
              />
            ),
          [folder, folderId],
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
