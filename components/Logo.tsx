import Image from "next/image";
import { cn } from "@/lib/utils";
import logoIcon from "@/public/logo.png";
import logoText from "@/public/logo_text.png";

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
      <div
        className={cn(
          "flex items-center dark:bg-primary rounded-2xl",
          className
        )}
      >
        <Image
          src={logoText}
          alt="DisKnee"
          width={size * 4}
          height={size}
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative bg-primary rounded-full overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoIcon}
          alt="DisKnee Logo"
          fill
          className="object-contain p-1"
        />
      </div>
      {showText && <span className="font-bold text-xl">DisKnee</span>}
    </div>
  );
}
