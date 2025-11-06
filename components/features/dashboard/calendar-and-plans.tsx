import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from './calendar';
import { ProgressRing } from './progress-ring';
import { PlanningList } from './planning-list';
import { PlanWithExercises } from '@/lib/types/plans';

interface CalendarAndPlansProps {
  monthMatrix: (Date | null)[][];
  monthLabel: string;
  today: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  apptDays: Set<string>;
  planDays: Set<string>;
  selectedPlans: PlanWithExercises[];
  ringProgress: number;
}

export function CalendarAndPlans({
  monthMatrix,
  monthLabel,
  today,
  selectedDate,
  setSelectedDate,
  apptDays,
  planDays,
  selectedPlans,
  ringProgress,
}: CalendarAndPlansProps) {
  return (
    <Card className="p-6">
      <div className="relative flex justify-center mb-6">
        <ProgressRing progress={ringProgress} size={250} strokeWidth={16} showPercentage={true} />
      </div>

      {/* Calendar */}
      <Calendar
        monthMatrix={monthMatrix}
        monthLabel={monthLabel}
        today={today}
        selectedDate={selectedDate}
        apptDays={apptDays}
        planDays={planDays}
        onSelectDate={setSelectedDate}
      />

      <Separator className="my-4" />

      {/* Selected Date Plans */}
      <PlanningList plans={selectedPlans} maxItems={5} showAddButton={false} />
    </Card>
  );
}
