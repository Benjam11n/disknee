import type { Plan, User } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/features/dashboard/dashboard-client";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getExercisesAction } from "@/lib/actions/exercises";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { getPlansAction } from "@/lib/actions/plans";
import { getUserStreakAction } from "@/lib/actions/streaks";
import { getUserByIdAction } from "@/lib/actions/users";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export default async function RehabDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const userId = session.user.id;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    appointmentsResponse,
    plansResponse,
    leaderboardResponse,
    userResponse,
    streakResponse,
  ] = await Promise.all([
    getAppointmentsAction({ limit: 50, offset: 0 }),
    getPlansAction({ include: { exercises: true }, limit: 100, offset: 0 }),
    getLeaderboardAction({
      limit: 50,
      offset: 0,
      rankingType: "score",
      sortBy: "rank",
      sortOrder: "asc",
    }),
    getUserByIdAction({ userId }),
    getUserStreakAction({ userId }),
  ]);

  let plans: Plan[] = [];

  if (plansResponse.success && plansResponse.data) {
    plans = plansResponse.data.filter((plan) => {
      const planDate = new Date(plan.date);
      return planDate >= startOfMonth && planDate <= endOfMonth;
    });
  }

  const exercisesPromises = plans.map((plan) =>
    getExercisesAction({ limit: 100, page: 1, planId: plan.id })
  );

  const exercisesResponses = await Promise.all(exercisesPromises);

  const exercises = exercisesResponses
    .flatMap((response) => (response.success ? response.data || [] : []))
    .toSorted((a, b) => a.sequence - b.sequence);

  const appointments = appointmentsResponse.success
    ? appointmentsResponse.data || []
    : [];

  const leaderboard = leaderboardResponse.success
    ? leaderboardResponse.data || []
    : [];

  const user: User =
    userResponse.success && userResponse.data
      ? userResponse.data
      : ({ id: "default", name: "Donald Duck", points: 0 } as User);

  const streakData = streakResponse.data;

  const initialData = {
    appointments,
    exercises,
    leaderboard,
    overallPercent: undefined,
    patientName: user.name,
    plans,
    programWeeks: 10,
    streakData,
    userPoints: user.points,
    weeksCompleted: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardClient initialData={initialData} userId={userId} />
    </div>
  );
}
