export type ReportsData = {
  weeksWithMeta: Array<{
    weekStart: string;
    days: Array<{
      date: string;
      items: Array<{
        title: string;
        status: string;
        endedOn: string | null;
        satisfaction: number | null;
        fatigue: number | null;
        comments: string | null;
        points: number;
      }>;
    }>;
    totalExercises: number;
    avgSatisfaction: number | null;
    avgFatigue: number | null;
    totalPoints: number;
    reviewed: string;
    feedback: string | null;
  }>;
};
