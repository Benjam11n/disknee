import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { Navbar } from "@/components/Navbar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DisKnee - Virtual Physiotherapy Assistant",
  description: "AI-powered physiotherapy for knee rehabilitation",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarNavigation>
              {/* todo: fix this */}
              <Navbar label="Dashboard" primaryDoctorText="Smith" />
              {children}
            </SidebarNavigation>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          visibleToasts={5}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
