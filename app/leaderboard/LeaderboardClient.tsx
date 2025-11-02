"use client";

import { useState, useCallback } from "react";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { getLeaderboardAction } from "@/lib/actions/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { leaderboardByScore } from "@prisma/client";

interface LeaderboardClientProps {
  initialLeaderboard: leaderboardByScore[];
  patientName: string;
}

export function LeaderboardClient({
  initialLeaderboard,
  patientName,
}: LeaderboardClientProps) {
  const [leaderboardData, setLeaderboardData] =
    useState<leaderboardByScore[]>(initialLeaderboard);
  const [rankingType, setRankingType] = useState<"score" | "accuracy">("score");
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (type: "score" | "accuracy") => {
    setLoading(true);
    try {
      const data = await getLeaderboardAction({
        limit: 50,
        offset: 0,
        sortBy: "rank",
        sortOrder: "asc",
        rankingType: type,
      });
      const formattedData = Array.isArray(data) ? data : [];
      setLeaderboardData(formattedData);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
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
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Leaderboard
            leaderboard={leaderboardData}
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
