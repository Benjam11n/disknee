import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import Chatbox from "@/components/chatbox/chatbox";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  description: "AI-powered physiotherapy for knee rehabilitation",
  icons: {
    icon: "/logo.png",
  },
  title: "DisKnee - Virtual Physiotherapy Assistant",
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
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          visibleToasts={5}
          richColors
          closeButton
        />
        <Chatbox />
      </body>
    </html>
  );
}
