import { sectionSpacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: keyof typeof sectionSpacing;
  pattern?: boolean;
}

export function Section({ className, spacing = 'md', pattern, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(sectionSpacing[spacing], pattern && 'islamic-pattern', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  className,
  title,
  description,
  action,
}: {
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8',
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-h2 font-bold tracking-tight">{title}</h2>
        {description && <p className="text-body text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
