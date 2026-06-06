<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Download, FileText, Image as ImageIcon, Paperclip, Trash2, Upload } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import { useAttachmentApi } from '~/layers/shared/app/composable/useAttachmentApi';
import { useResolveImage } from '~/layers/shared/app/composable/useResolveImage';
import type { Attachment, AttachmentFileCategory, AttachmentOwnerType } from '~/layers/shared/app/types/attachment';

interface Props {
  ownerType: AttachmentOwnerType;
  ownerId?: number;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  fileCategory?: AttachmentFileCategory;
  disabled?: boolean;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  fileCategory: AttachmentFileCategory;
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/png,image/jpeg,image/webp,application/pdf',
  maxSizeMb: 10,
  multiple: true,
  fileCategory: 'DOCUMENT',
  disabled: false,
  ownerId: 0,
});

const emit = defineEmits<{
  selected: [payload: SelectedFile];
  uploaded: [attachment: Attachment];
  deleted: [attachmentId: number];
  error: [error: Error];
  uploading: [payload: { filename: string; progress: number }];
}>();

const api = useAttachmentApi();
const resolveImage = useResolveImage();
const fileInput = ref<HTMLInputElement | null>(null);
const attachments = ref<Attachment[]>([]);
const selectedFiles = ref<SelectedFile[]>([]);
const loading = ref(false);
const uploading = ref(false);
const uploadProgress = ref<Record<string, number>>({});

const maxSizeBytes = computed(() => props.maxSizeMb * 1024 * 1024);

const formatSize = (value: number) => {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const matchesAccept = (file: File) => {
  if (!props.accept || props.accept === '*') return true;
  return props.accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule.toLowerCase());
      if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
};

const inferCategory = (file: File): AttachmentFileCategory => {
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
    return 'EXCEL';
  }
  return props.fileCategory;
};

const loadAttachments = async () => {
  if (!props.ownerId || props.ownerId === 0) {
    attachments.value = [];
    return;
  }

  loading.value = true;
  try {
    attachments.value = await api.getAttachments(props.ownerType, props.ownerId);
  } finally {
    loading.value = false;
  }
};

const handleUpload = async (fileList: FileList | null) => {
  const files = Array.from(fileList ?? []);
  if (!files.length || props.disabled) return;

  if (!props.ownerId || props.ownerId === 0) {
    for (const file of files) {
      if (file.size > maxSizeBytes.value) throw new Error(`File ${file.name} exceeds max size ${props.maxSizeMb} MB`);
      if (!matchesAccept(file)) throw new Error(`File ${file.name} does not match accepted types`);
      const fileCategory = inferCategory(file);
      const previewUrl = resolveImage(file);
      selectedFiles.value.push({ file, previewUrl, fileCategory });
      emit('selected', { file, fileCategory, previewUrl });
    }
    if (fileInput.value) fileInput.value.value = '';
    return;
  }

  uploading.value = true;
  try {
    const filesPayload = files.map((file) => ({
      file,
      fileCategory: inferCategory(file),
    }));

    for (const item of filesPayload) {
      if (item.file.size > maxSizeBytes.value) throw new Error(`File ${item.file.name} exceeds max size ${props.maxSizeMb} MB`);
      if (!matchesAccept(item.file)) throw new Error(`File ${item.file.name} does not match accepted types`);
    }

    const presignResponse = await api.requestPresignedUpload({
      ownerType: props.ownerType,
      ownerId: props.ownerId,
      files: filesPayload.map((item) => ({
        fileName: item.file.name,
        contentType: item.file.type || 'application/octet-stream',
        size: item.file.size,
        fileCategory: item.fileCategory,
      })),
    });

    for (let index = 0; index < presignResponse.files.length; index += 1) {
      const file = filesPayload[index]?.file;
      const fileCategory = filesPayload[index]?.fileCategory;
      const presigned = presignResponse.files[index];
      if (!file || !fileCategory || !presigned) continue;

      uploadProgress.value[file.name] = 0;
      emit('uploading', { filename: file.name, progress: 0 });

      await api.uploadToMinio(presigned.uploadUrl, file, (progress: number) => {
        uploadProgress.value[file.name] = progress;
        emit('uploading', { filename: file.name, progress });
      });

      const attachment = await api.confirmUpload({
        ownerType: props.ownerType,
        ownerId: props.ownerId,
        objectKey: presigned.objectKey,
        originalFileName: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        fileCategory,
      });

      attachments.value = [attachment, ...attachments.value];
      emit('uploaded', attachment);
    }

    await loadAttachments();
  } catch (error) {
    emit('error', error as Error);
  } finally {
    uploading.value = false;
    uploadProgress.value = {};
    if (fileInput.value) fileInput.value.value = '';
  }
};

const openPicker = () => {
  if (!props.disabled && !uploading.value) fileInput.value?.click();
};

const downloadAttachment = async (attachment: Attachment) => {
  const url = await api.getDownloadUrl(attachment.id);
  window.open(url, '_blank', 'noopener,noreferrer');
};

const removeAttachment = async (attachment: Attachment) => {
  await api.deleteAttachment(attachment.id);
  attachments.value = attachments.value.filter((item: Attachment) => item.id !== attachment.id);
  emit('deleted', attachment.id);
};

const removeSelectedFile = (index: number) => {
  const item = selectedFiles.value[index];
  if (item) URL.revokeObjectURL(item.previewUrl);
  selectedFiles.value.splice(index, 1);
};

const iconFor = (attachment: Attachment) => {
  if (attachment.fileCategory === 'IMAGE' || attachment.contentType.startsWith('image/')) return ImageIcon;
  return FileText;
};

const iconForFile = (file: File) => {
  if (file.type.startsWith('image/')) return ImageIcon;
  return FileText;
};

const isImageAttachment = (attachment: Attachment) => attachment.fileCategory === 'IMAGE' || attachment.contentType.startsWith('image/');

const previewClass = 'h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted/30';

watch(() => [props.ownerType, props.ownerId], loadAttachments, { immediate: true });
</script>

<template>
  <div class="space-y-3 rounded-md border p-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium">
          <Paperclip class="size-4" />
          Attachments
        </div>
        <p class="text-xs text-muted-foreground">Upload files directly to storage and sync metadata to backend.</p>
      </div>
      <Button type="button" variant="outline" size="sm" :disabled="disabled || uploading" @click="openPicker">
        <Upload class="size-4" />
        {{ uploading ? 'Uploading' : 'Upload' }}
      </Button>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      :disabled="disabled || uploading"
      @change="(event) => handleUpload((event.target as HTMLInputElement).files)"
    />

    <div v-if="uploading" class="space-y-2 text-sm">
      <div v-for="(progress, name) in uploadProgress" :key="name" class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="truncate">{{ name }}</span>
          <span class="text-muted-foreground">{{ progress }}%</span>
        </div>
        <div class="h-2 rounded-full bg-muted">
          <div class="h-2 rounded-full bg-primary" :style="{ width: `${progress}%` }" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">Loading attachments...</div>

    <div v-else class="space-y-2">
      <div v-if="selectedFiles.length" class="space-y-2">
        <div
          v-for="(item, index) in selectedFiles"
          :key="`${item.file.name}-${index}`"
          class="flex items-center justify-between gap-3 rounded-md border p-3"
        >
          <div :class="previewClass">
            <img
              v-if="item.file.type.startsWith('image/')"
              :src="resolveImage(item.previewUrl)"
              :alt="item.file.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <component :is="iconForFile(item.file)" class="size-5 text-muted-foreground" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium">{{ item.file.name }}</div>
            <div class="text-xs text-muted-foreground">{{ item.fileCategory }} - {{ formatSize(item.file.size) }}</div>
          </div>
          <Button variant="ghost" size="icon" @click="removeSelectedFile(index)">
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>

      <div v-for="attachment in attachments" :key="attachment.id" class="flex items-start justify-between gap-3 rounded-md border p-3">
        <div class="flex min-w-0 items-start gap-3">
          <div :class="previewClass">
            <img
              v-if="isImageAttachment(attachment)"
              :src="resolveImage(attachment.downloadUrl)"
              :alt="attachment.originalFileName"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <component :is="iconFor(attachment)" class="size-5 text-muted-foreground" />
            </div>
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-medium">{{ attachment.originalFileName }}</div>
            <div class="text-xs text-muted-foreground">
              {{ attachment.fileCategory }} - {{ formatSize(attachment.size) }} - {{ new Date(attachment.createdAt).toLocaleString() }}
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" @click="downloadAttachment(attachment)">
            <Download class="size-4" />
          </Button>
          <Button variant="ghost" size="icon" :disabled="disabled" @click="removeAttachment(attachment)">
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>

      <div v-if="!attachments.length && !selectedFiles.length" class="text-sm text-muted-foreground">No attachments yet.</div>
    </div>
  </div>
</template>
