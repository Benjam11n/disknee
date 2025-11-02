import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { LeaderboardClient } from "./LeaderboardClient";
import { getCurrentUserName } from "@/lib/constants/users";
import { notFound } from "next/navigation";

export default async function LeaderboardPage() {
  const leaderboardResponse = await getLeaderboardAction({
    limit: 50,
    offset: 0,
    sortBy: "rank",
    sortOrder: "asc",
    rankingType: "score",
  });

  if (!leaderboardResponse.success || !leaderboardResponse.data) {
    return notFound();
  }

  const patientName = getCurrentUserName();

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <LeaderboardClient
        initialLeaderboard={leaderboardResponse.data}
        patientName={patientName}
      />
    </div>
  );
}
