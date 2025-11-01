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
} from "../types/leaderboard";
import { leaderboardByAccuracy, leaderboardByScore } from "@prisma/client";

export async function getLeaderboardAction(params: GetLeaderboardParams) {
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
    let leaderboard: leaderboardByScore[] | leaderboardByAccuracy[] = [];
    if (rankingType === "accuracy") {
      leaderboard = await prisma.leaderboardByAccuracy.findMany({
        where: {
          name: name ? { contains: name, mode: "insensitive" } : undefined,
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      });

      return leaderboard;
    } else {
      leaderboard = await prisma.leaderboardByScore.findMany({
        where: {
          name: name ? { contains: name, mode: "insensitive" } : undefined,
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      });
    }
    return leaderboard;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getLeaderboardByRankAction(
  params: GetLeaderboardByRankParams & { rankingType?: "score" | "accuracy" }
) {
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

      return leaderboard;
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

      return leaderboard;
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
