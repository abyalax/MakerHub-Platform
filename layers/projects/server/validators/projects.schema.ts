import z from 'zod';
import { metaRequestSchema } from '~/layers/shared/app/types/meta';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(280),
});

export const projectListQuerySchema = z.object({
  ...metaRequestSchema.shape,
  category: z.string().min(1).max(140).optional(),
  featured: z.coerce.boolean().optional(),
});

export const adminProjectListQuerySchema = z.object({
  ...metaRequestSchema.shape,
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']).optional(),
});

export const projectPayloadSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(280).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  summary: z.string().max(500).optional().nullable(),
  description: z.string().min(10),
  objectives: z.array(z.string().min(1).max(180)).max(12).default([]),
  categoryId: z.number().int().positive().optional().nullable(),
  coverAssetId: z.number().int().positive().optional().nullable(),
  accessType: z.enum(['FREE', 'PREMIUM']).default('FREE'),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default('IDR'),
});

export const updateProjectPayloadSchema = projectPayloadSchema.partial();

export const sectionPayloadSchema = z.object({
  title: z.string().min(1).max(255),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const lessonPayloadSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional().nullable(),
  isPreview: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  videoAssetId: z.number().int().positive().optional().nullable(),
});

export const mediaAssetPayloadSchema = z.object({
  projectId: z.number().int().positive().optional().nullable(),
  lessonId: z.number().int().positive().optional().nullable(),
  assignmentId: z.number().int().positive().optional().nullable(),
  objectKey: z.string().min(1).max(500),
  originalFileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(120),
  sizeBytes: z.number().int().positive(),
  assetKind: z.enum(['COVER_IMAGE', 'IMAGE', 'VIDEO', 'PDF', 'EBOOK', 'RESOURCE']),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'PROTECTED']).default('PRIVATE'),
  publicUrl: z.string().url().optional().nullable(),
});

export const moderationPayloadSchema = z.object({
  status: z.enum(['PUBLISHED', 'ARCHIVED', 'REJECTED']),
});

export const mentorStatusPayloadSchema = z.object({
  isActive: z.boolean(),
});

export type ProjectListQueryDTO = z.infer<typeof projectListQuerySchema>;
export type AdminProjectListQueryDTO = z.infer<typeof adminProjectListQuerySchema>;
export type ProjectPayloadDTO = z.infer<typeof projectPayloadSchema>;
export type UpdateProjectPayloadDTO = z.infer<typeof updateProjectPayloadSchema>;
export type SectionPayloadDTO = z.infer<typeof sectionPayloadSchema>;
export type LessonPayloadDTO = z.infer<typeof lessonPayloadSchema>;
export type MediaAssetPayloadDTO = z.infer<typeof mediaAssetPayloadSchema>;
export type ModerationPayloadDTO = z.infer<typeof moderationPayloadSchema>;
export type MentorStatusPayloadDTO = z.infer<typeof mentorStatusPayloadSchema>;
