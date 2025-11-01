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
      getPlans({ limit: 100, offset: 0 }),
      getLeaderboard({
        limit: 50,
        offset: 0,
        sortBy: "rank",
        sortOrder: "asc",
      }),
    ]);

  // Process exercises data
  const exercises =
    exercisesData.status === "fulfilled" && !("success" in exercisesData.value)
      ? exercisesData.value.map((ex) => ({
          id: ex.id,
          title: ex.title,
          done: ex.done,
          estimatedMins: ex.estimatedMins,
          difficulty: ex.difficulty?.toLowerCase() as
            | "easy"
            | "moderate"
            | "hard",
        }))
      : [];

  // Process appointments data
  const appointments =
    appointmentsData.status === "fulfilled" &&
    !("success" in appointmentsData.value)
      ? appointmentsData.value.map((apt) => ({
          id: apt.id,
          start:
            apt.start instanceof Date ? apt.start.toISOString() : apt.start,
          doctorName: apt.doctorName,
          doctorSpecialty: apt.doctorSpecialty,
          locationName: apt.locationName,
          locationAddr: apt.locationAddr,
        }))
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
          .map((plan) => ({
            id: plan.id,
            date:
              plan.date instanceof Date ? plan.date.toISOString() : plan.date,
            title: plan.title,
            when: plan.when,
          }))
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

  return <DashboardClient initialData={initialData} />;
}
