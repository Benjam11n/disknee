import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { Navbar } from "@/components/Navbar";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appointmentsResponse = await getAppointmentsAction({
    offset: 0,
    limit: 1,
  });

  if (!appointmentsResponse.success || !appointmentsResponse.data) {
    console.error(
      appointmentsResponse.error?.message ?? `Failed to fetch appointments`
    );
  }

  const nextAppointment = appointmentsResponse.data?.[0];

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
              <Navbar nextAppt={nextAppointment} />
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
