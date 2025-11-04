import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-200 dark:from-pink-300 dark:to-orange-800 relative">
          {children}

          {/* Return button at bottom */}
          <div className="absolute bottom-32 left-0 right-0 flex justify-center">
            <Button variant="outline" asChild>
              <Link href={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" />
                Return
              </Link>
            </Button>
          </div>
        </div>
        <Toaster
          position="top-right"
          visibleToasts={5}
          richColors
          closeButton
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
