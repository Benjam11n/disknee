"use client";

import { Separator } from "@/components/ui/separator";
import { LeaderboardItem } from "./LeaderboardItem";

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;
  percent: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardRow[];
  patientName: string;
  showAll?: boolean;
  maxItems?: number;
}

export function Leaderboard({
  leaderboard,
  patientName,
  showAll = false,
  maxItems = 5,
}: LeaderboardProps) {
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.percent - a.percent || a.rank - b.rank
  );

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
        <p className="text-sm text-muted-foreground">
          Top performers by accuracy
        </p>
      </div>

      {/* Top entries */}
      <div className="space-y-2">
        {/* First place */}
        {topEntries[0] && (
          <LeaderboardItem
            key={topEntries[0].rank}
            row={topEntries[0]}
            isCurrentUser={isLeaderboardMe(topEntries[0], patientName)}
          />
        )}

        {/* Second and Third place */}
        <div className="grid grid-cols-2 gap-2">
          {topEntries[1] && (
            <LeaderboardItem
              key={topEntries[1].rank}
              row={topEntries[1]}
              isCurrentUser={isLeaderboardMe(topEntries[1], patientName)}
            />
          )}
          {topEntries[2] && (
            <LeaderboardItem
              key={topEntries[2].rank}
              row={topEntries[2]}
              isCurrentUser={isLeaderboardMe(topEntries[2], patientName)}
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
              />
            )}
            {topEntries[4] && (
              <LeaderboardItem
                key={topEntries[4].rank}
                row={topEntries[4]}
                isCurrentUser={isLeaderboardMe(topEntries[4], patientName)}
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