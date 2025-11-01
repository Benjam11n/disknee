import { prisma } from "@/lib/prisma";
import seedData from "../app/seed.json";
import { Difficulty, Plan } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database with simplified schema...");

  // Clean up existing data
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.appointment.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create plans from seed data first (since exercises reference plans)
  let plans: Plan[] = [];
  if (seedData.plans && seedData.plans.length > 0) {
    plans = await Promise.all(
      seedData.plans.map((plan) =>
        prisma.plan.create({
          data: {
            date: new Date(plan.date),
            title: plan.title,
            when: plan.when,
          },
        })
      )
    );

    console.log(`✅ Created ${plans.length} plans`);
  }

  // Create exercises from seed data and associate them with plans
  const exercises = await Promise.all(
    seedData.exercises.map((ex, index) => {
      // Distribute exercises across the available plans
      // Each exercise gets assigned to a plan based on its index
      const planIndex = index % plans.length;
      const assignedPlan = plans[planIndex];

      return prisma.exercise.create({
        data: {
          title: ex.title,
          estimatedMins: ex.estimatedMins,
          difficulty:
            ex.difficulty === "easy"
              ? Difficulty.EASY
              : ex.difficulty === "moderate"
              ? Difficulty.MODERATE
              : Difficulty.HARD,
          done: ex.done,
          planId: assignedPlan?.id,
        },
      });
    })
  );

  console.log(
    `✅ Created ${exercises.length} exercises with plan associations`
  );

  // Create appointments from seed data
  if (seedData.appointments && seedData.appointments.length > 0) {
    await Promise.all(
      seedData.appointments.map((appt) =>
        prisma.appointment.create({
          data: {
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

  // Create leaderboard entries from seed data
  if (seedData.leaderboard && seedData.leaderboard.length > 0) {
    await Promise.all(
      seedData.leaderboard.map((entry) =>
        prisma.leaderboard.create({
          data: {
            name: entry.name,
            weeks: entry.weeks,
            accuracyPercentage: entry.accuracyPercentage,
            score: entry.score,
          },
        })
      )
    );

    console.log(
      `✅ Created ${seedData.leaderboard.length} leaderboard entries`
    );
  }

  // Create a sample session and reflection
  const sampleSession = await prisma.session.create({
    data: {
      startedAt: new Date(),
      endedAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes later
      duration: 15 * 60, // 15 minutes in seconds
      repsCompleted: 15,
      accuracy: 87,
      maxAccuracy: 92,
      notes: "Good session, patient showed improvement",
    },
  });

  console.log(`✅ Created sample session`);

  // Create a sample reflection
  await prisma.reflection.create({
    data: {
      sessionId: sampleSession.id,
      rating: 4,
      fatigue: 3,
      feedback: "Felt good, knee is less painful today",
    },
  });

  console.log(`✅ Created sample reflection`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Plans: ${plans.length}`);
  console.log(`  - Exercises: ${exercises.length} (distributed across plans)`);
  console.log(`  - Appointments: ${seedData.appointments?.length || 0}`);
  console.log(`  - Leaderboard entries: ${seedData.leaderboard?.length || 0}`);
  console.log(`  - Sample session and reflection created`);

  // Show plan-exercise distribution
  console.log("\n📋 Exercise Distribution:");
  exercises.forEach((ex, index) => {
    const assignedPlanIndex = index % plans.length;
    console.log(
      `  Exercise "${ex.title.substring(0, 30)}..." → Plan: "${
        plans[assignedPlanIndex]?.title
      }"`
    );
  });
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
