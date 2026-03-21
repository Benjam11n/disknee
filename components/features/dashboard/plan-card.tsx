import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PlanWithExercises } from "@/lib/types/plans";
import { formatDate, getDaysUntil } from "@/lib/utils/plan-utils";

interface PlanCardProps {
  plan: PlanWithExercises;
  onClick?: () => void;
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  return (
    <Card
      className="p-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{plan.title || "Exercise Plan"}</span>
            <Badge variant="secondary" className="text-xs">
              {getDaysUntil(plan.date)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(plan.date)}
            {plan.when && ` at ${plan.when}`}
          </p>
          {plan.exercises && plan.exercises.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {plan.exercises.length} exercise
              {plan.exercises.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Play className="h-3 w-3" />
          <span>Start</span>
        </div>
      </div>
    </Card>
  );
}
