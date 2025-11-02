import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const initialLeaderboardData = await getLeaderboardAction({
    limit: 50,
    offset: 0,
    sortBy: "rank",
    sortOrder: "asc",
    rankingType: "score",
  });

  const initialLeaderboard = Array.isArray(initialLeaderboardData)
    ? initialLeaderboardData
    : [];

  // todo: add to a constants file
  const patientName = "Donald Duck";

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <LeaderboardClient
        initialLeaderboard={initialLeaderboard}
        patientName={patientName}
      />
    </div>
  );
}
