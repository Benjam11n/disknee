import { getExercisesAction } from "@/lib/actions/exercises";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getPlans } from "@/lib/actions/plans";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { getUserByIdAction } from "@/lib/actions/users";
import { getUserInventoryAction } from "@/lib/actions/shop";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Plan, ShopItem, UserInventory } from "@prisma/client";

// todo: use a constant for this
const userId = "cmhgxrmgb00033fzvmx6inphh";

export default async function RehabDashboardPage() {
  const [
    exercisesData,
    appointmentsData,
    plansData,
    leaderboardData,
    userData,
    inventoryData,
  ] = await Promise.allSettled([
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
    getUserByIdAction({ userId }),
    getUserInventoryAction({ userId }),
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

  let plans: Plan[] = [];

  if (
    plansData.status === "fulfilled" &&
    plansData.value.success &&
    plansData.value.data
  ) {
    plans = plansData.value.data.filter((plan) => {
      const planDate = new Date(plan.date);
      return planDate >= startOfMonth && planDate <= endOfMonth;
    });
  }

  const leaderboard =
    leaderboardData.status === "fulfilled" &&
    !("success" in leaderboardData.value)
      ? leaderboardData.value
      : [];

  const user =
    userData.status === "fulfilled" && !("error" in userData.value)
      ? (
          userData.value as {
            success: boolean;
            data: { name: string; id: string; points: number };
          }
        ).data
      : { points: 0, name: "Donald Duck", id: "default" };

  const inventory =
    inventoryData.status === "fulfilled" && !("error" in inventoryData.value)
      ? (
          inventoryData.value as {
            success: boolean;
            data: (UserInventory & { item: ShopItem })[];
          }
        ).data
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
