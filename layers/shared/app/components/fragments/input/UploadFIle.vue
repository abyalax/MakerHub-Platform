<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useUploadFile, type UploadedFile, type UploadFileOptions } from '~/layers/shared/app/composable/useUploadFile';
import { Button } from '~/layers/shared/app/components/ui/button';
import { Progress } from '~/layers/shared/app/components/ui/progress';
import { Card, CardContent } from '~/layers/shared/app/components/ui/card';
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from 'lucide-vue-next';

interface Props {
  /** Upload options for file validation and configuration */
  options?: Partial<UploadFileOptions>;
  /** Whether to allow multiple files */
  multiple?: boolean;
  /** Whether to show file preview */
  showPreview?: boolean;
  /** Whether to show upload progress */
  showProgress?: boolean;
  /** Custom button text */
  buttonText?: string;
  /** Custom button variant */
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Custom button size */
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  /** Maximum number of files */
  maxFiles?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Accept attribute for file input */
  accept?: string;
  /** Current uploaded files (for v-model support) */
  modelValue?: UploadedFile[];
}

interface Emits {
  (e: 'update:modelValue', files: UploadedFile[]): void;
  (e: 'upload-start', file: File): void;
  (e: 'upload-success', file: UploadedFile): void;
  (e: 'upload-error', error: Error, file: File): void;
  (e: 'files-selected', files: File[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  showPreview: true,
  showProgress: true,
  buttonText: 'Upload File',
  buttonVariant: 'outline',
  buttonSize: 'default',
  maxFiles: 1,
  disabled: false,
  accept: '*',
  modelValue: () => [],
  options: () => ({
    type: 'file',
    accessType: 'public',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  }),
});

const emit = defineEmits<Emits>();

const fileInputRef = ref<HTMLInputElement>();
const { uploadSingleFile, uploadMultipleFiles, isUploading, uploadProgress, uploadedFiles } = useUploadFile();

// Merge uploaded files from composable with prop files
const displayFiles = computed(() => {
  const composableFiles = uploadedFiles.value;
  const propFiles = props.modelValue || [];
  return props.multiple ? [...propFiles, ...composableFiles] : composableFiles;
});

// Check if upload should be disabled
const isUploadDisabled = computed(() => {
  return props.disabled || isUploading.value || (props.maxFiles > 0 && displayFiles.value.length >= props.maxFiles);
});

// Get file icon based on MIME type
const getFileIcon = (file: UploadedFile) => {
  const mimeType = file.mimeType;
  if (mimeType?.startsWith('image/')) return ImageIcon;
  if (mimeType?.includes('pdf') || mimeType?.includes('document')) return FileText;
  return FileText;
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Handle file selection
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (!files.length) return;

  // Validate max files
  if (props.maxFiles > 0 && files.length > props.maxFiles) {
    console.warn(`Maximum ${props.maxFiles} files allowed`);
    return;
  }

  emit('files-selected', files);

  try {
    if (props.multiple && files.length > 1) {
      const uploaded = await uploadMultipleFiles(files, props.options as UploadFileOptions);
      emit('update:modelValue', uploaded);
      uploaded.forEach((file) => emit('upload-success', file));
    } else {
      const uploaded = await uploadSingleFile(files[0] as File, props.options as UploadFileOptions);
      const newFiles = props.multiple ? [...(props.modelValue || []), uploaded] : [uploaded];
      emit('update:modelValue', newFiles);
      emit('upload-success', uploaded);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    emit('upload-error', error as Error, files[0] as File);
  }

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Trigger file selection
const triggerFileSelect = () => {
  if (!isUploadDisabled.value) {
    fileInputRef.value?.click();
  }
};

// Remove uploaded file
const removeFile = (file: UploadedFile) => {
  const currentFiles = props.modelValue || [];
  const filteredFiles = currentFiles.filter((f) => f.id !== file.id);
  emit('update:modelValue', filteredFiles);
};

// Get upload progress for a file
const _getFileProgress = (file: File) => {
  const fileId = `${file.name}_${file.size}_${file.type}`;
  const progress = uploadProgress.value.get(fileId);
  return progress?.progress || 0;
};

// Get upload status for a file
const _getFileStatus = (file: File) => {
  const fileId = `${file.name}_${file.size}_${file.type}`;
  const progress = uploadProgress.value.get(fileId);
  return progress?.status || 'pending';
};

// Handle image error by hiding the element
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};
</script>

<template>
  <div class="upload-file-container space-y-4">
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="isUploadDisabled"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Upload button or slot -->
    <slot name="trigger" :trigger-file-select="triggerFileSelect" :disabled="isUploadDisabled" :is-uploading="isUploading">
      <Button :variant="props.buttonVariant" :size="props.buttonSize" :disabled="isUploadDisabled" class="gap-2" @click="triggerFileSelect">
        <Upload :class="['w-4 h-4', { 'animate-pulse': isUploading }]" />
        {{ isUploading ? 'Uploading...' : props.buttonText }}
      </Button>
    </slot>

    <!-- Upload progress -->
    <div v-if="showProgress && isUploading" class="space-y-2">
      <div v-for="[fileId, progress] in uploadProgress" :key="fileId" class="space-y-1">
        <div class="flex items-center justify-between text-sm">
          <span class="truncate">{{ progress.filename }}</span>
          <span class="text-muted-foreground">{{ progress.progress }}%</span>
        </div>
        <Progress :value="progress.progress" class="h-2" />
        <div v-if="progress.error" class="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle class="w-3 h-3" />
          <span>{{ progress.error }}</span>
        </div>
      </div>
    </div>

    <!-- File preview -->
    <div v-if="showPreview && displayFiles.length > 0" class="space-y-2">
      <slot name="preview" :files="displayFiles" :remove-file="removeFile">
        <div class="grid gap-2" :class="multiple ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'">
          <Card v-for="file in displayFiles" :key="file.id" class="relative group">
            <CardContent class="p-3">
              <!-- Remove button -->
              <Button
                variant="ghost"
                size="icon"
                class="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeFile(file)"
              >
                <X class="w-3 h-3" />
              </Button>

              <!-- File preview -->
              <div class="flex items-center gap-3">
                <!-- Image preview -->
                <div v-if="file.mimeType?.startsWith('image/')" class="shrink-0">
                  <img :src="file.url" :alt="file.filename" class="w-12 h-12 object-cover rounded border" @error="handleImageError" />
                </div>

                <!-- File icon -->
                <div v-else class="shrink-0">
                  <component :is="getFileIcon(file)" class="w-8 h-8 text-muted-foreground" />
                </div>

                <!-- File info -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate text-sm">{{ file.filename }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatFileSize(file.size) }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </slot>
    </div>

    <!-- Error display -->
    <slot name="error" :error="null">
      <!-- Error messages will be shown in progress section -->
    </slot>
  </div>
</template>

<style scoped>
.upload-file-container {
  width: 100%;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
