import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage() {
  // Fetch initial data on the server
  const initialLeaderboardData = await getLeaderboardAction({
    limit: 50,
    offset: 0,
    sortBy: "rank",
    sortOrder: "asc",
    rankingType: "score",
  });

  const initialLeaderboard = Array.isArray(initialLeaderboardData)
    ? initialLeaderboardData.map((entry) => ({
        rank: entry.rank,
        name: entry.name,
        weeks: entry.weeks,
        accuracyPercentage: entry.accuracyPercentage,
        score: entry.score,
      }))
    : [];

  const patientName = "Donald Duck";

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <LeaderboardClient
        initialLeaderboard={initialLeaderboard}
        patientName={patientName}
      />
    </div>
  );
}
