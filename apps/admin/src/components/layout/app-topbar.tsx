'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { destroyLogin } from '@/libs/auth';
import { LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AppTopbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const AppTopbar = ({ onMenuToggle, isMenuOpen }: AppTopbarProps) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    const success = destroyLogin();
    if (success) {
      router.push('/auth/login');
    }
  };

  return (
    <div
      className={cn(
        'fixed h-20 z-[997] left-0 top-0 w-full px-4',
        'bg-surface-card transition-[left] duration-200',
        'flex items-center gap-4 shadow-layout',
        'md:justify-between md:px-3 md:gap-2',
      )}
    >
      <button
        type="button"
        onClick={onMenuToggle}
        className={cn(
          'inline-flex justify-center items-center relative rounded-md',
          'w-12 h-12 cursor-pointer transition-colors duration-200',
          'flex-shrink-0 desktop:hidden',
          'md:order-1',
        )}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        href="/"
        className={cn(
          'flex items-center text-surface-900 text-2xl font-medium',
          'flex-1 min-w-0 rounded-xl',
          'md:order-2',
          'md:[&>img]:h-8',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/example-logo.svg"
          width="auto"
          height="100%"
          alt="Example"
          className="h-10 max-w-full object-contain"
        />
      </Link>

      <div
        className={cn(
          'ml-auto p-0 list-none flex',
          'md:order-3 md:flex-shrink-0 md:ml-0',
          '[&>button]:ml-4',
        )}
      >
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'inline-flex justify-center items-center relative rounded-md',
                'w-12 h-12 cursor-pointer transition-colors duration-200',
              )}
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push('/auth/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppTopbar;
