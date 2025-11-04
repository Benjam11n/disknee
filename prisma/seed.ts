import { prisma } from "@/lib/prisma";
import seedData from "./seed.json";
import shopItems from "./shop-seed.json";
import { ExerciseDifficulty } from "@prisma/client";
import { createSeedUser } from "@/lib/seed-users";
import { logger } from "@/lib/logger";

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
  await prisma.user.deleteMany();

  logger.info("🧹 Cleaned existing data");

  // Create users with Better Auth
  const userCredentials = [
    { name: "Donald Duck", email: "demo@disknee.com", password: "demo123" },
    {
      name: "John Patient",
      email: "patient@example.com",
      password: "patient2024",
    },
    { name: "Dr. Smith", email: "physio@example.com", password: "physio2024" },
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
  const createdShopItems = await Promise.all(
    shopItems.map((item) =>
      prisma.shopItem.create({
        data: {
          id: item.id,
          name: item.name,
          description: item.description,
          icon: item.icon,
          type: item.type,
          price: item.price,
          isActive: item.active,
        },
      })
    )
  );
  logger.info(`✅ Created ${createdShopItems.length} shop items`);

  // Create plans
  const plans = await Promise.all(
    seedData.plans.map((plan) =>
      prisma.plan.create({
        data: {
          id: plan.id,
          date: new Date(plan.date),
          title: plan.title,
          when: plan.when,
        },
      })
    )
  );
  logger.info(`✅ Created ${plans.length} plans`);

  // Create exercises
  const exercises = await Promise.all(
    seedData.exercises.map((ex, index) => {
      const planIndex = index % plans.length;
      // Calculate sequence number (1-based) within each plan
      const exercisesInThisPlan = Math.ceil((index + 1) / plans.length);
      return prisma.exercise.create({
        data: {
          id: ex.id,
          title: ex.title,
          estimatedMins: ex.estimatedMins,
          difficulty:
            ex.difficulty === "easy"
              ? ExerciseDifficulty.EASY
              : ex.difficulty === "moderate"
              ? ExerciseDifficulty.MODERATE
              : ExerciseDifficulty.HARD,
          done: ex.done,
          sequence: exercisesInThisPlan, // This will work after you add the sequence column to DB
          planId: plans[planIndex].id,
        },
      });
    })
  );
  logger.info(`✅ Created ${exercises.length} exercises`);

  // Create appointments
  if (seedData.appointments) {
    await Promise.all(
      seedData.appointments.map((appt) =>
        prisma.appointment.create({
          data: {
            id: appt.id,
            start: new Date(appt.start),
            doctorName: appt.doctorName,
            doctorSpecialty: appt.doctorSpecialty,
            locationName: appt.locationName,
            locationAddr: appt.locationAddr,
          },
        })
      )
    );
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
          notes: `Score: ${
            sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0)
          }`,
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
      return sum + (session.accuracy * 100 + (session.reflection ? 20 : 0));
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
        itemId: "hat-baseball",
        isEquipped: true,
      },
      {
        userId: donaldDuck.id,
        itemId: "accessory-glasses",
        isEquipped: true,
      },
    ],
  });
  logger.info(`✅ Given ${donaldDuck.name} starter items`);

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
  logger.info("  • patient@example.com / patient2024");
  logger.info("  • physio@example.com / physio2024");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
