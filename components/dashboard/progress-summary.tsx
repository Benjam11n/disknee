import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressSummaryProps {
  overallTarget: number;
  weeksCompleted: number;
  programWeeks: number;
  patientRank: number;
}

export function ProgressSummary({
  overallTarget,
  weeksCompleted,
  programWeeks,
  patientRank,
}: ProgressSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(overallTarget * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {weeksCompleted}/{programWeeks}
            </div>
            <div className="text-sm text-muted-foreground">Weeks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              #{patientRank}
            </div>
            <div className="text-sm text-muted-foreground">Rank</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}