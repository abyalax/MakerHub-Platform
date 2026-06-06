import z from 'zod';

const ownerTypes = ['PURCHASE_REQUISITION', 'RFQ', 'VENDOR', 'QUOTATION', 'PO'] as const;
const fileCategories = ['IMAGE', 'DOCUMENT', 'PDF', 'EXCEL', 'OTHER'] as const;

export const attachmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const attachmentListQuerySchema = z.object({
  ownerType: z.enum(ownerTypes),
  ownerId: z.coerce.number().int().positive(),
});

export const requestPresignedUploadSchema = z.object({
  ownerType: z.enum(ownerTypes),
  ownerId: z.coerce.number().int().positive(),
  files: z
    .array(
      z.object({
        fileName: z.string().min(1).max(255),
        contentType: z.string().min(1).max(255),
        size: z.coerce.number().int().positive(),
        fileCategory: z.enum(fileCategories),
      })
    )
    .min(1),
});

export const confirmUploadSchema = z.object({
  ownerType: z.enum(ownerTypes),
  ownerId: z.coerce.number().int().positive(),
  objectKey: z.string().min(1).max(500),
  originalFileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  size: z.coerce.number().int().positive(),
  fileCategory: z.enum(fileCategories),
});

export type AttachmentListQueryDTO = z.infer<typeof attachmentListQuerySchema>;
export type RequestPresignedUploadDTO = z.infer<typeof requestPresignedUploadSchema>;
export type ConfirmUploadDTO = z.infer<typeof confirmUploadSchema>;
export type AttachmentFileCategoryDTO = (typeof fileCategories)[number];
