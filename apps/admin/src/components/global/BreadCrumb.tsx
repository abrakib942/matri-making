'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import _ from 'lodash';

const BreadCrumbComponent = ({
  replaceItems,
}: {
  replaceItems?: { identifier: string; replaceWith: string }[];
}) => {
  const pathname = usePathname();

  const paths = _.filter(_.split(pathname, '/'), path => path !== '' && path !== 'v-p');

  const items = paths.map((path, index) => {
    const isLast = index === paths.length - 1;
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label =
      replaceItems?.find(item => item.identifier === path)?.replaceWith || _.upperFirst(path);

    if (isLast) {
      return (
        <BreadcrumbItem key={path}>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }

    return (
      <BreadcrumbItem key={path}>
        <BreadcrumbLink asChild>
          <Link href={href}>{label}</Link>
        </BreadcrumbLink>
        <BreadcrumbSeparator />
      </BreadcrumbItem>
    );
  });

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.length > 0 && <BreadcrumbSeparator />}
        {items}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumbComponent;
