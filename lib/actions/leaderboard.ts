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

export async function getLeaderboard(params: GetLeaderboardParams) {
  const validationResult = await action({
    params: params,
    schema: GetLeaderboardSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, sortBy, sortOrder, name } = validationResult.params!;

  try {
    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    });

    return leaderboard;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getLeaderboardByRank(params: GetLeaderboardByRankParams) {
  const validationResult = await action({
    params: params,
    schema: GetLeaderboardByRankSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startRank, endRank } = validationResult.params!;

  try {
    const leaderboard = await prisma.leaderboard.findMany({
      where: {
        rank: {
          gte: startRank,
          lte: endRank,
        },
      },
      orderBy: { rank: "asc" },
    });

    return leaderboard;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
