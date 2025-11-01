import { prisma } from "@/lib/prisma";
import seedData from "../app/seed.json";
import { Difficulty, Plan } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database with comprehensive data...");

  // Clean up existing data
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create users first
  const users = await Promise.all([
    prisma.user.create({
      data: { name: "Donald Duck" },
    }),
    prisma.user.create({
      data: { name: "Mickey Mouse" },
    }),
    prisma.user.create({
      data: { name: "Goofy" },
    }),
    prisma.user.create({
      data: { name: "Minnie Mouse" },
    }),
    prisma.user.create({
      data: { name: "Daisy Duck" },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

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

  // Create comprehensive session data for Donald Duck (our main user)
  const donaldDuck = users[0];
  const now = new Date();

  // Create multiple sessions over the past few weeks with varying performance
  const sessionsData = [
    // Recent sessions (this week)
    {
      startedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      duration: 300, // 5 minutes
      repsCompleted: 10,
      accuracy: 92,
      maxAccuracy: 95,
      exerciseId: exercises[0].id,
      hasReflection: true,
      rating: 5,
      fatigue: 2,
      feedback: "Great session! Feeling stronger.",
    },
    {
      startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      duration: 360, // 6 minutes
      repsCompleted: 12,
      accuracy: 88,
      maxAccuracy: 90,
      exerciseId: exercises[1].id,
      hasReflection: true,
      rating: 4,
      fatigue: 3,
      feedback: "Good form today, slightly tired.",
    },
    {
      startedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      duration: 240, // 4 minutes
      repsCompleted: 8,
      accuracy: 95,
      maxAccuracy: 98,
      exerciseId: exercises[2].id,
      hasReflection: false, // No reflection = no bonus
    },
    // Last week sessions
    {
      startedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      duration: 420, // 7 minutes
      repsCompleted: 15,
      accuracy: 85,
      maxAccuracy: 88,
      exerciseId: exercises[3].id,
      hasReflection: true,
      rating: 4,
      fatigue: 3,
      feedback: "Challenging but managed well.",
    },
    {
      startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      duration: 300, // 5 minutes
      repsCompleted: 10,
      accuracy: 90,
      maxAccuracy: 93,
      exerciseId: exercises[4].id,
      hasReflection: true,
      rating: 5,
      fatigue: 2,
      feedback: "Excellent progress!",
    },
    {
      startedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      duration: 360, // 6 minutes
      repsCompleted: 12,
      accuracy: 87,
      maxAccuracy: 91,
      exerciseId: exercises[0].id,
      hasReflection: true,
      rating: 4,
      fatigue: 4,
      feedback: "Knee felt a bit stiff today.",
    },
    // Two weeks ago
    {
      startedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      duration: 300, // 5 minutes
      repsCompleted: 10,
      accuracy: 93,
      maxAccuracy: 96,
      exerciseId: exercises[1].id,
      hasReflection: true,
      rating: 5,
      fatigue: 2,
      feedback: "Best session yet!",
    },
  ];

  // Create sessions and reflections
  for (const sessionData of sessionsData) {
    const session = await prisma.session.create({
      data: {
        startedAt: sessionData.startedAt,
        endedAt: new Date(sessionData.startedAt.getTime() + sessionData.duration * 1000),
        duration: sessionData.duration,
        repsCompleted: sessionData.repsCompleted,
        accuracy: sessionData.accuracy,
        maxAccuracy: sessionData.maxAccuracy,
        exerciseId: sessionData.exerciseId,
        notes: `Session score: ${sessionData.accuracy * 100 + (sessionData.hasReflection ? 20 : 0)}`,
      },
    });

    if (sessionData.hasReflection) {
      await prisma.reflection.create({
        data: {
          sessionId: session.id,
          rating: sessionData.rating,
          fatigue: sessionData.fatigue,
          feedback: sessionData.feedback,
        },
      });
    }
  }

  // Create some sessions for other users to make leaderboard more interesting
  const otherUsersSessions = [
    // Mickey Mouse - High performer
    {
      userId: users[1].id,
      sessions: [
        { accuracy: 98, hasReflection: true, daysAgo: 2 },
        { accuracy: 96, hasReflection: true, daysAgo: 4 },
        { accuracy: 99, hasReflection: true, daysAgo: 7 },
        { accuracy: 97, hasReflection: true, daysAgo: 9 },
        { accuracy: 95, hasReflection: true, daysAgo: 11 },
      ]
    },
    // Goofy - Moderate performer
    {
      userId: users[2].id,
      sessions: [
        { accuracy: 85, hasReflection: false, daysAgo: 1 },
        { accuracy: 88, hasReflection: true, daysAgo: 3 },
        { accuracy: 82, hasReflection: false, daysAgo: 6 },
        { accuracy: 90, hasReflection: true, daysAgo: 8 },
        { accuracy: 86, hasReflection: true, daysAgo: 10 },
      ]
    },
    // Minnie Mouse - High performer with consistency
    {
      userId: users[3].id,
      sessions: [
        { accuracy: 94, hasReflection: true, daysAgo: 2 },
        { accuracy: 95, hasReflection: true, daysAgo: 5 },
        { accuracy: 93, hasReflection: true, daysAgo: 7 },
        { accuracy: 96, hasReflection: true, daysAgo: 9 },
        { accuracy: 94, hasReflection: true, daysAgo: 12 },
      ]
    },
    // Daisy Duck - Improving performer
    {
      userId: users[4].id,
      sessions: [
        { accuracy: 78, hasReflection: false, daysAgo: 1 },
        { accuracy: 82, hasReflection: true, daysAgo: 3 },
        { accuracy: 85, hasReflection: true, daysAgo: 5 },
        { accuracy: 88, hasReflection: true, daysAgo: 7 },
        { accuracy: 91, hasReflection: true, daysAgo: 9 },
      ]
    },
  ];

  // Create sessions for other users
  for (const userSession of otherUsersSessions) {
    for (const session of userSession.sessions) {
      const sessionStart = new Date(now.getTime() - session.daysAgo * 24 * 60 * 60 * 1000);
      const createdSession = await prisma.session.create({
        data: {
          startedAt: sessionStart,
          endedAt: new Date(sessionStart.getTime() + 300 * 1000), // 5 min sessions
          duration: 300,
          repsCompleted: 10,
          accuracy: session.accuracy,
          maxAccuracy: session.accuracy + 3,
          exerciseId: exercises[Math.floor(Math.random() * exercises.length)].id,
        },
      });

      if (session.hasReflection) {
        await prisma.reflection.create({
          data: {
            sessionId: createdSession.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
            fatigue: Math.floor(Math.random() * 3) + 2, // 2-4 fatigue
            feedback: "Good session!",
          },
        });
      }
    }
  }

  console.log(`✅ Created ${sessionsData.length} sessions for Donald Duck`);
  console.log(`✅ Created sessions for other users`);

  // Calculate and display score summary
  const donaldSessions = await prisma.session.findMany({
    where: {
      createdAt: {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: {
      reflection: true,
    },
  });

  const totalScore = donaldSessions.reduce((sum, session) => {
    return sum + (session.accuracy * 100 + (session.reflection ? 20 : 0));
  }, 0);

  const avgAccuracy = donaldSessions.reduce((sum, session) => sum + session.accuracy, 0) / donaldSessions.length;

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Plans: ${plans.length}`);
  console.log(`  - Exercises: ${exercises.length}`);
  console.log(`  - Appointments: ${seedData.appointments?.length || 0}`);
  console.log(`  - Sessions (Donald Duck): ${donaldSessions.length}`);
  console.log(`  - Donald Duck's total score: ${totalScore}`);
  console.log(`  - Donald Duck's avg accuracy: ${avgAccuracy.toFixed(1)}%`);
  console.log(`  - Weeks active: ${new Set(donaldSessions.map(s => s.startedAt.toISOString().split('T')[0])).size}`);

  console.log("\n💡 Score calculation: (accuracy × 100) + 20 bonus for reflection");
  console.log("\n🎯 Leaderboard will be updated based on session data!");
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