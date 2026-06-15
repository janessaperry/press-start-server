import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { ENV } from "../src/config/env";
import { PrismaClient } from '../src/generated/prisma/client'

const connectionString = ENV.DATABASE_URL;

const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

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
        igdbGameId: 366893,
        libraryStatus: "WISHLIST",
      },
      {
        userId: userOne.id,
        igdbGameId: 358525,
        libraryStatus: "WANT_TO_PLAY",
      },
      {
        userId: userTwo.id,
        igdbGameId: 358535,
        libraryStatus: "PLAYED",
      },
      {
        userId: userTwo.id,
        igdbGameId: 325594,
        libraryStatus: "WANT_TO_PLAY",
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