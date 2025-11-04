import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-200 dark:from-pink-300 dark:to-orange-800">
          {children}
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
