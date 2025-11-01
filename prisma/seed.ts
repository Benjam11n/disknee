import { prisma } from "@/lib/prisma";
import seedData from "../app/seed.json";
import { Difficulty } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database with JSON data...");

  // Clean up existing data
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create users
  const users = await Promise.all(
    seedData.users.map((user) =>
      prisma.user.create({
        data: { name: user.name },
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);

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
  console.log(`✅ Created ${plans.length} plans`);

  // Create exercises
  const exercises = await Promise.all(
    seedData.exercises.map((ex, index) => {
      const planIndex = index % plans.length;
      return prisma.exercise.create({
        data: {
          id: ex.id,
          title: ex.title,
          estimatedMins: ex.estimatedMins,
          difficulty:
            ex.difficulty === "easy"
              ? Difficulty.EASY
              : ex.difficulty === "moderate"
              ? Difficulty.MODERATE
              : Difficulty.HARD,
          done: ex.done,
          planId: plans[planIndex].id,
        },
      });
    })
  );
  console.log(`✅ Created ${exercises.length} exercises`);

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
    console.log(`✅ Created ${seedData.appointments.length} appointments`);
  }

  // Create sessions and reflections
  if (seedData.sessions) {
    for (const sessionData of seedData.sessions) {
      const session = await prisma.session.create({
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
          notes: `Score: ${
            sessionData.accuracy * 100 +
            (sessionData.hasReflection ? 20 : 0)
          }`,
        },
      });

      if (sessionData.hasReflection && sessionData.reflection) {
        await prisma.reflection.create({
          data: {
            sessionId: session.id,
            rating: sessionData.reflection.rating,
            fatigue: sessionData.reflection.fatigue,
            feedback: sessionData.reflection.feedback,
          },
        });
      }
    }
    console.log(`✅ Created ${seedData.sessions.length} sessions`);
  }

  // Calculate score summary for Donald Duck (index 0)
  const donaldDuckSessions = await prisma.session.findMany({
    where: {
      // Note: We're filtering by recent sessions since we don't have user relation
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      reflection: true,
    },
  });

  const totalScore = donaldDuckSessions.reduce((sum, session) => {
    return sum + (session.accuracy * 100 + (session.reflection ? 20 : 0));
  }, 0);

  const avgAccuracy = donaldDuckSessions.length > 0
    ? donaldDuckSessions.reduce((sum, session) => sum + session.accuracy, 0) / donaldDuckSessions.length
    : 0;

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Plans: ${plans.length}`);
  console.log(`  - Exercises: ${exercises.length}`);
  console.log(`  - Sessions: ${seedData.sessions?.length || 0}`);
  console.log(`  - Total score (last 30 days): ${totalScore}`);
  console.log(`  - Average accuracy: ${avgAccuracy.toFixed(1)}%`);

  console.log("\n💡 Score formula: (accuracy × 100) + 20 bonus for reflection");
  console.log("\n🎯 Leaderboard will show rankings based on session performance!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });