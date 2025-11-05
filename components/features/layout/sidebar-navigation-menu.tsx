import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/constants/sidebar-navigation";

interface SidebarNavigationMenuProps {
  items: NavigationItem[];
  title: string;
  itemHeight?: "h-9" | "h-10";
}

export function SidebarNavigationMenu({
  items,
  title,
  itemHeight = "h-10",
}: SidebarNavigationMenuProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
        {title}
      </p>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={cn(
                  `${itemHeight} rounded-lg px-3 text-sm font-medium transition-all duration-200`,
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
  );
}
