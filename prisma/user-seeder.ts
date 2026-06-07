import type { PrismaClient } from '~/generated/prisma/client';

interface UsersSeedInput {
  mentorUserId: number;
}

export async function seedUsersProfile(prisma: PrismaClient, input: UsersSeedInput) {
  console.info('Seeding Users Profile domain...');

  const mentorProfile = await prisma.mentorProfile.upsert({
    where: { userId: input.mentorUserId },
    update: {
      headline: 'Full-stack project mentor',
      bio: 'Guides learners through practical web application builds.',
      expertise: 'Nuxt, TypeScript, product engineering',
      websiteUrl: 'https://makerhub.local/mentors/ari',
      isActive: true,
    },
    create: {
      userId: input.mentorUserId,
      headline: 'Full-stack project mentor',
      bio: 'Guides learners through practical web application builds.',
      expertise: 'Nuxt, TypeScript, product engineering',
      websiteUrl: 'https://makerhub.local/mentors/ari',
    },
  });

  return { mentorProfile };
}
