import * as React from 'react';
import { cn } from '@/lib/utils';

/** Glassmorphic card: translucent surface, soft border, subtle inner highlight. */
const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = 'GlassCard';

export { GlassCard };
