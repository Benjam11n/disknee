import type { LucideIcon } from "lucide-react";
import {
  Home,
  Trophy,
  Activity,
  ShoppingBag,
  Settings,
  HelpCircle,
  NotebookText,
} from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: NavigationItem[] = [
  {
    href: ROUTES.DASHBOARD,
    icon: Home,
    name: "Dashboard",
  },
  {
    href: ROUTES.EXERCISE.BASE,
    icon: Activity,
    name: "Exercises",
  },
  {
    href: ROUTES.REPORTS,
    icon: NotebookText,
    name: "Reports",
  },
  {
    href: ROUTES.SHOP,
    icon: ShoppingBag,
    name: "Shop",
  },
  {
    href: ROUTES.LEADERBOARD,
    icon: Trophy,
    name: "Leaderboard",
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    href: ROUTES.SETTINGS,
    icon: Settings,
    name: "Settings",
  },
  {
    href: ROUTES.HELP,
    icon: HelpCircle,
    name: "Help & Support",
  },
];
