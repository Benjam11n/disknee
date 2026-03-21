import type { ReactNode } from "react";

interface DashboardLayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function DashboardLayout({
  leftColumn,
  rightColumn,
}: DashboardLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mt-8">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-8">{leftColumn}</div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-8">{rightColumn}</div>
    </div>
  );
}
