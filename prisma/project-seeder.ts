import type { PrismaClient } from '~/generated/prisma/client';
import { ContentAccessType, ContentStatus } from '~/generated/prisma/enums';

interface ProjectSeedInput {
  mentorId: number;
  authorId: number;
  coverAssetId: number;
}

export async function seedProjects(prisma: PrismaClient, input: ProjectSeedInput) {
  console.info('Seeding Project domain (Categories and Project contents)...');

  // 1. Seed Categories
  const categories = await Promise.all(
    [
      { name: 'Web Development', slug: 'web-development', description: 'Build modern web applications and interfaces.' },
      { name: 'Product Design', slug: 'product-design', description: 'Practice product thinking, UX flows, and design systems.' },
      { name: 'Data Tools', slug: 'data-tools', description: 'Create dashboards, reporting tools, and automation.' },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    )
  );

  const webCategory = categories.find((c) => c.slug === 'web-development');
  const designCategory = categories.find((c) => c.slug === 'product-design');

  if (!webCategory || !designCategory) {
    throw new Error('Sprint 1 categories were not seeded');
  }

  // 2. Seed Projects
  const freeProject = await prisma.project.upsert({
    where: { slug: 'build-a-nuxt-project-marketplace' },
    update: {
      title: 'Build a Nuxt Project Marketplace',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    create: {
      mentorId: input.mentorId,
      authorId: input.authorId,
      categoryId: webCategory.id,
      coverAssetId: input.coverAssetId,
      title: 'Build a Nuxt Project Marketplace',
      slug: 'build-a-nuxt-project-marketplace',
      summary: 'Create a searchable marketplace with project pages and mentor profiles.',
      description: 'A practical end-to-end project for learning Nuxt application architecture through a marketplace build.',
      objectives: ['Model project content', 'Create public discovery pages', 'Publish structured lessons'],
      accessType: ContentAccessType.FREE,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  const premiumProject = await prisma.project.upsert({
    where: { slug: 'design-a-founder-dashboard' },
    update: {
      title: 'Design a Founder Dashboard',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    create: {
      mentorId: input.mentorId,
      authorId: input.authorId,
      categoryId: designCategory.id,
      title: 'Design a Founder Dashboard',
      slug: 'design-a-founder-dashboard',
      summary: 'Turn ambiguous startup metrics into a crisp operator dashboard.',
      description: 'A premium project focused on dashboard UX, metric hierarchy, and repeatable review workflows.',
      objectives: ['Map user decisions', 'Design KPI hierarchy', 'Prepare a polished dashboard spec'],
      accessType: ContentAccessType.PREMIUM,
      status: ContentStatus.PUBLISHED,
      price: 199000,
      publishedAt: new Date(),
    },
  });

  await prisma.project.upsert({
    where: { slug: 'draft-inventory-automation' },
    update: {
      title: 'Draft Inventory Automation',
      status: ContentStatus.DRAFT,
    },
    create: {
      mentorId: input.mentorId,
      authorId: input.authorId,
      categoryId: webCategory.id,
      title: 'Draft Inventory Automation',
      slug: 'draft-inventory-automation',
      summary: 'A draft project that should not appear publicly.',
      description: 'This draft is seeded to verify public discovery excludes unpublished projects.',
      objectives: ['Draft hidden from catalog'],
      accessType: ContentAccessType.FREE,
      status: ContentStatus.DRAFT,
    },
  });

  // 3. Seed Free Project Sections & Lessons
  const existingSection = await prisma.projectSection.findFirst({
    where: { projectId: freeProject.id, title: 'Marketplace Foundations' },
  });

  const section = existingSection
    ? await prisma.projectSection.update({ where: { id: existingSection.id }, data: { sortOrder: 1 } })
    : await prisma.projectSection.create({ data: { projectId: freeProject.id, title: 'Marketplace Foundations', sortOrder: 1 } });

  const existingLesson = await prisma.projectLesson.findFirst({
    where: { sectionId: section.id, title: 'Plan the content model' },
  });

  const lessonData = {
    content: 'Define projects, sections, lessons, mentors, categories, and access rules before building screens.',
    isPreview: true,
    sortOrder: 1,
  };

  if (existingLesson) {
    await prisma.projectLesson.update({ where: { id: existingLesson.id }, data: lessonData });
  } else {
    await prisma.projectLesson.create({ data: { sectionId: section.id, title: 'Plan the content model', ...lessonData } });
  }

  // 4. Seed Premium Project Sections & Lessons
  const existingPremiumSection = await prisma.projectSection.findFirst({
    where: { projectId: premiumProject.id, title: 'Dashboard Strategy' },
  });

  const premiumSection = existingPremiumSection
    ? await prisma.projectSection.update({ where: { id: existingPremiumSection.id }, data: { sortOrder: 1 } })
    : await prisma.projectSection.create({ data: { projectId: premiumProject.id, title: 'Dashboard Strategy', sortOrder: 1 } });

  // Premium Preview Lesson
  const existingPremiumPreview = await prisma.projectLesson.findFirst({
    where: { sectionId: premiumSection.id, title: 'Preview the dashboard workflow' },
  });

  const previewData = {
    content: 'This preview lesson introduces the premium project and explains the outcome.',
    isPreview: true,
    sortOrder: 1,
  };

  if (existingPremiumPreview) {
    await prisma.projectLesson.update({ where: { id: existingPremiumPreview.id }, data: previewData });
  } else {
    await prisma.projectLesson.create({ data: { sectionId: premiumSection.id, title: 'Preview the dashboard workflow', ...previewData } });
  }

  // Premium Locked Lesson
  const existingPremiumLocked = await prisma.projectLesson.findFirst({
    where: { sectionId: premiumSection.id, title: 'Build the executive metric map' },
  });

  const lockedData = {
    content: 'Premium lesson content remains locked until monetization is implemented.',
    isPreview: false,
    sortOrder: 2,
  };

  if (existingPremiumLocked) {
    await prisma.projectLesson.update({ where: { id: existingPremiumLocked.id }, data: lockedData });
  } else {
    await prisma.projectLesson.create({ data: { sectionId: premiumSection.id, title: 'Build the executive metric map', ...lockedData } });
  }
}
