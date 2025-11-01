import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getRankDisplay } from "@/lib/utils";

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;
  percent: number;
}

interface LeaderboardItemProps {
  row: LeaderboardRow;
  isCurrentUser?: boolean;
  showRank?: boolean;
  compact?: boolean;
}

export function LeaderboardItem({
  row,
  isCurrentUser = false,
  showRank = true,
  compact = false,
}: LeaderboardItemProps) {
  const rankDisplay = getRankDisplay(row.rank);
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  return (
    <Card
      className={`
        flex items-center justify-between p-3 transition-all
        ${isCurrentUser
          ? 'border-2 border-primary bg-primary/5 shadow-md'
          : 'border bg-card hover:shadow-sm'
        }
        ${compact ? 'px-2 py-2' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {showRank && (
          <div className="flex items-center justify-center w-8">
            {row.rank <= 3 ? (
              <span className="text-lg">{getRankEmoji(row.rank)}</span>
            ) : (
              <Badge
                variant={isCurrentUser ? "default" : "secondary"}
                className={compact ? "text-xs" : ""}
              >
                {rankDisplay}
              </Badge>
            )}
          </div>
        )}
        <span
          className={`
            font-medium truncate
            ${isCurrentUser ? "text-primary" : "text-foreground"}
          `}
        >
          {row.name}
        </span>
        {isCurrentUser && (
          <Badge variant="default" className="text-xs">
            You
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`
            font-bold
            ${isCurrentUser ? "text-primary" : "text-muted-foreground"}
          `}
        >
          {row.percent}%
        </span>
      </div>
    </Card>
  );
}

