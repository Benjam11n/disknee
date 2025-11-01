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
} from "@/components/ui/sidebar";
import { Home, Trophy, Activity, Video, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Exercises",
    href: "/exercise",
    icon: Activity,
  },
  {
    name: "Calls",
    href: "/calls",
    icon: Video,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
];

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="DisKnee Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">DisKnee</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
