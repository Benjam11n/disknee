import { Eye, ShoppingBag, Sparkles, Star } from 'lucide-react';

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
      tier: 'Legendary',
      color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-500',
      textColor: 'text-purple-700 dark:text-purple-300',
      shadow: 'shadow-purple-200 dark:shadow-purple-900/50',
      icon: Star,
    };
  } else if (price >= 200) {
    return {
      tier: 'Epic',
      color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      shadow: 'shadow-blue-200 dark:shadow-blue-900/50',
      icon: Sparkles,
    };
  } else if (price >= 100) {
    return {
      tier: 'Rare',
      color: 'border-green-400 bg-green-50 dark:bg-green-950/30 dark:border-green-500',
      textColor: 'text-green-700 dark:text-green-300',
      shadow: 'shadow-green-200 dark:shadow-green-900/50',
      icon: Eye,
    };
  } else {
    return {
      tier: 'Common',
      color: 'border-gray-300 bg-gray-50 dark:bg-gray-950/30 dark:border-gray-600',
      textColor: 'text-gray-700 dark:text-gray-300',
      shadow: 'shadow-gray-200 dark:shadow-gray-900/50',
      icon: ShoppingBag,
    };
  }
}
