import { getExercisesAction } from "@/lib/actions/exercises";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getPlansAction } from "@/lib/actions/plans";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { getUserByIdAction } from "@/lib/actions/users";
import { getUserInventoryAction } from "@/lib/actions/shop";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Plan, ShopItem, UserInventory, User } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ROUTES } from "@/lib/constants/routes";

export default async function RehabDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const userId = session.user.id;

  const [
    exercisesResponse,
    appointmentsResponse,
    plansResponse,
    leaderboardResponse,
    userResponse,
    inventoryResponse,
  ] = await Promise.all([
    getExercisesAction({ page: 1, limit: 50 }),
    getAppointmentsAction({ limit: 50, offset: 0 }),
    getPlansAction({ limit: 100, offset: 0, include: { exercises: true } }),
    getLeaderboardAction({
      limit: 50,
      offset: 0,
      sortBy: "rank",
      sortOrder: "asc",
      rankingType: "score",
    }),
    getUserByIdAction({ userId }),
    getUserInventoryAction({ userId }),
  ]);

  // Handle exercises data
  const exercises = exercisesResponse.success
    ? exercisesResponse.data || []
    : [];

  // Handle appointments data
  const appointments = appointmentsResponse.success
    ? appointmentsResponse.data || []
    : [];

  // Handle plans data - filter for current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let plans: Plan[] = [];

  if (plansResponse.success && plansResponse.data) {
    plans = plansResponse.data.filter((plan) => {
      const planDate = new Date(plan.date);
      return planDate >= startOfMonth && planDate <= endOfMonth;
    });
  }

  const leaderboard = leaderboardResponse.success
    ? leaderboardResponse.data || []
    : [];

  const user: User =
    userResponse.success && userResponse.data
      ? userResponse.data
      : ({ id: "default", name: "Donald Duck", points: 0 } as User);

  const inventory = inventoryResponse.success
    ? (inventoryResponse.data as (UserInventory & { item: ShopItem })[]) || []
    : [];

  const equippedItems = inventory
    .filter((item) => item.isEquipped)
    .map((item) => item.item);

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
    equippedItems,
  };

  return <DashboardClient initialData={initialData} />;
}
