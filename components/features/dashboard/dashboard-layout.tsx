import { ReactNode } from 'react';

interface DashboardLayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function DashboardLayout({ leftColumn, rightColumn }: DashboardLayoutProps) {
  return (
    <div className="px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">{leftColumn}</div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-6">{rightColumn}</div>
    </div>
  );
}
