import { describe, expect, it } from 'vitest';
import {
  attachmentIdParamSchema,
  attachmentListQuerySchema,
  confirmUploadSchema,
  requestPresignedUploadSchema,
} from '~/layers/shared/server/validators/attachments.schema';

describe('Attachments Schema Validation Tests', () => {
  it('validates presigned upload payload', () => {
    const result = requestPresignedUploadSchema.safeParse({
      ownerType: 'PO',
      ownerId: 1,
      files: [
        {
          fileName: 'invoice.pdf',
          contentType: 'application/pdf',
          size: 1024,
          fileCategory: 'PDF',
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects presigned upload payload without files', () => {
    const result = requestPresignedUploadSchema.safeParse({
      ownerType: 'PO',
      ownerId: 1,
      files: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid owner id', () => {
    const result = attachmentListQuerySchema.safeParse({
      ownerType: 'PO',
      ownerId: 0,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid file category', () => {
    const result = confirmUploadSchema.safeParse({
      ownerType: 'PO',
      ownerId: 1,
      objectKey: 'PO/1/file.txt',
      originalFileName: 'file.txt',
      contentType: 'text/plain',
      size: 100,
      fileCategory: 'TEXT',
    });

    expect(result.success).toBe(false);
  });

  it('validates confirm upload payload', () => {
    const result = confirmUploadSchema.safeParse({
      ownerType: 'VENDOR',
      ownerId: '42',
      objectKey: 'VENDOR/42/file.png',
      originalFileName: 'file.png',
      contentType: 'image/png',
      size: '2048',
      fileCategory: 'IMAGE',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ownerId).toBe(42);
      expect(result.data.size).toBe(2048);
    }
  });

  it('coerces id route params to positive integer', () => {
    const result = attachmentIdParamSchema.safeParse({ id: '99' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(99);
  });
});
