import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~/generated/prisma/client';
import { userSeeder } from './user-seeder';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.info('⚡ Seeding deterministic data...');
  await userSeeder();
}

main()
  .then(() => {
    console.info('✅ Seed data successfully created');
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
