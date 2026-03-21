import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

import { LeaderboardClient } from "./leaderboard-client";

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const leaderboardResponse = await getLeaderboardAction({
    limit: 50,
    offset: 0,
    rankingType: "score",
    sortBy: "rank",
    sortOrder: "asc",
  });

  if (!leaderboardResponse.success || !leaderboardResponse.data) {
    return notFound();
  }

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <LeaderboardClient
        initialLeaderboard={leaderboardResponse.data}
        patientName={session.user.name}
      />
    </div>
  );
}
