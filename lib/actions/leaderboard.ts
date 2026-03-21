"use server";

import type { leaderboardByAccuracy, leaderboardByScore } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { prisma } from "@/lib/prisma";
import type {
  GetLeaderboardByRankParams,
  GetLeaderboardParams,
} from "@/lib/types/leaderboard";
import {
  GetLeaderboardSchema,
  GetLeaderboardByRankSchema,
} from "@/lib/validations/leaderboard-validations";

export async function getLeaderboardAction(
  params: GetLeaderboardParams
): Promise<ActionResponse<leaderboardByScore[] | leaderboardByAccuracy[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetLeaderboardSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, sortBy, sortOrder, name, rankingType } =
    validationResult.params!;

  try {
    if (rankingType === "accuracy") {
      const leaderboard = await prisma.leaderboardByAccuracy.findMany({
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
        where: {
          name: name ? { contains: name, mode: "insensitive" } : undefined,
        },
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { data: leaderboard, success: true };
    }
    const leaderboard = await prisma.leaderboardByScore.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      where: {
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
    });

    if (!leaderboard.length) {
      throw new NotFoundError("Leaderboard not found");
    }

    return { data: leaderboard, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getLeaderboardByRankAction(
  params: GetLeaderboardByRankParams & { rankingType?: "score" | "accuracy" }
): Promise<ActionResponse<leaderboardByScore[] | leaderboardByAccuracy[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetLeaderboardByRankSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startRank, endRank, rankingType } = validationResult.params!;

  try {
    if (rankingType === "accuracy") {
      const leaderboard = await prisma.leaderboardByAccuracy.findMany({
        orderBy: { rank: "asc" },
        where: {
          rank: {
            gte: startRank,
            lte: endRank,
          },
        },
      });

      if (!leaderboard.length) {
        throw new NotFoundError("Leaderboard not found");
      }

      return { data: leaderboard, success: true };
    }
    const leaderboard = await prisma.leaderboardByScore.findMany({
      orderBy: { rank: "asc" },
      where: {
        rank: {
          gte: startRank,
          lte: endRank,
        },
      },
    });

    if (!leaderboard.length) {
      throw new NotFoundError("Leaderboard not found");
    }

    return { data: leaderboard, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
