import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import seedData from "./seed.json";
import shopItems from "./shop-seed.json";
import { Difficulty } from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database with JSON data...");

  // Clean up existing data
  await prisma.userInventory.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.session.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

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
      // Create user directly in database with email/password fields
      const user = await prisma.user.create({
        data: {
          name: userCred.name,
          email: userCred.email,
          emailVerified: true, // Mark as verified for demo
        },
      });

      // Create account record for email/password with hashed password
      const hashedPassword = await hash(userCred.password, 10);
      await prisma.account.create({
        data: {
          providerId: "credential",
          accountId: userCred.email,
          userId: user.id,
          password: hashedPassword,
        },
      });

      users.push(user);
      console.log(`✅ Created user: ${userCred.name} (${userCred.email})`);
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
  console.log(`✅ Created ${createdShopItems.length} shop items`);

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
          // Better Auth required fields
          token: `session-token-${Math.random().toString(36).substring(2)}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now

          // App-specific session data
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

  // Calculate and update points for all users
  for (const user of users) {
    const userSessions = await prisma.session.findMany({
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
      console.log(
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
  console.log(`✅ Given ${donaldDuck.name} starter items`);

  const avgAccuracy = seedData.sessions
    ? seedData.sessions.reduce((sum, s) => sum + s.accuracy, 0) /
      seedData.sessions.length
    : 0;

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Plans: ${plans.length}`);
  console.log(`  - Exercises: ${exercises.length}`);
  console.log(`  - Sessions: ${seedData.sessions?.length || 0}`);
  console.log(`  - Shop items: ${createdShopItems.length}`);
  console.log(`  - Average accuracy: ${avgAccuracy.toFixed(1)}%`);

  console.log("\n💡 Score formula: (accuracy × 100) + 20 bonus for reflection");
  console.log("\n🛍️  Shop is ready with hats and accessories!");
  console.log("\n🎯 Leaderboard will show rankings for all users!");

  console.log("\n🔐 Login Credentials:");
  console.log("  • demo@disknee.com / demo123");
  console.log("  • patient@example.com / patient2024");
  console.log("  • physio@example.com / physio2024");
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
