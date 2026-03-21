import { Eye, ShoppingBag, Sparkles, Star } from "lucide-react";

interface RarityConfig {
  tier: string;
  color: string;
  textColor: string;
  shadow: string;
  icon: React.ComponentType<{ className?: string }>;
}

// todo: move tier to a db field
export function getRarity(price: number): RarityConfig {
  if (price >= 500) {
    return {
      color:
        "border-purple-400 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-500",
      icon: Star,
      shadow: "shadow-purple-200 dark:shadow-purple-900/50",
      textColor: "text-purple-700 dark:text-purple-300",
      tier: "Legendary",
    };
  } else if (price >= 200) {
    return {
      color:
        "border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500",
      icon: Sparkles,
      shadow: "shadow-blue-200 dark:shadow-blue-900/50",
      textColor: "text-blue-700 dark:text-blue-300",
      tier: "Epic",
    };
  } else if (price >= 100) {
    return {
      color:
        "border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-500",
      icon: Eye,
      shadow: "shadow-green-200 dark:shadow-green-900/50",
      textColor: "text-green-700 dark:text-green-300",
      tier: "Rare",
    };
  }
  return {
    color:
      "border-gray-300 bg-gray-50 dark:bg-gray-950/30 dark:border-gray-600",
    icon: ShoppingBag,
    shadow: "shadow-gray-200 dark:shadow-gray-900/50",
    textColor: "text-gray-700 dark:text-gray-300",
    tier: "Common",
  };
}
