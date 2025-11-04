import Image from "next/image";
import { cn } from "@/lib/utils";

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
          src="/logo.png"
          alt="DisKnee"
          width={size * 4} // logo_text is wider
          height={size}
          className="object-contain"
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
          src="/logo.png"
          alt="DisKnee Logo"
          fill
          className="object-contain p-1"
        />
      </div>
      {showText && <span className="font-bold text-xl">DisKnee</span>}
    </div>
  );
}
