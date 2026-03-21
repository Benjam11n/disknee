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
      <Sidebar className="border-r border-border/40 bg-sidebar">
        <UISidebarHeader className="border-b border-border/40 p-4">
          <SidebarHeader />
        </UISidebarHeader>

        <SidebarContent className="px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <SidebarNavigationMenu items={navigation} title="Main" />
            <Separator className="bg-border/40" />
            {/* Secondary Navigation */}
            <SidebarNavigationMenu items={secondaryNavigation} title="Support" />
          </div>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-1 flex-col w-full overflow-hidden">
        <main className="flex-1 bg-background w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-8 pt-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
