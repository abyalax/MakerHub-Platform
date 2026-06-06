import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  attachment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  minioService: {
    getConfig: vi.fn(),
    presignedPutObject: vi.fn(),
    presignedGetObject: vi.fn(),
    statObject: vi.fn(),
    removeObject: vi.fn(),
  },
}));

vi.mock('~/layers/shared/server/db/prisma', () => ({
  prisma: {
    attachment: mocks.attachment,
  },
}));

vi.mock('~/layers/shared/server/services/minio.service', () => ({
  minioService: mocks.minioService,
}));

describe('Attachments Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.minioService.getConfig.mockReturnValue({
      bucket: 'boilerplate-uploads',
      uploadExpiresSeconds: 600,
      downloadExpiresSeconds: 600,
      maxFileSizeBytes: 10 * 1024 * 1024,
    });
    mocks.minioService.presignedPutObject.mockResolvedValue('http://localhost:9000/upload');
    mocks.minioService.presignedGetObject.mockResolvedValue('http://localhost:9000/download');
    mocks.minioService.statObject.mockResolvedValue({ size: 1024 });
  });

  it('generates presigned upload entries for every requested file', async () => {
    const { attachmentsService } = await import('~/layers/shared/server/services/attachments.service');

    const result = await attachmentsService.requestPresignedUpload({
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

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.uploadUrl).toBe('http://localhost:9000/upload');
    expect(result.files[0]?.objectKey).toMatch(/^PO\/1\/.+-invoice\.pdf$/);
    expect(mocks.minioService.presignedPutObject).toHaveBeenCalledTimes(1);
  });

  it('confirms uploaded object and stores metadata', async () => {
    const created = {
      id: 1,
      owner_type: 'PO',
      owner_id: 1,
      object_key: 'PO/1/file.pdf',
      bucket: 'boilerplate-uploads',
      original_file_name: 'file.pdf',
      content_type: 'application/pdf',
      size: 1024,
      file_category: 'PDF',
      created_at: new Date('2026-06-07T00:00:00.000Z'),
    };
    mocks.attachment.findUnique.mockResolvedValue(null);
    mocks.attachment.create.mockResolvedValue(created);

    const { attachmentsService } = await import('~/layers/shared/server/services/attachments.service');
    const result = await attachmentsService.confirmUpload({
      ownerType: 'PO',
      ownerId: 1,
      objectKey: 'PO/1/file.pdf',
      originalFileName: 'file.pdf',
      contentType: 'application/pdf',
      size: 1024,
      fileCategory: 'PDF',
    });

    expect(mocks.minioService.statObject).toHaveBeenCalledWith('PO/1/file.pdf');
    expect(mocks.attachment.create).toHaveBeenCalledWith({
      data: {
        owner_type: 'PO',
        owner_id: 1,
        object_key: 'PO/1/file.pdf',
        bucket: 'boilerplate-uploads',
        original_file_name: 'file.pdf',
        content_type: 'application/pdf',
        size: 1024,
        file_category: 'PDF',
      },
    });
    expect(result.downloadUrl).toBe('http://localhost:9000/download');
  });

  it('returns existing metadata when confirming the same object key', async () => {
    mocks.attachment.findUnique.mockResolvedValue({
      id: 1,
      owner_type: 'PO',
      owner_id: 1,
      object_key: 'PO/1/file.pdf',
      bucket: 'boilerplate-uploads',
      original_file_name: 'file.pdf',
      content_type: 'application/pdf',
      size: 1024,
      file_category: 'PDF',
      created_at: new Date('2026-06-07T00:00:00.000Z'),
    });

    const { attachmentsService } = await import('~/layers/shared/server/services/attachments.service');
    const result = await attachmentsService.confirmUpload({
      ownerType: 'PO',
      ownerId: 1,
      objectKey: 'PO/1/file.pdf',
      originalFileName: 'file.pdf',
      contentType: 'application/pdf',
      size: 1024,
      fileCategory: 'PDF',
    });

    expect(mocks.minioService.statObject).not.toHaveBeenCalled();
    expect(mocks.attachment.create).not.toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('deletes object storage and metadata', async () => {
    mocks.attachment.findUnique.mockResolvedValue({
      id: 1,
      object_key: 'PO/1/file.pdf',
    });
    mocks.attachment.delete.mockResolvedValue({ id: 1 });

    const { attachmentsService } = await import('~/layers/shared/server/services/attachments.service');
    const result = await attachmentsService.delete(1);

    expect(result).toBe(true);
    expect(mocks.minioService.removeObject).toHaveBeenCalledWith('PO/1/file.pdf');
    expect(mocks.attachment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
