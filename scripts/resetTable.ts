import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({connectionString});

const prisma = new PrismaClient({adapter});

async function resetTable (tableName: string) {
  console.log("ARGUMENT:", tableName);

  const model = prisma[tableName as keyof typeof prisma] as any;
  if (!model) {
    console.error(`${tableName} not found`);
    return;
  }

  const deletedCount = await model.deleteMany();
  console.log(`${deletedCount.count} records deleted from ${tableName} table`);
  await prisma.$disconnect();
}

void resetTable(process.argv[2]);