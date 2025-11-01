import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlowBlobProps {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}

const exactGradient = "rgb(206,199,187), rgb(241,205,216)";

const GlowBlob = React.forwardRef<HTMLDivElement, GlowBlobProps>(
  (
    {
      children,
      className,
      glowClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {/* Large Glow Blob */}
        <div
          className={cn(
            "absolute rounded-full",
            "w-[800px] h-[800px]",
            "-top-[200px] -right-[200px]",
            "opacity-50 blur-3xl",
            "pointer-events-none",
            "animate-pulse",
            glowClassName
          )}
          style={{
            background: `radial-gradient(circle at center, ${exactGradient}, transparent)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlowBlob.displayName = "GlowBlob";

export { GlowBlob };