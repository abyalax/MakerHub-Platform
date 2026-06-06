import axios from 'axios';
import { ENDPOINT } from '~/layers/shared/app/common/const/endpoint';
import { useHttp } from '~/layers/shared/app/composable/useHttp';
import type { TResponse } from '~/layers/shared/app/types/response';
import type {
  Attachment,
  AttachmentDownloadResponse,
  AttachmentOwnerType,
  ConfirmUploadRequest,
  PresignUploadRequest,
  PresignUploadResponse,
} from '~/layers/shared/app/types/attachment';

export interface AttachmentQuery {
  ownerType: AttachmentOwnerType;
  ownerId: number;
}

export const useAttachmentApi = () => {
  const http = useHttp();

  const requestPresignedUpload = async (payload: PresignUploadRequest) => {
    const response = await http<TResponse<PresignUploadResponse>>(ENDPOINT.ATTACHMENT_PRESIGN_UPLOAD, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  };

  const confirmUpload = async (payload: ConfirmUploadRequest) => {
    const response = await http<TResponse<Attachment>>(ENDPOINT.ATTACHMENT_CONFIRM, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  };

  const getAttachments = async (ownerType: AttachmentOwnerType, ownerId: number) => {
    const response = await http<TResponse<Attachment[]>>(ENDPOINT.ATTACHMENTS, {
      method: 'GET',
      query: { ownerType, ownerId },
    });
    return response.data;
  };

  const getDownloadUrl = async (id: number) => {
    const response = await http<TResponse<AttachmentDownloadResponse>>(ENDPOINT.ATTACHMENT_DOWNLOAD(id), {
      method: 'GET',
    });
    return response.data.downloadUrl;
  };

  const deleteAttachment = async (id: number) => {
    const response = await http<TResponse<boolean>>(ENDPOINT.ATTACHMENT_DELETE(id), {
      method: 'DELETE',
    });
    return response.data;
  };

  const uploadToMinio = async (uploadUrl: string, file: File, onProgress?: (progress: number) => void) => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (event) => {
        if (!event.total) return;
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });
  };

  return {
    requestPresignedUpload,
    confirmUpload,
    getAttachments,
    getDownloadUrl,
    deleteAttachment,
    uploadToMinio,
  };
};
