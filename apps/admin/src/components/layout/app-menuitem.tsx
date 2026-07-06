'use client';

import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export interface MenuItem {
  label: string;
  icon?: string;
  to?: string;
  items?: MenuItem[];
}

interface AppMenuitemProps {
  item: MenuItem;
  index: number;
  parentKey?: string;
  depth?: number;
}

// Helper function to recursively check if any descendant is active
const hasActiveDescendant = (item: MenuItem, pathname: string): boolean => {
  if (item.to === pathname) {
    return true;
  }
  if (item.items) {
    return item.items.some(child => hasActiveDescendant(child, pathname));
  }
  return false;
};

const AppMenuitem = ({ item, index, parentKey, depth = 0 }: AppMenuitemProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = item.to === pathname;
  const isParentActive = hasChildren && hasActiveDescendant(item, pathname);
  const key = parentKey ? `${parentKey}-${index}` : String(index);
  const active = isActive || isParentActive || isOpen;
  const nextDepth = depth + 1;

  // Auto-open parent if any descendant is active
  useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive]);

  // Get icon component from lucide-react
  const IconComponent = item.icon
    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as React.ComponentType<{
        className?: string;
      }>)
    : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  // Get margin-left class based on depth
  const getMarginClass = () => {
    if (depth === 0) return '';
    if (depth === 1) return 'ml-4';
    if (depth === 2) return 'ml-8';
    return 'ml-12'; // depth >= 3
  };

  // Render icon (always show if provided)
  const renderIcon = () => {
    if (IconComponent) {
      return <IconComponent className="mr-2 mt-0.5 h-4 w-4" />;
    }
    if (item.icon) {
      return <i className={cn('mr-2 mt-0.5', item.icon)}></i>;
    }

    return null;
  };

  // Render menu item content
  const renderContent = () => {
    const baseClasses = cn(
      'flex items-start relative outline-none cursor-pointer p-3 rounded-xl',
      'transition-[background-color,box-shadow] duration-200',
      'hover:bg-surface-hover',
      getMarginClass(),
    );

    if (hasChildren) {
      // Item with children - show as toggle button
      return (
        <a
          href="#"
          onClick={handleToggle}
          className={cn(baseClasses, isParentActive && 'font-bold text-primary-color')}
        >
          {renderIcon()}
          <span className="break-words leading-6 flex-1">{item.label}</span>
          <ChevronDown
            className={cn(
              'text-xs ml-auto transition-transform duration-200 mt-0.5 h-4 w-4',
              isOpen && 'rotate-180',
            )}
          />
        </a>
      );
    }

    // Item without children - show as link
    return (
      <Link
        href={item.to || '#'}
        className={cn(baseClasses, isActive && 'font-bold text-primary-color')}
      >
        {renderIcon()}
        <span className="break-words leading-6 flex-1">{item.label}</span>
      </Link>
    );
  };

  return (
    <li>
      {renderContent()}
      {hasChildren && isOpen && (
        <ul className="m-0 p-0 list-none overflow-hidden max-h-[1000px] rounded-xl">
          {item.items?.map((child, i) => (
            <AppMenuitem
              key={`${child.label}-${i}`}
              item={child}
              index={i}
              parentKey={key}
              depth={nextDepth}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default AppMenuitem;
