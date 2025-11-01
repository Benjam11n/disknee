import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { getLeaderboard } from "@/lib/actions/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboard({
    limit: 50,
    offset: 0,
    sortBy: "rank",
    sortOrder: "asc",
  });

  const leaderboard = Array.isArray(leaderboardData)
    ? leaderboardData.map((entry) => ({
        rank: entry.rank,
        name: entry.name,
        weeks: entry.weeks,
        percent: entry.percent,
      }))
    : [];

  const patientName = "Donald Duck";

  return (
    <SidebarNavigation>
      <DashboardHeader
        name={patientName}
        label="Leaderboard"
      />

      <div className="px-6 py-6 max-w-[1400px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard
              leaderboard={leaderboard}
              patientName={patientName}
              showAll={true}
              maxItems={50}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarNavigation>
  );
}