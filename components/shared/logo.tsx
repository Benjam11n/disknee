import Image from "next/image";

import { cn } from "@/lib/utils";
import logoText from "@/public/logo-text.png";
import logoIcon from "@/public/logo.png";

interface LogoProps {
  variant?: "icon" | "text";
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({
  variant = "icon",
  size = 32,
  className,
  showText = false,
}: LogoProps) {
  if (variant === "text") {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src={logoText}
          alt="DisKnee"
          width={size * 4}
          height={size}
          className="object-contain dark:bg-primary/60 rounded-2xl"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative bg-primary rounded-2xl overflow-hidden"
        style={{ height: size, width: size }}
      >
        <Image
          src={logoIcon}
          alt="DisKnee Logo"
          fill
          sizes={`${size}px`}
          className="object-contain p-1"
        />
      </div>
      {showText && <span className="font-bold text-xl">DisKnee</span>}
    </div>
  );
}
