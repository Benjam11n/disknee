import {
  Home,
  Trophy,
  Activity,
  ShoppingBag,
  Settings,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    name: "Exercises",
    href: ROUTES.EXERCISE.BASE,
    icon: Activity,
  },
  {
    name: "Shop",
    href: ROUTES.SHOP,
    icon: ShoppingBag,
  },
  {
    name: "Leaderboard",
    href: ROUTES.LEADERBOARD,
    icon: Trophy,
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    name: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: ROUTES.HELP,
    icon: HelpCircle,
  },
];