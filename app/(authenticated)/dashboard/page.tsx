import { getExercisesAction } from '@/lib/actions/exercises';
import { getAppointmentsAction } from '@/lib/actions/appointments';
import { getPlansAction } from '@/lib/actions/plans';
import { getLeaderboardAction } from '@/lib/actions/leaderboard';
import { getUserByIdAction } from '@/lib/actions/users';
import { getUserStreakAction } from '@/lib/actions/streaks';
import { DashboardClient } from '@/components/features/dashboard/dashboard-client';
import { Plan, User } from '@prisma/client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ROUTES } from '@/lib/constants/routes';

export default async function RehabDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const userId = session.user.id;

  // Get plans for current month first
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [appointmentsResponse, plansResponse, leaderboardResponse, userResponse, streakResponse] =
    await Promise.all([
      getAppointmentsAction({ limit: 50, offset: 0 }),
      getPlansAction({ limit: 100, offset: 0, include: { exercises: true } }),
      getLeaderboardAction({
        limit: 50,
        offset: 0,
        sortBy: 'rank',
        sortOrder: 'asc',
        rankingType: 'score',
      }),
      getUserByIdAction({ userId }),
      getUserStreakAction({ userId }),
    ]);

  // Handle plans data - filter for current month
  let plans: Plan[] = [];

  if (plansResponse.success && plansResponse.data) {
    plans = plansResponse.data.filter((plan) => {
      const planDate = new Date(plan.date);
      return planDate >= startOfMonth && planDate <= endOfMonth;
    });
  }

  // Now fetch exercises for the filtered plans
  const exercisesPromises = plans.map((plan) =>
    getExercisesAction({ planId: plan.id, page: 1, limit: 100 })
  );

  const exercisesResponses = await Promise.all(exercisesPromises);

  // Combine all exercises from all plans
  const exercises = exercisesResponses
    .flatMap((response) => (response.success ? response.data || [] : []))
    .sort((a, b) => a.sequence - b.sequence); // Sort by sequence across all plans

  // Handle appointments data
  const appointments = appointmentsResponse.success ? appointmentsResponse.data || [] : [];

  const leaderboard = leaderboardResponse.success ? leaderboardResponse.data || [] : [];

  const user: User =
    userResponse.success && userResponse.data
      ? userResponse.data
      : ({ id: 'default', name: 'Donald Duck', points: 0 } as User);

  const streakData = streakResponse.data;

  const initialData = {
    patientName: user.name,
    exercises,
    leaderboard,
    appointments,
    plans,
    overallPercent: undefined,
    programWeeks: 10,
    weeksCompleted: 0,
    userPoints: user.points,
    streakData,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardClient initialData={initialData} userId={userId} />
    </div>
  );
}
