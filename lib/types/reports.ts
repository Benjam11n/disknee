interface ReportItem {
  title: string;
  status: string;
  endedOn: string | null;
  satisfaction: number | null;
  fatigue: number | null;
  comments: string | null;
  points: number;
}

interface ReportDay {
  date: string;
  items: ReportItem[];
}

export interface ReportWeek {
  weekStart: string;
  days: ReportDay[];
  totalExercises: number;
  avgSatisfaction: number | null;
  avgFatigue: number | null;
  totalPoints: number;
  reviewed: "REVIEWED" | "NOT_SENT" | "PENDING" | string;
  feedback: string | null;
}

export interface ReportsData {
  weeksWithMeta: ReportWeek[];
}
