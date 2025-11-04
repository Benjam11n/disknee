"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Trophy,
  Activity,
  ShoppingBag,
  Settings,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants/routes";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.HOME,
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

const secondaryNavigation: NavigationItem[] = [
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

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar className="border-r border-border/40 bg-sidebar">
        <SidebarHeader className="bg-gradient-to-b from-background to-sidebar/50 border-b border-border/40 p-6">
          <div className="flex flex-col items-center gap-3">
            <Logo variant="icon" size={40} />
            <div className="flex flex-col gap-0.5 text-center">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                DisKnee
              </h1>
              <p className="text-xs text-muted-foreground">
                Virtual Physiotherapy
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Main
              </p>
              <SidebarMenu>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "h-10 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "focus-visible:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          isActive &&
                            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive && "text-primary-foreground"
                            )}
                          />
                          <div className="flex-1 text-left">
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>

            <Separator className="bg-border/40" />

            {/* Secondary Navigation */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Support
              </p>
              <SidebarMenu>
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "h-9 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "focus-visible:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          isActive &&
                            "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive && "text-primary-foreground"
                            )}
                          />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </div>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <main className="flex-1 bg-background/95">{children}</main>
      </div>
    </SidebarProvider>
  );
}
