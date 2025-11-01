import { prisma } from "./prisma";
import type {
  User,
  Exercise,
  Session,
  Reflection,
  Appointment,
  Progress,
} from "./generated/prisma";
import { Difficulty } from "@prisma/client";

// User utilities
export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      patientPlans: {
        include: {
          plan: {
            include: {
              planExercises: {
                include: { exercise: true },
              },
            },
          },
        },
      },
      progress: true,
      sessions: {
        include: { reflection: true },
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getUserSessions(
  userId: string,
  limit = 10
): Promise<Session[]> {
  return await prisma.session.findMany({
    where: { userId },
    include: { reflection: true },
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

// Exercise utilities
export async function getExercisesByDifficulty(
  difficulty: string
): Promise<Exercise[]> {
  return await prisma.exercise.findMany({
    where: {
      difficulty: difficulty.toUpperCase() as Difficulty,
      isActive: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  return await prisma.exercise.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
          ],
        },
      ],
    },
    orderBy: { title: "asc" },
  });
}

// Session utilities
export async function createSession(data: {
  userId: string;
  duration?: number;
  repsCompleted?: number;
  accuracy?: number;
  notes?: string;
}): Promise<Session> {
  return await prisma.session.create({
    data: {
      ...data,
      startedAt: new Date(),
    },
  });
}

export async function endSession(
  sessionId: string,
  data: {
    endedAt?: Date;
    duration?: number;
    repsCompleted?: number;
    accuracy?: number;
    maxAccuracy?: number;
    videoUrl?: string;
    notes?: string;
  }
): Promise<Session> {
  return await prisma.session.update({
    where: { id: sessionId },
    data: {
      ...data,
      endedAt: data.endedAt || new Date(),
    },
  });
}

// Reflection utilities
export async function createReflection(data: {
  sessionId: string;
  rating: number;
  fatigue: number;
  feedback?: string;
}): Promise<Reflection> {
  return await prisma.reflection.create({
    data,
  });
}

// Progress utilities
export async function updateProgress(
  userId: string,
  data: {
    completedWeeks?: number;
    overallPercent?: number;
  }
): Promise<Progress> {
  return await prisma.progress.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
      totalWeeks: 10,
    },
  });
}

export async function getLeaderboard(limit = 50): Promise<Progress[]> {
  return await prisma.progress.findMany({
    where: {
      overallPercent: { not: null },
    },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: [{ overallPercent: "desc" }, { completedWeeks: "desc" }],
    take: limit,
  });
}

// Appointment utilities
export async function getUpcomingAppointments(
  userId: string
): Promise<Appointment[]> {
  return await prisma.appointment.findMany({
    where: {
      userId,
      start: { gte: new Date() },
      status: { in: ["SCHEDULED", "COMPLETED"] },
    },
    orderBy: { start: "asc" },
  });
}

// Analytics utilities
export async function getUserStats(userId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    include: { reflection: true },
  });

  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgAccuracy =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length
        )
      : 0;

  const reflectionsWithRating = sessions
    .map((s) => s.reflection)
    .filter((r) => r !== null && r.rating !== undefined);

  const avgRating =
    reflectionsWithRating.length > 0
      ? Math.round(
          reflectionsWithRating.reduce((acc, r) => acc + r!.rating, 0) /
            reflectionsWithRating.length
        )
      : 0;

  const avgFatigue =
    reflectionsWithRating.length > 0
      ? Math.round(
          reflectionsWithRating.reduce((acc, r) => acc + r!.fatigue, 0) /
            reflectionsWithRating.length
        )
      : 0;

  return {
    totalSessions,
    totalDuration: Math.round(totalDuration / 60), // in minutes
    avgAccuracy,
    avgRating,
    avgFatigue,
    lastSessionDate: sessions[0]?.startedAt || null,
  };
}
