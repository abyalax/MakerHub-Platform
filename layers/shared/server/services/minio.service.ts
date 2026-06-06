import { Client } from 'minio';
import { createError } from 'h3';

type StorageConfig = {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
  uploadExpiresSeconds: number;
  downloadExpiresSeconds: number;
  maxFileSizeBytes: number;
};

const toPositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const getStorageConfig = (): StorageConfig => {
  const config = useRuntimeConfig();

  const uploadExpiresMinutes = toPositiveInt(config.storagePresignedUploadExpirationMinutes, 10);
  const downloadExpiresMinutes = toPositiveInt(config.storagePresignedDownloadExpirationMinutes, 10);
  const maxFileSizeMb = toPositiveInt(config.storageMaxFileSizeMb, 10);

  return {
    endpoint: String(config.storageEndpoint || process.env.STORAGE_ENDPOINT || 'http://localhost:9000'),
    accessKey: String(config.storageAccessKey || process.env.STORAGE_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin'),
    secretKey: String(config.storageSecretKey || process.env.STORAGE_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin'),
    region: String(config.storageRegion || process.env.STORAGE_REGION || 'us-east-1'),
    bucket: String(config.storageBucket || process.env.STORAGE_BUCKET || 'boilerplate-uploads'),
    uploadExpiresSeconds: uploadExpiresMinutes * 60,
    downloadExpiresSeconds: downloadExpiresMinutes * 60,
    maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
  };
};

const parseEndpoint = (endpoint: string) => {
  const url = new URL(endpoint);

  return {
    endPoint: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80,
    useSSL: url.protocol === 'https:',
  };
};

let client: Client | null = null;
let bucketReady: Promise<void> | null = null;

const getClient = () => {
  if (client) return client;

  const config = getStorageConfig();
  const endpoint = parseEndpoint(config.endpoint);

  client = new Client({
    ...endpoint,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    region: config.region,
  });

  return client;
};

const toStorageError = (error: unknown, message = 'Storage operation failed') => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: string }).code) : undefined;

  if (code === 'NoSuchKey' || code === 'NotFound') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Attachment object not found' });
  }

  throw createError({ statusCode: 502, statusMessage: 'Storage Error', message });
};

export const minioService = {
  getConfig: getStorageConfig,

  async ensureBucket() {
    if (bucketReady) return bucketReady;

    bucketReady = (async () => {
      const config = getStorageConfig();
      const minio = getClient();

      const exists = await minio.bucketExists(config.bucket);
      if (!exists) {
        await minio.makeBucket(config.bucket, config.region);
      }
    })();

    return bucketReady;
  },

  async presignedPutObject(objectKey: string) {
    const config = getStorageConfig();
    await this.ensureBucket();

    try {
      return await getClient().presignedPutObject(config.bucket, objectKey, config.uploadExpiresSeconds);
    } catch (error) {
      toStorageError(error, 'Failed to generate upload URL');
    }
  },

  async presignedGetObject(objectKey: string) {
    const config = getStorageConfig();
    await this.ensureBucket();

    try {
      return await getClient().presignedGetObject(config.bucket, objectKey, config.downloadExpiresSeconds);
    } catch (error) {
      toStorageError(error, 'Failed to generate download URL');
    }
  },

  async statObject(objectKey: string) {
    const config = getStorageConfig();
    await this.ensureBucket();

    try {
      return await getClient().statObject(config.bucket, objectKey);
    } catch (error) {
      toStorageError(error, 'Uploaded object not found');
    }
  },

  async removeObject(objectKey: string) {
    const config = getStorageConfig();
    await this.ensureBucket();

    try {
      await getClient().removeObject(config.bucket, objectKey);
    } catch (error) {
      const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: string }).code) : undefined;
      if (code === 'NoSuchKey' || code === 'NotFound') return;
      toStorageError(error, 'Failed to delete attachment object');
    }
  },
};
