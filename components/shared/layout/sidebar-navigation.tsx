'use client';

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader as UISidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarHeader } from '@/components/features/layout/sidebar-header';
import { SidebarNavigationMenu } from '@/components/features/layout/sidebar-navigation-menu';
import { navigation, secondaryNavigation } from '@/lib/constants/sidebar-navigation';

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar className="border-r border-border/40 bg-sidebar w-20" collapsible="none">
        <UISidebarHeader className="border-b border-border/40 pb-4">
          <SidebarHeader />
        </UISidebarHeader>

        <SidebarContent className="px-0 py-6 items-center flex flex-col justify-between h-full">
          <div className="space-y-4">
            {/* Main Navigation */}
            <SidebarNavigationMenu items={navigation} title="Main" itemHeight="h-10" />
            <Separator className="bg-border/40 w-10 mx-auto" />
            {/* Secondary Navigation */}
            <SidebarNavigationMenu items={secondaryNavigation} title="Support" itemHeight="h-9" />
          </div>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-1 flex-col w-full overflow-hidden">
        <main className="flex-1 bg-background/95 w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
