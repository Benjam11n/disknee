import { getExercisesAction } from "@/lib/actions/exercises";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getPlans } from "@/lib/actions/plans";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function RehabDashboardPage() {
  const [exercisesData, appointmentsData, plansData, leaderboardData] =
    await Promise.allSettled([
      getExercisesAction({ page: 1, limit: 50 }),
      getAppointmentsAction({ limit: 50, offset: 0 }),
      getPlans({ limit: 100, offset: 0, include: { exercises: true } }),
      getLeaderboardAction({
        limit: 50,
        offset: 0,
        sortBy: "rank",
        sortOrder: "asc",
        rankingType: "score",
      }),
    ]);

  const exercises =
    exercisesData.status === "fulfilled" && !("success" in exercisesData.value)
      ? exercisesData.value
      : [];

  const appointments =
    appointmentsData.status === "fulfilled" &&
    !("success" in appointmentsData.value)
      ? appointmentsData.value
      : [];

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const plans =
    plansData.status === "fulfilled" && !("success" in plansData.value)
      ? plansData.value.filter((plan) => {
          const planDate = new Date(plan.date);
          return planDate >= startOfMonth && planDate <= endOfMonth;
        })
      : [];

  const leaderboard =
    leaderboardData.status === "fulfilled" &&
    !("success" in leaderboardData.value)
      ? leaderboardData.value
      : [];

  // TODO: For demo purposes, use Donald Duck as patient name
  // In a real app, this would come from authentication
  const patientName = "Donald Duck";

  const initialData = {
    patientName,
    exercises,
    leaderboard,
    appointments,
    plans,
    overallPercent: undefined,
    programWeeks: 10,
    weeksCompleted: 0,
  };

  return <DashboardClient initialData={initialData} />;
}
