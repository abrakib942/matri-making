import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive bg-destructive/10',
        warning:
          'border-amber-500/50 text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
