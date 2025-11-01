import {
  PrismaClient,
  UserRole,
  Difficulty,
  ApptStatus,
} from "../lib/generated/prisma";
import seedData from "../app/seed.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.exerciseProgress.deleteMany();
  await prisma.patientPlan.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.planExercise.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create main user (Donald Duck)
  const mainUser = await prisma.user.create({
    data: {
      email: "donald.duck@example.com",
      name: seedData.patientName,
      role: UserRole.PATIENT,
    },
  });

  console.log(`✅ Created user: ${mainUser.name}`);

  // Create exercises
  const exercises = await Promise.all(
    seedData.exercises.map((ex) =>
      prisma.exercise.create({
        data: {
          title: ex.title,
          slug: ex.id,
          difficulty:
            ex.difficulty === "easy"
              ? Difficulty.EASY
              : ex.difficulty === "moderate"
              ? Difficulty.MODERATE
              : Difficulty.HARD,
          estimatedMins: ex.estimatedMins,
          description: `Description for ${ex.title}`,
          category: "rehabilitation",
          tags: ["knee", "physiotherapy", ex.difficulty],
        },
      })
    )
  );

  console.log(`✅ Created ${exercises.length} exercises`);

  // Create a default treatment plan
  const treatmentPlan = await prisma.plan.create({
    data: {
      title: "Standard Knee Rehabilitation Program",
      slug: "standard-knee-rehab",
      description: "A comprehensive 10-week knee rehabilitation program",
      programWeeks: seedData.programWeeks,
      difficulty: Difficulty.MODERATE,
      category: "post-surgery",
    },
  });

  console.log(`✅ Created treatment plan: ${treatmentPlan.title}`);

  // Create plan-exercise relations
  const planExercises = await Promise.all(
    exercises.map((exercise, index) =>
      prisma.planExercise.create({
        data: {
          planId: treatmentPlan.id,
          exerciseId: exercise.id,
          order: index + 1,
          weekNumber: Math.floor(index / 3) + 1,
          sets: 3,
          reps: index % 2 === 0 ? 10 : 15,
          holdSeconds: index === 0 ? 5 : undefined,
          restTime: 60,
          notes: index === 0 ? "Focus on form" : "Control the movement",
        },
      })
    )
  );

  console.log(`✅ Created ${planExercises.length} plan-exercise relations`);

  // Enroll user in the treatment plan
  await prisma.patientPlan.create({
    data: {
      userId: mainUser.id,
      planId: treatmentPlan.id,
      weeksCompleted: seedData.weeksCompleted,
      overallPercent: seedData.overallPercent,
    },
  });

  console.log(`✅ Enrolled user in treatment plan`);

  // Create appointments
  if (seedData.appointments && seedData.appointments.length > 0) {
    await Promise.all(
      seedData.appointments.map((appt) =>
        prisma.appointment.create({
          data: {
            userId: mainUser.id,
            doctorName: appt.doctorName,
            doctorSpecialty: appt.doctorSpecialty,
            locationName: appt.locationName,
            locationAddr: appt.locationAddr,
            start: new Date(appt.start),
            status: ApptStatus.SCHEDULED,
          },
        })
      )
    );
    console.log(`✅ Created appointments`);
  }

  // Create progress tracking for leaderboard users
  if (seedData.leaderboard && seedData.leaderboard.length > 0) {
    await Promise.all(
      seedData.leaderboard.map((entry) => {
        // Create or update the user
        return prisma.user.upsert({
          where: {
            email: `${entry.name
              .toLowerCase()
              .replace(/\s+/g, ".")}@example.com`,
          },
          update: {},
          create: {
            email: `${entry.name
              .toLowerCase()
              .replace(/\s+/g, ".")}@example.com`,
            name: entry.name,
            role: UserRole.PATIENT,
          },
        });
      })
    );

    // Now create progress entries
    const leaderboardUsers = await prisma.user.findMany({
      where: {
        name: {
          in: seedData.leaderboard.map((entry) => entry.name),
        },
      },
    });

    await Promise.all(
      leaderboardUsers.map((user) => {
        const leaderboardEntry = seedData.leaderboard.find(
          (entry) => entry.name === user.name
        );
        if (leaderboardEntry) {
          return prisma.progress.upsert({
            where: { userId: user.id },
            update: {
              totalWeeks: leaderboardEntry.weeks,
              completedWeeks: leaderboardEntry.weeks,
              overallPercent: leaderboardEntry.percent,
              rank: leaderboardEntry.rank,
            },
            create: {
              userId: user.id,
              totalWeeks: leaderboardEntry.weeks,
              completedWeeks: leaderboardEntry.weeks,
              overallPercent: leaderboardEntry.percent,
              rank: leaderboardEntry.rank,
            },
          });
        }
      })
    );

    console.log(
      `✅ Created progress tracking for ${leaderboardUsers.length} users`
    );
  }

  // Create some sample plans from the data
  if (seedData.plans && seedData.plans.length > 0) {
    const samplePlans = await Promise.all(
      seedData.plans
        .filter((_, index) => index < 3) // Just create first 3 as samples
        .map((plan) =>
          prisma.plan.create({
            data: {
              title: plan.title,
              slug: `plan-${plan.id}`,
              description: `Sample plan: ${plan.title}`,
              programWeeks: 10,
              difficulty: Difficulty.MODERATE,
              category: "rehabilitation",
            },
          })
        )
    );

    console.log(`✅ Created ${samplePlans.length} sample plans`);
  }

  // Create a sample session for Donald Duck
  const sampleSession = await prisma.session.create({
    data: {
      userId: mainUser.id,
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
  console.log(
    `  - Users: 1 main + ${seedData.leaderboard?.length || 0} leaderboard users`
  );
  console.log(`  - Exercises: ${exercises.length}`);
  console.log(`  - Plans: 1 main treatment plan`);
  console.log(`  - Appointments: ${seedData.appointments?.length || 0}`);
  console.log(`  - Sample session and reflection created`);
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
