import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~/generated/prisma/client';
import 'dotenv/config';
import { seedIam } from './iam-seeder';
import { seedUsersProfile } from './user-seeder';
import { seedMedia } from './media-seeder';
import { seedProjects } from './project-seeder';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.info('⚡ Seeding deterministic data...');
  // Step 1: Seed IAM domain (Roles, Permissions, Users)
  const { mentorUser } = await seedIam(prisma);

  // Step 2: Seed Users extended profiles using data from Step 1
  const { mentorProfile } = await seedUsersProfile(prisma, {
    mentorUserId: mentorUser.id,
  });

  // Step 3: Seed Media assets
  const { coverAsset } = await seedMedia(prisma, {
    ownerId: mentorUser.id,
  });

  // Step 4: Seed Project contents with cross-domain relations
  await seedProjects(prisma, {
    mentorId: mentorProfile.id,
    authorId: mentorUser.id,
    coverAssetId: coverAsset.id,
  });
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
