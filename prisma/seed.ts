import { ExerciseDifficulty, ReviewStatus } from "@prisma/client";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createSeedUser } from "@/lib/seed-users";
import { startOfWeekMonday } from "@/lib/utils/date-utils";

import seedData from "./seed.json";
import shopItems from "./shop-seed.json";

async function main() {
  logger.info("🌱 Seeding database with JSON data...");

  // Clean up existing data
  await prisma.userInventory.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.exerciseSession.deleteMany();
  await prisma.session.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.weekReport.deleteMany();
  await prisma.user.deleteMany();

  logger.info("🧹 Cleaned existing data");

  // Create users with Better Auth
  const userCredentials = [
    { email: "demo@disknee.com", name: "Donald Duck", password: "demo123" },
    { email: "mickey@disknee.com", name: "Mickey Mouse", password: "demo123" },
    { email: "goofy@disknee.com", name: "Goofy", password: "demo123" },
    { email: "minnie@disknee.com", name: "Minnie Mouse", password: "demo123" },
    { email: "daisy@disknee.com", name: "Daisy Duck", password: "demo123" },
  ];
  const clinicianCredentials = {
    email: "physio@example.com",
    name: "Dr. Smith",
    password: "physio2024",
  };

  const users = [];
  for (const [index, userCred] of userCredentials.entries()) {
    if (index < seedData.users.length) {
      try {
        const user = await createSeedUser(userCred);
        users.push(user);
        logger.info(`✅ Created user: ${userCred.name} (${userCred.email})`);
      } catch (error) {
        logger.error(error, `❌ Error creating user ${userCred.email}:`);
        continue;
      }
    }
  }

  let clinicianUser = null;
  try {
    clinicianUser = await createSeedUser(clinicianCredentials);
    logger.info(
      `✅ Created clinician: ${clinicianCredentials.name} (${clinicianCredentials.email})`
    );
  } catch (error) {
    logger.error(
      error,
      `❌ Error creating clinician ${clinicianCredentials.email}:`
    );
  }

  // Create shop items
  const createdShopItems = [];
  for (const item of shopItems) {
    const shopItem = await prisma.shopItem.create({
      data: {
        description: item.description,
        icon: item.icon,
        id: item.id,
        isActive: item.active,
        name: item.name,
        price: item.price,
        type: item.type,
      },
    });
    createdShopItems.push(shopItem);
  }
  logger.info(`✅ Created ${createdShopItems.length} shop items`);

  // Create plans
  const plans = [];
  for (const plan of seedData.plans) {
    const createdPlan = await prisma.plan.create({
      data: {
        date: new Date(plan.date),
        id: plan.id,
        title: plan.title,
        when: plan.when,
      },
    });
    plans.push(createdPlan);
  }
  logger.info(`✅ Created ${plans.length} plans`);

  // Create exercises
  const exercises = [];
  for (const [index, ex] of seedData.exercises.entries()) {
    const planIndex = index % plans.length;
    // Calculate sequence number (1-based) within each plan
    const exercisesInThisPlan = Math.ceil((index + 1) / plans.length);
    const exercise = await prisma.exercise.create({
      data: {
        id: ex.id,
        title: ex.title,
        estimatedMins: ex.estimatedMins,
        type: ex.type || null, // Add the type field
        difficulty:
          ex.difficulty === "easy"
            ? ExerciseDifficulty.EASY
            : ex.difficulty === "moderate"
              ? ExerciseDifficulty.MODERATE
              : ExerciseDifficulty.HARD,
        done: ex.done,
        sequence: exercisesInThisPlan,
        planId: plans[planIndex].id,
        videoUrl: ex.videoUrl || null,
      },
    });
    exercises.push(exercise);
  }
  logger.info(`✅ Created ${exercises.length} exercises`);

  // Create appointments
  if (seedData.appointments) {
    for (const appt of seedData.appointments) {
      await prisma.appointment.create({
        data: {
          doctorName: appt.doctorName,
          doctorSpecialty: appt.doctorSpecialty,
          id: appt.id,
          locationAddr: appt.locationAddr,
          locationName: appt.locationName,
          start: new Date(appt.start),
        },
      });
    }
    logger.info(`✅ Created ${seedData.appointments.length} appointments`);
  }

  // Create exercise sessions and reflections
  if (seedData.sessions) {
    let sessionCount = 0;
    for (const sessionData of seedData.sessions) {
      // Check if the exercise and user indices are valid
      if (sessionData.exerciseIndex >= exercises.length) {
        logger.warn(
          `⚠️ Skipping session with invalid exerciseIndex: ${sessionData.exerciseIndex}`
        );
        continue;
      }
      if (sessionData.userIndex >= users.length) {
        logger.warn(
          `⚠️ Skipping session with invalid userIndex: ${sessionData.userIndex}`
        );
        continue;
      }

      const exerciseSession = await prisma.exerciseSession.create({
        data: {
          startedAt: new Date(sessionData.startedAt),
          endedAt: new Date(
            new Date(sessionData.startedAt).getTime() +
              sessionData.duration * 1000
          ),
          duration: sessionData.duration,
          repsCompleted: sessionData.repsCompleted,
          accuracy: sessionData.accuracy,
          maxAccuracy: sessionData.maxAccuracy,
          exerciseId: exercises[sessionData.exerciseIndex].id,
          userId: users[sessionData.userIndex].id,
          notes: `Score: ${sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0)}`,
          // snapshot fields
          pointsEarned:
            sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0),
          exerciseTitle: exercises[sessionData.exerciseIndex].title,
          difficulty: exercises[sessionData.exerciseIndex]
            .difficulty as ExerciseDifficulty,
        },
      });

      if (sessionData.hasReflection && sessionData.reflection) {
        await prisma.reflection.create({
          data: {
            exerciseSessionId: exerciseSession.id,
            fatigue: sessionData.reflection.fatigue,
            feedback: sessionData.reflection.feedback,
            rating: sessionData.reflection.rating,
          },
        });
      }
      sessionCount++;
    }
    logger.info(`✅ Created ${sessionCount} exercise sessions`);
  }

  // Calculate and update points for all users
  for (const user of users) {
    const userSessions = await prisma.exerciseSession.findMany({
      include: {
        reflection: true,
      },
      where: {
        userId: user.id,
      },
    });

    const totalScore = userSessions.reduce(
      (sum, session) =>
        sum +
        (session.pointsEarned ??
          session.accuracy * 100 + (session.reflection ? 20 : 0)),
      0
    );

    if (userSessions.length > 0) {
      await prisma.user.update({
        data: { points: totalScore },
        where: { id: user.id },
      });
      logger.info(
        `✅ Updated ${user.name} with ${totalScore} points from ${userSessions.length} sessions`
      );
    }
  }

  // Give Donald Duck some starter items
  const donaldDuck = users[0];
  await prisma.userInventory.createMany({
    data: [
      {
        isEquipped: true,
        itemId: "hat-baseball",
        userId: donaldDuck.id,
      },
      {
        isEquipped: true,
        itemId: "accessory-glasses",
        userId: donaldDuck.id,
      },
    ],
  });
  logger.info(`✅ Given ${donaldDuck.name} starter items`);

  // Build week reports for Donald (users[0]) from their sessions
  const donSessions = await prisma.exerciseSession.findMany({
    include: { reflection: true },
    where: { userId: donaldDuck.id },
  });

  const weeksMap: Record<
    string,
    { sessions: typeof donSessions; weekStart: Date }
  > = {};

  for (const s of donSessions) {
    const wk = startOfWeekMonday(s.startedAt);
    const key = wk.toISOString().slice(0, 10);
    if (!weeksMap[key]) {
      weeksMap[key] = { sessions: [], weekStart: wk };
    }
    weeksMap[key].sessions.push(s);
  }

  // sample mapping for statuses / clinician assignment (fake)
  const weekStatusMap: Record<string, ReviewStatus> = {
    "2026-02-09": ReviewStatus.NOT_SENT,
    "2026-02-16": ReviewStatus.REVIEWED,
    "2026-02-23": ReviewStatus.PENDING,
  };

  const weekFeedbackMap: Record<string, string> = {
    "2026-02-09": "Older week: no clinician review available.",
    "2026-02-16": "Steady progress; check ankle ROM next visit.",
    "2026-02-23": "Pending review - clinician to update notes.",
  };

  let createdWeekReports = 0;
  for (const [key, { sessions, weekStart }] of Object.entries(weeksMap)) {
    // Only create reports for weeks before the current program window.
    if (new Date(key) >= new Date("2026-03-03")) {
      continue;
    }

    const totalExercises = sessions.length;
    const totalPoints = sessions.reduce(
      (s, it) => s + (it.pointsEarned ?? 0),
      0
    );

    const reflections = sessions.filter((s) => s.reflection);
    const avgSatisfaction =
      reflections.length > 0
        ? reflections.reduce((sum, r) => sum + (r.reflection!.rating || 0), 0) /
          reflections.length
        : null;
    const avgFatigue =
      reflections.length > 0
        ? reflections.reduce(
            (sum, r) => sum + (r.reflection!.fatigue || 0),
            0
          ) / reflections.length
        : null;

    const status = weekStatusMap[key] ?? ReviewStatus.NOT_SENT;
    const feedback = weekFeedbackMap[key] ?? "";

    // clinician assigned only for REVIEWED weeks
    const clinicianId =
      status === ReviewStatus.REVIEWED && clinicianUser
        ? clinicianUser.id
        : null;

    // upsert week report (unique userId + weekStart)
    await prisma.weekReport.upsert({
      create: {
        avgFatigue,
        avgSatisfaction,
        clinicianId,
        feedback,
        status,
        totalExercises,
        totalPoints,
        userId: donaldDuck.id,
        weekStart,
      },
      update: {
        avgFatigue,
        avgSatisfaction,
        clinicianId,
        feedback,
        status,
        totalExercises,
        totalPoints,
      },
      where: {
        userId_weekStart: {
          userId: donaldDuck.id,
          weekStart: weekStart,
        },
      },
    });

    createdWeekReports++;
  }

  logger.info(
    `✅ Created/updated ${createdWeekReports} WeekReport(s) for ${donaldDuck.name}`
  );

  const avgAccuracy = seedData.sessions
    ? seedData.sessions.reduce((sum, s) => sum + s.accuracy, 0) /
      seedData.sessions.length
    : 0;

  logger.info("\n✅ Database seeded successfully!");
  logger.info("\n📊 Summary:");
  logger.info(`  - Users: ${users.length}`);
  logger.info(`  - Plans: ${plans.length}`);
  logger.info(`  - Exercises: ${exercises.length}`);
  logger.info(`  - Sessions: ${seedData.sessions?.length || 0}`);
  logger.info(`  - Shop items: ${createdShopItems.length}`);
  logger.info(`  - Average accuracy: ${avgAccuracy.toFixed(1)}%`);

  logger.info("\n💡 Score formula: (accuracy × 100) + 20 bonus for reflection");
  logger.info("\n🛍️  Shop is ready with hats and accessories!");
  logger.info("\n🎯 Leaderboard will show rankings for all users!");

  logger.info("\n🔐 Login Credentials:");
  logger.info("  • demo@disknee.com / demo123");
  logger.info("  • mickey@disknee.com / demo123");
  logger.info("  • goofy@disknee.com / demo123");
  logger.info("  • minnie@disknee.com / demo123");
  logger.info("  • daisy@disknee.com / demo123");
  logger.info("  • physio@example.com / physio2024");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    logger.error("❌ Error seeding database:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
