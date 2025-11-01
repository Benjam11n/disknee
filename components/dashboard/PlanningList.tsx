import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { sameDay } from "@/lib/date-utils";

interface Plan {
  id?: string | number;
  date: string;
  title?: string;
  when?: string;
  exercises?: Array<{
    name: string;
    sets?: number;
    reps?: number;
  }>;
}

interface PlanningListProps {
  plans: Plan[];
  onAddPlan?: () => void;
  maxItems?: number;
  showAddButton?: boolean;
}

export function PlanningList({
  plans,
  onAddPlan,
  maxItems = 3,
  showAddButton = true
}: PlanningListProps) {
  const sortedPlans = [...plans].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const displayPlans = sortedPlans.slice(0, maxItems);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, tomorrow)) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

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
            <Card
              key={plan.id || plan.date}
              className="p-3 hover:shadow-sm transition-all duration-200 cursor-pointer"
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
                    {formatDate(plan.date)} {plan.when && `at ${plan.when}`}
                  </p>
                  {plan.exercises && plan.exercises.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.exercises.length} exercise{plan.exercises.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
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