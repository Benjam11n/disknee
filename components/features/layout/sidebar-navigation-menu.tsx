import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/lib/constants/sidebar-navigation';

interface SidebarNavigationMenuProps {
  items: NavigationItem[];
  title: string;
  itemHeight?: 'h-9' | 'h-10';
}

export function SidebarNavigationMenu({ items }: SidebarNavigationMenuProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-2 flex flex-col items-center">
      <SidebarMenu className="w-auto flex flex-col gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                className={cn(
                  `h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200`,
                  'hover:bg-primary/5 hover:text-primary',
                  'focus-visible:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Link href={item.href} className="flex items-center justify-center">
                  <item.icon className="h-5 w-5 shrink-0" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
