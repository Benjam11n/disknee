"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LeaderboardItem } from "./LeaderboardItem";

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;
  accuracyPercentage: number;
  score: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardRow[];
  patientName: string;
  showAll?: boolean;
  maxItems?: number;
  rankingType?: "score" | "accuracy";
  onRankingTypeChange?: (type: "score" | "accuracy") => void;
}

export function Leaderboard({
  leaderboard,
  patientName,
  showAll = false,
  maxItems = 5,
  rankingType = "score",
  onRankingTypeChange,
}: LeaderboardProps) {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (rankingType === "accuracy") {
      return b.accuracyPercentage - a.accuracyPercentage || a.rank - b.rank;
    }
    return b.score - a.score || a.rank - b.rank;
  });

  const topEntries = sortedLeaderboard.slice(0, maxItems);
  const currentUserRank = sortedLeaderboard.findIndex(
    (row) => row.name === patientName
  );
  const currentUserData =
    currentUserRank >= 0 ? sortedLeaderboard[currentUserRank] : null;
  const isUserInTop = currentUserRank >= 0 && currentUserRank < maxItems;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Leaderboard</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Top performers by {rankingType === "accuracy" ? "accuracy" : "score"}
        </p>
        {onRankingTypeChange && (
          <div className="flex gap-2">
            <Button
              variant={rankingType === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => onRankingTypeChange("score")}
            >
              Score
            </Button>
            <Button
              variant={rankingType === "accuracy" ? "default" : "outline"}
              size="sm"
              onClick={() => onRankingTypeChange("accuracy")}
            >
              Accuracy
            </Button>
          </div>
        )}
      </div>

      {/* Top entries */}
      <div className="space-y-2">
        {/* First place */}
        {topEntries[0] && (
          <LeaderboardItem
            key={topEntries[0].rank}
            row={topEntries[0]}
            isCurrentUser={isLeaderboardMe(topEntries[0], patientName)}
            displayValue={rankingType}
          />
        )}

        {/* Second and Third place */}
        <div className="grid grid-cols-2 gap-2">
          {topEntries[1] && (
            <LeaderboardItem
              key={topEntries[1].rank}
              row={topEntries[1]}
              isCurrentUser={isLeaderboardMe(topEntries[1], patientName)}
              displayValue={rankingType}
            />
          )}
          {topEntries[2] && (
            <LeaderboardItem
              key={topEntries[2].rank}
              row={topEntries[2]}
              isCurrentUser={isLeaderboardMe(topEntries[2], patientName)}
              displayValue={rankingType}
            />
          )}
        </div>

        {/* Fourth and Fifth place */}
        {maxItems >= 5 && (
          <div className="grid grid-cols-2 gap-2">
            {topEntries[3] && (
              <LeaderboardItem
                key={topEntries[3].rank}
                row={topEntries[3]}
                isCurrentUser={isLeaderboardMe(topEntries[3], patientName)}
                displayValue={rankingType}
              />
            )}
            {topEntries[4] && (
              <LeaderboardItem
                key={topEntries[4].rank}
                row={topEntries[4]}
                isCurrentUser={isLeaderboardMe(topEntries[4], patientName)}
                displayValue={rankingType}
              />
            )}
          </div>
        )}
      </div>

      {/* Current user if not in top */}
      {!isUserInTop && currentUserData && (
        <>
          <Separator />
          <LeaderboardItem
            row={currentUserData}
            isCurrentUser={true}
            displayValue={rankingType}
          />
        </>
      )}

      {/* Show more */}
      {showAll && sortedLeaderboard.length > maxItems && (
        <>
          <Separator />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(maxItems, sortedLeaderboard.length)} of{" "}
              {sortedLeaderboard.length} total
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function isLeaderboardMe(row: LeaderboardRow, patientName: string): boolean {
  return row?.name === patientName;
}
