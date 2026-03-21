import { prisma } from '@/lib/prisma';
import seedData from './seed.json';
import shopItems from './shop-seed.json';
import { ExerciseDifficulty, ReviewStatus } from '@prisma/client';
import { createSeedUser } from '@/lib/seed-users';
import { logger } from '@/lib/logger';
import { startOfWeekMonday } from '@/lib/utils/date-utils';

async function main() {
  logger.info('🌱 Seeding database with JSON data...');

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

  logger.info('🧹 Cleaned existing data');

  // Create users with Better Auth
  const userCredentials = [
    { name: 'Donald Duck', email: 'demo@disknee.com', password: 'demo123' },
    {
      name: 'John Patient',
      email: 'patient@example.com',
      password: 'patient2024',
    },
    { name: 'Dr. Smith', email: 'physio@example.com', password: 'physio2024' },
  ];

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

  // Create shop items
  const createdShopItems = [];
  for (const item of shopItems) {
    const shopItem = await prisma.shopItem.create({
      data: {
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        type: item.type,
        price: item.price,
        isActive: item.active,
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
        id: plan.id,
        date: new Date(plan.date),
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
          ex.difficulty === 'easy'
            ? ExerciseDifficulty.EASY
            : ex.difficulty === 'moderate'
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
          id: appt.id,
          start: new Date(appt.start),
          doctorName: appt.doctorName,
          doctorSpecialty: appt.doctorSpecialty,
          locationName: appt.locationName,
          locationAddr: appt.locationAddr,
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
        logger.warn(`⚠️ Skipping session with invalid exerciseIndex: ${sessionData.exerciseIndex}`);
        continue;
      }
      if (sessionData.userIndex >= users.length) {
        logger.warn(`⚠️ Skipping session with invalid userIndex: ${sessionData.userIndex}`);
        continue;
      }

      const exerciseSession = await prisma.exerciseSession.create({
        data: {
          startedAt: new Date(sessionData.startedAt),
          endedAt: new Date(
            new Date(sessionData.startedAt).getTime() + sessionData.duration * 1000
          ),
          duration: sessionData.duration,
          repsCompleted: sessionData.repsCompleted,
          accuracy: sessionData.accuracy,
          maxAccuracy: sessionData.maxAccuracy,
          exerciseId: exercises[sessionData.exerciseIndex].id,
          userId: users[sessionData.userIndex].id,
          notes: `Score: ${sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0)}`,
          // snapshot fields
          pointsEarned: sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0),
          exerciseTitle: exercises[sessionData.exerciseIndex].title,
          difficulty: exercises[sessionData.exerciseIndex].difficulty as ExerciseDifficulty,
        },
      });

      if (sessionData.hasReflection && sessionData.reflection) {
        await prisma.reflection.create({
          data: {
            exerciseSessionId: exerciseSession.id,
            rating: sessionData.reflection.rating,
            fatigue: sessionData.reflection.fatigue,
            feedback: sessionData.reflection.feedback,
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
      where: {
        userId: user.id,
      },
      include: {
        reflection: true,
      },
    });

    const totalScore = userSessions.reduce((sum, session) => {
      return sum + (session.pointsEarned ?? session.accuracy * 100 + (session.reflection ? 20 : 0));
    }, 0);

    if (userSessions.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { points: totalScore },
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
        userId: donaldDuck.id,
        itemId: 'hat-baseball',
        isEquipped: true,
      },
      {
        userId: donaldDuck.id,
        itemId: 'accessory-glasses',
        isEquipped: true,
      },
    ],
  });
  logger.info(`✅ Given ${donaldDuck.name} starter items`);

  // Build week reports for Donald (users[0]) from their sessions
  const donSessions = await prisma.exerciseSession.findMany({
    where: { userId: donaldDuck.id },
    include: { reflection: true },
  });

  const weeksMap: Record<string, { sessions: typeof donSessions; weekStart: Date }> = {};

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
    '2026-02-09': ReviewStatus.NOT_SENT,
    '2026-02-16': ReviewStatus.REVIEWED,
    '2026-02-23': ReviewStatus.PENDING,
  };

  const weekFeedbackMap: Record<string, string> = {
    '2026-02-09': 'Older week: no clinician review available.',
    '2026-02-16': 'Steady progress; check ankle ROM next visit.',
    '2026-02-23': 'Pending review - clinician to update notes.',
  };

  let createdWeekReports = 0;
  for (const [key, { sessions, weekStart }] of Object.entries(weeksMap)) {
    // Only create reports for weeks before the current program window.
    if (new Date(key) >= new Date('2026-03-03')) {
      continue;
    }

    const totalExercises = sessions.length;
    const totalPoints = sessions.reduce((s, it) => s + (it.pointsEarned ?? 0), 0);

    const reflections = sessions.filter((s) => s.reflection);
    const avgSatisfaction =
      reflections.length > 0
        ? reflections.reduce((sum, r) => sum + (r.reflection!.rating || 0), 0) / reflections.length
        : null;
    const avgFatigue =
      reflections.length > 0
        ? reflections.reduce((sum, r) => sum + (r.reflection!.fatigue || 0), 0) / reflections.length
        : null;

    const status = weekStatusMap[key] ?? ReviewStatus.NOT_SENT;
    const feedback = weekFeedbackMap[key] ?? '';

    // clinician assigned only for REVIEWED weeks (use Dr. Smith if exists)
    const clinicianId = status === ReviewStatus.REVIEWED && users[2] ? users[2].id : null;

    // upsert week report (unique userId + weekStart)
    await prisma.weekReport.upsert({
      where: {
        userId_weekStart: {
          userId: donaldDuck.id,
          weekStart: weekStart,
        },
      },
      update: {
        status,
        feedback,
        totalExercises,
        avgSatisfaction,
        avgFatigue,
        totalPoints,
        clinicianId,
      },
      create: {
        userId: donaldDuck.id,
        weekStart,
        status,
        feedback,
        totalExercises,
        avgSatisfaction,
        avgFatigue,
        totalPoints,
        clinicianId,
      },
    });

    createdWeekReports++;
  }

  logger.info(`✅ Created/updated ${createdWeekReports} WeekReport(s) for ${donaldDuck.name}`);

  const avgAccuracy = seedData.sessions
    ? seedData.sessions.reduce((sum, s) => sum + s.accuracy, 0) / seedData.sessions.length
    : 0;

  logger.info('\n✅ Database seeded successfully!');
  logger.info('\n📊 Summary:');
  logger.info(`  - Users: ${users.length}`);
  logger.info(`  - Plans: ${plans.length}`);
  logger.info(`  - Exercises: ${exercises.length}`);
  logger.info(`  - Sessions: ${seedData.sessions?.length || 0}`);
  logger.info(`  - Shop items: ${createdShopItems.length}`);
  logger.info(`  - Average accuracy: ${avgAccuracy.toFixed(1)}%`);

  logger.info('\n💡 Score formula: (accuracy × 100) + 20 bonus for reflection');
  logger.info('\n🛍️  Shop is ready with hats and accessories!');
  logger.info('\n🎯 Leaderboard will show rankings for all users!');

  logger.info('\n🔐 Login Credentials:');
  logger.info('  • demo@disknee.com / demo123');
  logger.info('  • patient@example.com / patient2024');
  logger.info('  • physio@example.com / physio2024');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
