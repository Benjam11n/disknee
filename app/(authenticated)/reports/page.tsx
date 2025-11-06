import ReportsClient from "./reports-client";
import { getReportsDataAction } from "@/lib/actions/reports";

export default async function ReportsPage() {
  const { weeksWithMeta } = await getReportsDataAction();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Weekly Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your exercise history and clinician feedback.
        </p>
      </div>

      <div className="space-y-4">
        <ReportsClient initialWeeks={weeksWithMeta} />
      </div>
    </main>
  );
}
