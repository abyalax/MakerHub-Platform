import { randomUUID } from 'node:crypto';
import { createError } from 'h3';
import { prisma } from '~/layers/shared/server/db/prisma';
import { minioService } from './minio.service';
import type { AttachmentListQueryDTO, ConfirmUploadDTO, RequestPresignedUploadDTO } from '../validators/attachments.schema';

type AttachmentRecord = {
  id: number;
  owner_type: string;
  owner_id: number;
  object_key: string;
  bucket: string;
  original_file_name: string;
  content_type: string;
  size: number;
  file_category: string;
  created_at: Date;
};

const sanitizeFileName = (fileName: string) => {
  const sanitized = fileName
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    ?.replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || 'file';
};

const createObjectKey = (ownerType: string, ownerId: number, fileName: string) => {
  return `${ownerType}/${ownerId}/${randomUUID()}-${sanitizeFileName(fileName)}`;
};

const toAttachmentResponse = async (attachment: AttachmentRecord) => {
  const download = await minioService.presignedGetObject(attachment.object_key);

  return {
    id: attachment.id,
    ownerType: attachment.owner_type,
    ownerId: attachment.owner_id,
    originalFileName: attachment.original_file_name,
    contentType: attachment.content_type,
    size: attachment.size,
    fileCategory: attachment.file_category,
    downloadUrl: download,
    previewUrl: null,
    createdAt: attachment.created_at.toISOString(),
  };
};

class AttachmentsService {
  async requestPresignedUpload(payload: RequestPresignedUploadDTO) {
    const config = minioService.getConfig();

    for (const file of payload.files) {
      if (file.size > config.maxFileSizeBytes) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation Error',
          message: `File ${file.fileName} exceeds maximum size`,
        });
      }
    }

    const files = await Promise.all(
      payload.files.map(async (file) => {
        const objectKey = createObjectKey(payload.ownerType, payload.ownerId, file.fileName);
        const uploadUrl = await minioService.presignedPutObject(objectKey);

        return {
          uploadUrl,
          objectKey,
          fileName: file.fileName,
          contentType: file.contentType,
          size: file.size,
          fileCategory: file.fileCategory,
          expiresInSeconds: config.uploadExpiresSeconds,
        };
      })
    );

    return { files };
  }

  async confirmUpload(payload: ConfirmUploadDTO) {
    const existing = await prisma.attachment.findUnique({
      where: {
        object_key: payload.objectKey,
      },
    });

    if (existing) return toAttachmentResponse(existing as AttachmentRecord);

    const config = minioService.getConfig();
    if (payload.size > config.maxFileSizeBytes) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        message: 'File exceeds maximum size',
      });
    }

    const stat = await minioService.statObject(payload.objectKey);
    if (typeof stat.size === 'number' && stat.size !== payload.size) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        message: 'Uploaded object size does not match confirmation payload',
      });
    }

    const attachment = await prisma.attachment.create({
      data: {
        owner_type: payload.ownerType,
        owner_id: payload.ownerId,
        object_key: payload.objectKey,
        bucket: config.bucket,
        original_file_name: payload.originalFileName,
        content_type: payload.contentType,
        size: payload.size,
        file_category: payload.fileCategory,
      },
    });

    return toAttachmentResponse(attachment as AttachmentRecord);
  }

  async list(query: AttachmentListQueryDTO) {
    const attachments = await prisma.attachment.findMany({
      where: {
        owner_type: query.ownerType,
        owner_id: query.ownerId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return Promise.all(attachments.map((attachment) => toAttachmentResponse(attachment as AttachmentRecord)));
  }

  async getDownload(id: number) {
    const attachment = await prisma.attachment.findUnique({
      where: {
        id,
      },
    });

    if (!attachment) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Attachment not found' });
    }

    const config = minioService.getConfig();
    const downloadUrl = await minioService.presignedGetObject(attachment.object_key);

    return {
      downloadUrl,
      expiresInSeconds: config.downloadExpiresSeconds,
    };
  }

  async delete(id: number) {
    const attachment = await prisma.attachment.findUnique({
      where: {
        id,
      },
    });

    if (!attachment) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Attachment not found' });
    }

    await minioService.removeObject(attachment.object_key);
    await prisma.attachment.delete({
      where: {
        id,
      },
    });

    return true;
  }
}

export const attachmentsService = new AttachmentsService();
