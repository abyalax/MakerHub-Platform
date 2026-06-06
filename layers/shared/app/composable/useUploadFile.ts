import { ref } from 'vue';
import { useHttp } from './useHttp';
import type { TResponse } from '../types/response';

export interface UploadFileOptions {
  /** File type identifier for the upload (e.g., 'banner', 'avatar', 'document') */
  type: string;
  /** Access level for the uploaded file */
  accessType?: 'private' | 'public';
  /** Target bucket (optional, will use default if not specified) */
  bucket?: string;
  /** Maximum file size in bytes (optional) */
  maxSize?: number;
  /** Allowed MIME types (optional) */
  allowedMimeTypes?: string[];
}

export interface PresignedUrlRequest {
  filename: string;
  mimeType: string;
  size?: number;
  bucket?: string;
  accessType?: 'private' | 'public';
}

export interface PresignedUrlResponse {
  url: string;
  mediaId: string;
  objectKey: string;
  bucket: string;
  accessType: 'private' | 'public';
  expiresAt: string;
}

export interface ConfirmMediaRequest {
  uploaded: boolean;
  actualSize?: number;
}

export interface UploadedFile {
  id: string;
  mediaId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  objectKey: string;
  bucket: string;
  accessType: 'private' | 'public';
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error';
  error?: string;
}

export const useUploadFile = () => {
  const isUploading = ref(false);
  const uploadProgress = ref<Map<string, UploadProgress>>(new Map());
  const uploadedFiles = ref<UploadedFile[]>([]);

  /**
   * Generate a unique file ID for tracking
   */
  const generateFileId = (file: File): string => {
    return `${file.name}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  /**
   * Validate file against options
   */
  const validateFile = (file: File, options: UploadFileOptions): string | null => {
    if (options.maxSize && file.size > options.maxSize) {
      return `File size exceeds maximum allowed size of ${options.maxSize} bytes`;
    }

    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`;
    }

    return null;
  };

  /**
   * Get presigned URL for file upload
   */
  const getPresignedUrl = async (request: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const http = useHttp();

    const result = await http<TResponse<PresignedUrlResponse>>('/media/presigned', {
      method: 'POST',
      body: request,
    });

    return result.data;
  };

  /**
   * Upload file to presigned URL
   */
  const uploadToPresignedUrl = async (
    presignedUrl: string,
    file: File,
    fileId: string,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateProgress(fileId, progress, 'uploading');
          onProgress?.(fileId, progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  /**
   * Confirm successful upload
   */
  const confirmUpload = async (mediaId: string, actualSize?: number): Promise<void> => {
    const http = useHttp();
    const request: ConfirmMediaRequest = {
      uploaded: true,
      actualSize,
    };

    await http(`/media/${mediaId}/confirm`, {
      method: 'PATCH',
      body: request,
    });
  };

  /**
   * Get public URL for media
   */
  const getMediaUrl = async (mediaId: string): Promise<string> => {
    const http = useHttp();

    const result = await http<TResponse<{ url: string }>>(`/media/${mediaId}/url`, {
      method: 'GET',
    });

    return result.data.url;
  };

  /**
   * Update progress tracking
   */
  const updateProgress = (fileId: string, progress: number, status: UploadProgress['status'], error?: string) => {
    const current = uploadProgress.value.get(fileId);
    if (current) {
      uploadProgress.value.set(fileId, {
        ...current,
        progress,
        status,
        error,
      });
    }
  };

  /**
   * Upload a single file
   */
  const uploadSingleFile = async (
    file: File,
    options: UploadFileOptions,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<UploadedFile> => {
    const fileId = generateFileId(file);

    // Validate file
    const validationError = validateFile(file, options);
    if (validationError) {
      throw new Error(validationError);
    }

    // Initialize progress tracking
    uploadProgress.value.set(fileId, {
      fileId,
      filename: file.name,
      progress: 0,
      status: 'pending',
    });

    try {
      // Get presigned URL
      updateProgress(fileId, 0, 'uploading');
      const presignedResponse = await getPresignedUrl({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        bucket: options.bucket,
        accessType: options.accessType ?? ('private' as const),
      });

      // Upload file
      await uploadToPresignedUrl(presignedResponse.url, file, fileId, onProgress);

      // Confirm upload
      updateProgress(fileId, 100, 'confirming');
      await confirmUpload(presignedResponse.mediaId, file.size);

      // Get final URL
      const url = await getMediaUrl(presignedResponse.mediaId);

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: fileId,
        mediaId: presignedResponse.mediaId,
        url,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        objectKey: presignedResponse.objectKey,
        bucket: presignedResponse.bucket,
        accessType: presignedResponse.accessType,
      };

      // Update progress and add to uploaded files
      updateProgress(fileId, 100, 'completed');
      uploadedFiles.value.push(uploadedFile);

      return uploadedFile;
    } catch (error) {
      updateProgress(fileId, 0, 'error', (error as Error).message);
      throw error;
    }
  };

  /**
   * Upload multiple files
   */
  const uploadMultipleFiles = async (
    files: File[],
    options: UploadFileOptions,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<UploadedFile[]> => {
    isUploading.value = true;

    try {
      const uploadPromises = files.map((file) => uploadSingleFile(file, options, onProgress));
      const results = await Promise.allSettled(uploadPromises);

      // Separate successful and failed uploads
      const successful: UploadedFile[] = [];
      const failed: { file: File; error: Error }[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({ file: files[index]!, error: result.reason });
        }
      });

      if (failed.length > 0) {
        const { $toast } = useNuxtApp();
        $toast.error(`${failed.length} file(s) failed to upload`);
      }

      return successful;
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Clear upload progress and history
   */
  const clearUploads = () => {
    uploadProgress.value.clear();
    uploadedFiles.value = [];
  };

  /**
   * Remove a specific uploaded file from the list
   */
  const removeUploadedFile = (fileId: string) => {
    uploadedFiles.value = uploadedFiles.value.filter((file) => file.id !== fileId);
    uploadProgress.value.delete(fileId);
  };

  return {
    // State
    isUploading,
    uploadProgress,
    uploadedFiles,

    // Methods
    uploadSingleFile,
    uploadMultipleFiles,
    clearUploads,
    removeUploadedFile,
    getMediaUrl,
  };
};
