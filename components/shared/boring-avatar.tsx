import Avatar from "boring-avatars";

import {
  Avatar as AvatarUI,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface BoringAvatarWrapperProps {
  name?: string | null;
  email?: string | null;
  userId?: string;
  image?: string | null;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  lg: "h-16 w-16",
  md: "h-10 w-10",
  sm: "h-8 w-8",
  xl: "h-20 w-20",
};

export function BoringAvatarWrapper({
  name,
  email,
  userId,
  image,
  alt,
  className,
  size = "md",
}: BoringAvatarWrapperProps) {
  const avatarSize = sizeClasses[size];

  // Generate a consistent seed from email or userId
  const seed = email || userId || name || "default";

  // Generate initials for fallback
  const getInitials = (name?: string | null) => {
    if (!name) {
      return "";
    }
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeMap = {
    lg: 64,
    md: 40,
    sm: 32,
    xl: 80,
  };

  return (
    <AvatarUI className={`${avatarSize} ${className || ""}`}>
      {image ? (
        <AvatarImage src={image} alt={alt || name || "User avatar"} />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${avatarSize}`}
        >
          <Avatar
            size={sizeMap[size]}
            name={seed}
            variant="marble"
            colors={["#92A5FD", "#FDEEB8", "#A8DADC", "#457B9D", "#1D3557"]}
          />
        </div>
      )}
      <AvatarFallback className="text-sm">{getInitials(name)}</AvatarFallback>
    </AvatarUI>
  );
}
