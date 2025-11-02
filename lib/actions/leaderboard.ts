"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  GetLeaderboardSchema,
  GetLeaderboardByRankSchema,
} from "@/lib/validations/leaderboard-schemas";
import {
  GetLeaderboardByRankParams,
  GetLeaderboardParams,
} from "@/lib/types/leaderboard";
import { leaderboardByAccuracy, leaderboardByScore } from "@prisma/client";
import { NotFoundError } from "@/lib/http-errors";

export async function getLeaderboardAction(
  params: GetLeaderboardParams
): Promise<ActionResponse<leaderboardByScore[] | leaderboardByAccuracy[]>> {
  const validationResult = await action({
    params: params,
    schema: GetLeaderboardSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, sortBy, sortOrder, name, rankingType } =
    validationResult.params!;

  try {
    if (rankingType === "accuracy") {
      const leaderboard = await prisma.leaderboardByAccuracy.findMany({
        where: {
          name: name ? { contains: name, mode: "insensitive" } : undefined,
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { success: true, data: leaderboard };
    } else {
      const leaderboard = await prisma.leaderboardByScore.findMany({
        where: {
          name: name ? { contains: name, mode: "insensitive" } : undefined,
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { success: true, data: leaderboard };
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getLeaderboardByRankAction(
  params: GetLeaderboardByRankParams & { rankingType?: "score" | "accuracy" }
): Promise<ActionResponse<leaderboardByScore[] | leaderboardByAccuracy[]>> {
  const validationResult = await action({
    params: params,
    schema: GetLeaderboardByRankSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startRank, endRank, rankingType } = validationResult.params!;

  try {
    if (rankingType === "accuracy") {
      const leaderboard = await prisma.leaderboardByAccuracy.findMany({
        where: {
          rank: {
            gte: startRank,
            lte: endRank,
          },
        },
        orderBy: { rank: "asc" },
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { success: true, data: leaderboard };
    } else {
      const leaderboard = await prisma.leaderboardByScore.findMany({
        where: {
          rank: {
            gte: startRank,
            lte: endRank,
          },
        },
        orderBy: { rank: "asc" },
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { success: true, data: leaderboard };
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
