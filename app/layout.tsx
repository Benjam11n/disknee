import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { NavbarWrapper } from "@/components/layout/NavbarWrapper";

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
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <SidebarNavigation>
                <NavbarWrapper patientName="Donald Duck">
                  {children}
                </NavbarWrapper>
              </SidebarNavigation>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
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
