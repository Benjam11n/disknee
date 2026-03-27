"use client";

import type { leaderboardByScore } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";

import { Leaderboard } from "@/components/features/dashboard/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { logger } from "@/lib/logger";

interface LeaderboardClientProps {
  initialLeaderboard: leaderboardByScore[];
  patientName: string;
}

const LEADERBOARD_SKELETON_KEYS = [
  "leaderboard-skeleton-1",
  "leaderboard-skeleton-2",
  "leaderboard-skeleton-3",
  "leaderboard-skeleton-4",
  "leaderboard-skeleton-5",
];

export function LeaderboardClient({
  initialLeaderboard,
  patientName,
}: LeaderboardClientProps) {
  const [leaderboardData, setLeaderboardData] = useState<
    leaderboardByScore[] | null
  >(null);
  const [rankingType, setRankingType] = useState<"score" | "accuracy">("score");
  const [loading, setLoading] = useState(false);
  const currentLeaderboard = useMemo(
    () => leaderboardData ?? initialLeaderboard,
    [initialLeaderboard, leaderboardData]
  );

  const fetchLeaderboard = useCallback(async (type: "score" | "accuracy") => {
    setLoading(true);
    try {
      const leaderboardResponse = await getLeaderboardAction({
        limit: 50,
        offset: 0,
        rankingType: type,
        sortBy: "rank",
        sortOrder: "asc",
      });

      if (!leaderboardResponse.success || !leaderboardResponse.data) {
        setLeaderboardData([]);
        return;
      }

      const formattedData = Array.isArray(leaderboardResponse.data)
        ? leaderboardResponse.data
        : [];
      setLeaderboardData(formattedData);
    } catch (error) {
      logger.error(error, "Failed to fetch leaderboard:");
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRankingTypeChange = useCallback(
    (type: "score" | "accuracy") => {
      setRankingType(type);
      fetchLeaderboard(type);
    },
    [fetchLeaderboard]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {LEADERBOARD_SKELETON_KEYS.map((key) => (
                <Skeleton key={key} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Leaderboard
            leaderboard={currentLeaderboard}
            patientName={patientName}
            showAll={true}
            maxItems={50}
            rankingType={rankingType}
            onRankingTypeChange={handleRankingTypeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
