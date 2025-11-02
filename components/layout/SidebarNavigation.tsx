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
import { Home, Trophy, Activity, ShoppingBag, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Exercises",
    href: "/exercise",
    icon: Activity,
    badge: "3 new",
  },
  {
    name: "Shop",
    href: "/shop",
    icon: ShoppingBag,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/help",
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
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-lg p-2">
              <Image
                src="/logo.png"
                alt="DisKnee Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col gap-0.5">
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
                          {item.badge && (
                            <Badge
                              variant={isActive ? "secondary" : "default"}
                              className="ml-auto text-xs px-1.5 py-0.5 h-5"
                            >
                              {item.badge}
                            </Badge>
                          )}
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
