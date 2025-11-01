import { getExercises } from "@/lib/actions/exercises";
import { getAppointments } from "@/lib/actions/appointments";
import { getPlans } from "@/lib/actions/plans";
import { getLeaderboard } from "@/lib/actions/leaderboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function RehabDashboardPage() {
  const [exercisesData, appointmentsData, plansData, leaderboardData] =
    await Promise.allSettled([
      getExercises({ page: 1, limit: 50 }),
      getAppointments({ limit: 50, offset: 0 }),
      getPlans({ limit: 100, offset: 0, include: { exercises: true } }),
      getLeaderboard({
        limit: 50,
        offset: 0,
        sortBy: "rank",
        sortOrder: "asc",
      }),
    ]);

  // Process exercises data - keep original Prisma types
  const exercises =
    exercisesData.status === "fulfilled" && !("success" in exercisesData.value)
      ? exercisesData.value
      : [];

  // Process appointments data - keep original Prisma types
  const appointments =
    appointmentsData.status === "fulfilled" && !("success" in appointmentsData.value)
      ? appointmentsData.value
      : [];

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const plans =
    plansData.status === "fulfilled" && !("success" in plansData.value)
      ? plansData.value
          .filter((plan) => {
            const planDate = new Date(plan.date);
            return planDate >= startOfMonth && planDate <= endOfMonth;
          })
      : [];

  // Process leaderboard data
  const leaderboard =
    leaderboardData.status === "fulfilled" &&
    !("success" in leaderboardData.value)
      ? leaderboardData.value.map((entry) => ({
          rank: entry.rank,
          name: entry.name,
          weeks: entry.weeks,
          percent: entry.percent,
        }))
      : [];

  // For demo purposes, use Donald Duck as patient name
  // In a real app, this would come from authentication
  const patientName = "Donald Duck";

  // Initial data structure matching what the client expects
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

  return (
    <DashboardClient initialData={initialData} />
  );
}
