import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlanWithExercises } from "@/lib/types/plans";
import { PlanCard } from "./plan-card";

interface PlanningListProps {
  plans: PlanWithExercises[];
  onAddPlan?: () => void;
  maxItems?: number;
  showAddButton?: boolean;
}

export function PlanningList({
  plans,
  onAddPlan,
  maxItems = 3,
  showAddButton = true,
}: PlanningListProps) {
  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const displayPlans = sortedPlans.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Plans</CardTitle>
        {showAddButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddPlan}
            className="h-8 gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayPlans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No upcoming plans</p>
            {showAddButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddPlan}
                className="mt-2"
              >
                Create your first plan
              </Button>
            )}
          </div>
        ) : (
          displayPlans.map((plan) => (
            <PlanCard key={plan.id || plan.date.toISOString()} plan={plan} />
          ))
        )}

        {plans.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs">
              View all {plans.length} plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
