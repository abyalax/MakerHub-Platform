import { createError } from 'h3';
import type { Prisma } from '~/generated/prisma/client';
import type { AssetVisibility } from '~/generated/prisma/enums';
import { AssetKind, ContentAccessType, ContentStatus } from '~/generated/prisma/enums';
import { prisma } from '~/layers/shared/server/db/prisma';
import type { MetaRequest, Paginated } from '~/layers/shared/app/types/meta';
import type {
  AdminProjectListQueryDTO,
  LessonPayloadDTO,
  MediaAssetPayloadDTO,
  MentorStatusPayloadDTO,
  ProjectListQueryDTO,
  ProjectPayloadDTO,
  SectionPayloadDTO,
  UpdateProjectPayloadDTO,
} from '~/layers/projects/server/validators/projects.schema';
import type { ProjectDTO } from '~/layers/projects/types';
import type { User } from '~/layers/users/types';

const projectInclude = {
  category: true,
  mentor: {
    include: {
      user: true,
    },
  },
  coverAsset: true,
  sections: {
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      lessons: {
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          videoAsset: true,
          assets: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;
type MentorRecord = Prisma.MentorProfileGetPayload<{ include: { user: true } }>;
type ModeratableProjectStatus = 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 240) || 'project';

const priceToString = (value: unknown) => {
  if (value && typeof value === 'object' && 'toString' in value) return String(value.toString());
  return String(value ?? '0');
};

const toPaginated = <T>(data: T[], page: number, limit: number, total: number, search = ''): Paginated<T> => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    data,
    meta: {
      itemsPerPage: limit,
      totalItems: total,
      currentPage: page,
      totalPages,
      sortBy: [['publishedAt', 'desc']],
      searchBy: ['title', 'summary', 'description'],
      search,
      select: [],
    },
    links: {
      current: `?page=${page}&limit=${limit}`,
      first: `?page=1&limit=${limit}`,
      previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : undefined,
      next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : undefined,
      last: `?page=${totalPages}&limit=${limit}`,
    },
  };
};

const hasRole = (user: User, roleName: string) => user.roles.some((role) => role.name === roleName);

const canSeeLockedContent = (project: ProjectRecord, user?: User) => {
  if (project.accessType === ContentAccessType.FREE) return true;
  if (!user) return false;
  return project.authorId === user.id || hasRole(user, 'Admin');
};

const mapMediaAsset = (asset: ProjectRecord['coverAsset']) => {
  if (!asset) return null;

  return {
    id: asset.id,
    originalFileName: asset.originalFileName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    assetKind: asset.assetKind,
    visibility: asset.visibility,
    publicUrl: asset.publicUrl,
  };
};

const isMediaAssetDTO = <T>(asset: T | null): asset is T => asset !== null;

const mapMentor = (mentor: MentorRecord) => ({
  id: mentor.id,
  userId: mentor.userId,
  name: mentor.user.name,
  headline: mentor.headline,
  bio: mentor.bio,
  expertise: mentor.expertise,
  websiteUrl: mentor.websiteUrl,
  isActive: mentor.isActive,
});

const mapProject = (project: ProjectRecord, options: { includeContent?: boolean; user?: User } = {}): ProjectDTO => {
  const includeContent = options.includeContent ?? false;
  const canViewContent = canSeeLockedContent(project, options.user);

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    objectives: Array.isArray(project.objectives) ? project.objectives.filter((item): item is string => typeof item === 'string') : [],
    accessType: project.accessType,
    status: project.status,
    price: priceToString(project.price),
    currency: project.currency,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    category: project.category
      ? {
          id: project.category.id,
          name: project.category.name,
          slug: project.category.slug,
          description: project.category.description,
        }
      : null,
    mentor: mapMentor(project.mentor),
    coverAsset: mapMediaAsset(project.coverAsset),
    accessLocked: !canViewContent,
    sections: includeContent
      ? project.sections.map((section) => ({
          id: section.id,
          title: section.title,
          sortOrder: section.sortOrder,
          lessons: section.lessons
            .filter((lesson) => canViewContent || lesson.isPreview)
            .map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              content: canViewContent || lesson.isPreview ? lesson.content : null,
              isPreview: lesson.isPreview,
              sortOrder: lesson.sortOrder,
              videoAsset: canViewContent || lesson.isPreview ? mapMediaAsset(lesson.videoAsset) : null,
              assets: canViewContent || lesson.isPreview ? lesson.assets.map((asset) => mapMediaAsset(asset)).filter(isMediaAssetDTO) : [],
            })),
        }))
      : undefined,
  };
};

const createSearchFilter = (search?: string): Prisma.ProjectWhereInput => {
  if (!search) return {};

  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
      { mentor: { user: { name: { contains: search, mode: 'insensitive' } } } },
    ],
  };
};

class ProjectsService {
  async listCategories() {
    return prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async listPublic(query: ProjectListQueryDTO): Promise<Paginated<ProjectDTO>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const search = query.search ?? '';
    const where: Prisma.ProjectWhereInput = {
      AND: [
        { status: ContentStatus.PUBLISHED },
        { mentor: { isActive: true } },
        query.category ? { category: { slug: query.category } } : {},
        query.featured ? { sections: { some: { lessons: { some: {} } } } } : {},
        createSearchFilter(search),
      ],
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return toPaginated(
      items.map((project) => mapProject(project as ProjectRecord)),
      page,
      limit,
      total,
      search
    );
  }

  async listFeatured() {
    const projects = await prisma.project.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        mentor: {
          isActive: true,
        },
        sections: {
          some: {
            lessons: {
              some: {},
            },
          },
        },
      },
      include: projectInclude,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    });

    return projects.map((project) => mapProject(project as ProjectRecord));
  }

  async getPublicBySlug(slug: string, user?: User) {
    const project = await prisma.project.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
        mentor: {
          isActive: true,
        },
      },
      include: projectInclude,
    });

    if (!project) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Project not found' });

    return mapProject(project as ProjectRecord, { includeContent: true, user });
  }

  async getPublicMentor(id: number) {
    const mentor = await prisma.mentorProfile.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        user: true,
        projects: {
          where: {
            status: ContentStatus.PUBLISHED,
          },
          include: projectInclude,
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!mentor) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Mentor not found' });

    return {
      ...mapMentor(mentor as MentorRecord),
      projects: mentor.projects.map((project) => mapProject(project as ProjectRecord)),
    };
  }

  async getPublicProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        mentorProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!user) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Profile not found' });

    return {
      id: user.id,
      name: user.name,
      mentorProfile: user.mentorProfile ? mapMentor(user.mentorProfile as MentorRecord) : null,
    };
  }

  async listMine(user: User, query: MetaRequest<ProjectDTO> & { limit?: number }) {
    const mentor = await this.getMentorForUser(user);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search ?? '';
    const where: Prisma.ProjectWhereInput = {
      AND: [{ mentorId: mentor.id }, createSearchFilter(search)],
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return toPaginated(
      items.map((project) => mapProject(project as ProjectRecord)),
      page,
      limit,
      total,
      search
    );
  }

  async getMine(user: User, id: number) {
    const project = await this.getOwnedProject(user, id);
    return mapProject(project, { includeContent: true, user });
  }

  async createProject(user: User, payload: ProjectPayloadDTO) {
    const mentor = await this.getMentorForUser(user);
    if (!mentor.isActive) throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'Mentor account is suspended' });

    const slug = await this.createUniqueSlug(payload.slug ?? payload.title);
    const project = await prisma.project.create({
      data: {
        mentorId: mentor.id,
        authorId: user.id,
        categoryId: payload.categoryId ?? null,
        coverAssetId: payload.coverAssetId ?? null,
        title: payload.title,
        slug,
        summary: payload.summary ?? null,
        description: payload.description,
        objectives: payload.objectives,
        accessType: payload.accessType as ContentAccessType,
        status: ContentStatus.DRAFT,
        price: payload.price,
        currency: payload.currency,
      },
      include: projectInclude,
    });

    return mapProject(project as ProjectRecord, { includeContent: true, user });
  }

  async updateProject(user: User, id: number, payload: UpdateProjectPayloadDTO) {
    await this.getOwnedProject(user, id);
    const data: Prisma.ProjectUpdateInput = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.slug !== undefined) data.slug = await this.createUniqueSlug(payload.slug, id);
    if (payload.summary !== undefined) data.summary = payload.summary;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.objectives !== undefined) data.objectives = payload.objectives;
    if (payload.categoryId !== undefined) data.category = payload.categoryId ? { connect: { id: payload.categoryId } } : { disconnect: true };
    if (payload.coverAssetId !== undefined) data.coverAsset = payload.coverAssetId ? { connect: { id: payload.coverAssetId } } : { disconnect: true };
    if (payload.accessType !== undefined) data.accessType = payload.accessType as ContentAccessType;
    if (payload.price !== undefined) data.price = payload.price;
    if (payload.currency !== undefined) data.currency = payload.currency;

    const project = await prisma.project.update({
      where: { id },
      data,
      include: projectInclude,
    });

    return mapProject(project as ProjectRecord, { includeContent: true, user });
  }

  async publishProject(user: User, id: number) {
    const owned = await this.getOwnedProject(user, id);
    if (!owned.mentor.isActive) throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'Mentor account is suspended' });
    if (!owned.title || !owned.description) {
      throw createError({ statusCode: 400, statusMessage: 'Validation Error', message: 'Project is missing required publication fields' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: projectInclude,
    });

    return mapProject(project as ProjectRecord, { includeContent: true, user });
  }

  async archiveProject(user: User, id: number) {
    await this.getOwnedProject(user, id);
    const project = await prisma.project.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
      },
      include: projectInclude,
    });

    return mapProject(project as ProjectRecord, { includeContent: true, user });
  }

  async createSection(user: User, projectId: number, payload: SectionPayloadDTO) {
    await this.getOwnedProject(user, projectId);
    return prisma.projectSection.create({
      data: {
        projectId,
        title: payload.title,
        sortOrder: payload.sortOrder,
      },
    });
  }

  async updateSection(user: User, projectId: number, sectionId: number, payload: SectionPayloadDTO) {
    await this.getOwnedProject(user, projectId);
    await this.assertSectionInProject(projectId, sectionId);
    return prisma.projectSection.update({
      where: { id: sectionId },
      data: payload,
    });
  }

  async deleteSection(user: User, projectId: number, sectionId: number) {
    await this.getOwnedProject(user, projectId);
    await this.assertSectionInProject(projectId, sectionId);
    await prisma.projectSection.delete({ where: { id: sectionId } });
    return true;
  }

  async createLesson(user: User, projectId: number, sectionId: number, payload: LessonPayloadDTO) {
    await this.getOwnedProject(user, projectId);
    await this.assertSectionInProject(projectId, sectionId);
    return prisma.projectLesson.create({
      data: {
        sectionId,
        title: payload.title,
        content: payload.content ?? null,
        isPreview: payload.isPreview,
        sortOrder: payload.sortOrder,
        videoAssetId: payload.videoAssetId ?? null,
      },
    });
  }

  async updateLesson(user: User, projectId: number, sectionId: number, lessonId: number, payload: LessonPayloadDTO) {
    await this.getOwnedProject(user, projectId);
    await this.assertLessonInSection(sectionId, lessonId);
    return prisma.projectLesson.update({
      where: { id: lessonId },
      data: {
        title: payload.title,
        content: payload.content ?? null,
        isPreview: payload.isPreview,
        sortOrder: payload.sortOrder,
        videoAssetId: payload.videoAssetId ?? null,
      },
    });
  }

  async deleteLesson(user: User, projectId: number, sectionId: number, lessonId: number) {
    await this.getOwnedProject(user, projectId);
    await this.assertLessonInSection(sectionId, lessonId);
    await prisma.projectLesson.delete({ where: { id: lessonId } });
    return true;
  }

  async createMediaAsset(user: User, payload: MediaAssetPayloadDTO) {
    this.validateMediaPayload(payload);
    if (payload.projectId) await this.getOwnedProject(user, payload.projectId);

    return prisma.mediaAsset.create({
      data: {
        ownerId: user.id,
        projectId: payload.projectId ?? null,
        lessonId: payload.lessonId ?? null,
        assignmentId: payload.assignmentId ?? null,
        bucket: 'external',
        objectKey: payload.objectKey,
        originalFileName: payload.originalFileName,
        mimeType: payload.mimeType,
        sizeBytes: payload.sizeBytes,
        assetKind: payload.assetKind as AssetKind,
        visibility: payload.visibility as AssetVisibility,
        publicUrl: payload.publicUrl ?? null,
      },
    });
  }

  async listAdmin(query: AdminProjectListQueryDTO): Promise<Paginated<ProjectDTO>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search ?? '';
    const where: Prisma.ProjectWhereInput = {
      AND: [query.status ? { status: query.status as ContentStatus } : {}, createSearchFilter(search)],
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return toPaginated(
      items.map((project) => mapProject(project as ProjectRecord)),
      page,
      limit,
      total,
      search
    );
  }

  async moderateProject(id: number, status: ModeratableProjectStatus) {
    const project = await prisma.project.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
      include: projectInclude,
    });

    return mapProject(project as ProjectRecord, { includeContent: true });
  }

  async listMentors(query: MetaRequest<MentorRecord> & { limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search ?? '';
    const where: Prisma.MentorProfileWhereInput = search
      ? {
          OR: [
            { headline: { contains: search, mode: 'insensitive' } },
            { expertise: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.mentorProfile.findMany({
        where,
        include: {
          user: true,
          _count: {
            select: {
              projects: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    return toPaginated(
      items.map((mentor) => ({
        ...mapMentor(mentor as MentorRecord),
        projectCount: mentor._count.projects,
      })),
      page,
      limit,
      total,
      search
    );
  }

  async setMentorStatus(id: number, payload: MentorStatusPayloadDTO) {
    const mentor = await prisma.mentorProfile.update({
      where: { id },
      data: {
        isActive: payload.isActive,
      },
      include: {
        user: true,
      },
    });

    return mapMentor(mentor as MentorRecord);
  }

  private async getMentorForUser(user: User) {
    const mentor = await prisma.mentorProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        headline: `${user.name} mentor`,
      },
      include: {
        user: true,
      },
    });

    return mentor;
  }

  private async getOwnedProject(user: User, id: number): Promise<ProjectRecord> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });

    if (!project) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Project not found' });
    if (project.authorId !== user.id && !hasRole(user, 'Admin')) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'You can only manage your own projects' });
    }

    return project as ProjectRecord;
  }

  private async assertSectionInProject(projectId: number, sectionId: number) {
    const section = await prisma.projectSection.findFirst({
      where: {
        id: sectionId,
        projectId,
      },
    });

    if (!section) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Section not found' });
  }

  private async assertLessonInSection(sectionId: number, lessonId: number) {
    const lesson = await prisma.projectLesson.findFirst({
      where: {
        id: lessonId,
        sectionId,
      },
    });

    if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Lesson not found' });
  }

  private async createUniqueSlug(source: string, ignoreProjectId?: number) {
    const base = toSlug(source);
    let slug = base;
    let suffix = 2;

    while (
      await prisma.project.findFirst({
        where: {
          slug,
          ...(ignoreProjectId ? { NOT: { id: ignoreProjectId } } : {}),
        },
        select: {
          id: true,
        },
      })
    ) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private validateMediaPayload(payload: MediaAssetPayloadDTO) {
    const mimeType = payload.mimeType.toLowerCase();
    const valid =
      (payload.assetKind === AssetKind.COVER_IMAGE && mimeType.startsWith('image/')) ||
      (payload.assetKind === AssetKind.IMAGE && mimeType.startsWith('image/')) ||
      (payload.assetKind === AssetKind.PDF && mimeType === 'application/pdf') ||
      (payload.assetKind === AssetKind.VIDEO && mimeType.startsWith('video/')) ||
      payload.assetKind === AssetKind.EBOOK ||
      payload.assetKind === AssetKind.RESOURCE;

    if (!valid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        message: 'Media type is not valid for the selected asset kind',
      });
    }
  }
}

export const projectsService = new ProjectsService();
