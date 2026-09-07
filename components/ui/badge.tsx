import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono transition-colors',
  {
    variants: {
      variant: {
        default: 'border-signal-cyan/30 bg-signal-cyan/10 text-signal-cyan',
        violet: 'border-signal-violet/30 bg-signal-violet/10 text-violet-glow',
        outline: 'border-white/15 text-white/70',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
