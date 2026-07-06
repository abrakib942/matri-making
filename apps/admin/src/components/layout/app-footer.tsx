'use client';

import { cn } from '@/lib/utils';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className={cn(
        'transition-[margin-left] duration-200',
        'flex items-center justify-center p-4',
        'border-t border-surface-border text-center',
        'flex-wrap gap-1 text-sm',
        'md:text-xs md:p-3 md:flex-col md:gap-0.5',
      )}
    >
      <span className="font-medium inline-block">
        © {currentYear} All rights reserved. Created by
      </span>
      <span className="font-medium ml-1 inline-block md:ml-0">
        <strong>example.com</strong>
      </span>
    </div>
  );
};

export default AppFooter;
