"use client";

import { Appointment } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";

interface NavbarProps {
  nextAppt?: Appointment | null;
}

export function Navbar({ nextAppt }: NavbarProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const patientName = session?.user?.name;

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.success("Signed out successfully");
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-7xl">
        {/* Left spacer - sidebar handles branding */}
        <div></div>

        {/* Right: appointment, theme toggle, and user info grouped */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sign Out Button - Always visible */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Next appointment with hover dropdown */}
          <div className="hidden sm:flex items-center gap-2 relative group">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="secondary"
              className="cursor-pointer group-hover:bg-accent transition-colors text-xs"
              suppressHydrationWarning
            >
              <span className="hidden sm:inline">
                {nextAppt?.start ? "Upcoming appointment" : "No appointment"}
              </span>
              <span className="sm:hidden">
                {nextAppt?.start ? "—" : "No appointment"}
              </span>
            </Badge>

            {/* Hover card */}
            {nextAppt && (
              <div
                className="absolute top-[110%] left-0 min-w-[280px] rounded-md border bg-popover text-popover-foreground shadow-md p-4 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20"
                role="tooltip"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-semibold">Next Appointment</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">
                      {nextAppt.doctorName || "Doctor TBD"}
                    </div>
                    {nextAppt.doctorSpecialty && (
                      <div className="text-muted-foreground">
                        {nextAppt.doctorSpecialty}
                      </div>
                    )}
                    {(nextAppt.locationName || nextAppt.locationAddr) && (
                      <div className="mt-2 space-y-1">
                        {nextAppt.locationName && (
                          <div className="flex items-start gap-1">
                            <span className="text-xs">📍</span>
                            <span className="text-xs">
                              {nextAppt.locationName}
                            </span>
                          </div>
                        )}
                        {nextAppt.locationAddr && (
                          <div className="text-xs text-muted-foreground pl-4">
                            {nextAppt.locationAddr}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User avatar and info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium" title={patientName}>
                {patientName}
              </div>
              {nextAppt?.doctorName && (
                <div
                  className="text-xs text-muted-foreground"
                  title={nextAppt.doctorName}
                >
                  Dr. {nextAppt.doctorName}
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer">
                  <AvatarImage src="" alt={patientName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {patientName
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {patientName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
