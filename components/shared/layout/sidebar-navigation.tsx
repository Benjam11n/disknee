"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader as UISidebarHeader,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "@/components/features/layout/sidebar-header";
import { SidebarNavigationMenu } from "@/components/features/layout/sidebar-navigation-menu";
import {
  navigation,
  secondaryNavigation,
} from "@/lib/constants/sidebar-navigation";

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar className="border-r border-border/40 bg-sidebar">
        <UISidebarHeader className="bg-gradient-to-b from-background to-sidebar/50 border-b border-border/40 p-6">
          <SidebarHeader />
        </UISidebarHeader>

        <SidebarContent className="px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <SidebarNavigationMenu
              items={navigation}
              title="Main"
              itemHeight="h-10"
            />

            <Separator className="bg-border/40" />

            {/* Secondary Navigation */}
            <SidebarNavigationMenu
              items={secondaryNavigation}
              title="Support"
              itemHeight="h-9"
            />
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
