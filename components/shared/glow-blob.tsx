import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlowBlobProps {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}

const exactGradient = 'rgb(206,199,187), rgb(241,205,216)';

const GlowBlob = React.forwardRef<HTMLDivElement, GlowBlobProps>(
  ({ children, className, glowClassName, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        {/* Large Glow Blob */}
        <div
          className={cn(
            'absolute rounded-full',
            'w-[800px] h-[800px]',
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'opacity-60 blur-3xl',
            'pointer-events-none',
            'animate-pulse',
            glowClassName
          )}
          style={{
            background: `radial-gradient(circle at center, ${exactGradient}, transparent)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlowBlob.displayName = 'GlowBlob';

export { GlowBlob };
