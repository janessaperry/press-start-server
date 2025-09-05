import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main () {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.passwordResetToken.deleteMany();
  await prisma.userGame.deleteMany();
  await prisma.user.deleteMany();

  const userOne = await prisma.user.create({
    data: {
      email: 'userOne@email.com',
      hashedPassword: hashedPassword,
    }
  });

  const userTwo = await prisma.user.create({
    data: {
      email: 'userTwo@email.com',
      hashedPassword,
    }
  })

  await prisma.userGame.createMany({
    data: [
      {
        userId: userOne.id,
        apiGameId: "1234567890",
        status: "Wishlist",
      },
      {
        userId: userOne.id,
        apiGameId: "34567890",
        status: "Want to Play",
      },
      {
        userId: userTwo.id,
        apiGameId: "1234590",
        status: "Played",
      },
      {
        userId: userTwo.id,
        apiGameId: "34567890",
        status: "Want to Play",
      },
    ]
  })

  await prisma.passwordResetToken.create({
    data: {
      userId: userOne.id,
      token: "dev-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 15)
    }
  })

  console.log("Seed data created!");
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});