export type AttachmentOwnerType = 'PURCHASE_REQUISITION' | 'RFQ' | 'VENDOR' | 'QUOTATION' | 'PO';
export type AttachmentFileCategory = 'IMAGE' | 'DOCUMENT' | 'PDF' | 'EXCEL' | 'OTHER';

export interface Attachment {
  id: number;
  ownerType: AttachmentOwnerType;
  ownerId: number;
  originalFileName: string;
  contentType: string;
  size: number;
  fileCategory: AttachmentFileCategory;
  downloadUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

export interface PresignUploadRequest {
  ownerType: AttachmentOwnerType;
  ownerId: number;
  files: PresignUploadFileRequest[];
}

export interface PresignUploadFileRequest {
  fileName: string;
  contentType: string;
  size: number;
  fileCategory: AttachmentFileCategory;
}

export interface PresignUploadFileResponse {
  uploadUrl: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  size: number;
  fileCategory: AttachmentFileCategory;
  expiresInSeconds: number;
}

export interface AttachmentDownloadResponse {
  downloadUrl: string;
  expiresInSeconds: number;
}

export interface PresignUploadResponse {
  files: PresignUploadFileResponse[];
}

export interface ConfirmUploadRequest {
  ownerType: AttachmentOwnerType;
  ownerId: number;
  objectKey: string;
  originalFileName: string;
  contentType: string;
  size: number;
  fileCategory: AttachmentFileCategory;
}
