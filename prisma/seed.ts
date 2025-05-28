import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.userGame.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.upsert({
    where: { email: 'userOne@email.com' },
    update: {},
    create: {
      username: 'janessaperry',
      email: 'userOne@email.com',
      userGames: {
        create: [
          {
            apiGameId: "1234567890",
            status: "Want to Play",
          },
          {
            apiGameId: "34567890",
            status: "Want to Play",
          },
        ],
      }
    }
  })

   await prisma.user.upsert({
    where: { email: 'userTwo@email.com' },
    update: {},
    create: {
      username: 'louieisacutie',
      email: 'userTwo@email.com',
      userGames: {
        create: [
          {
            apiGameId: "1234590",
            status: "Want to Play",
          },
          {
            apiGameId: "34567890",
            status: "Want to Play",
          },
        ],
      }
    }
  })
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});