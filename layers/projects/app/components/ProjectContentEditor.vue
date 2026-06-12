<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { JSONContent } from '@tiptap/vue-3';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import { Bold, Code, Heading1, Heading2, ImageIcon, Italic, LinkIcon, List, ListOrdered, Minus, Quote, TableIcon, YoutubeIcon } from 'lucide-vue-next';
import { Button } from '~/layers/shared/app/components/ui/button';
import { useUploadFile } from '~/layers/shared/app/composable/useUploadFile';

const model = defineModel<JSONContent>({ required: true });

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: 'Write the project scope, requirements, milestones, and submission notes...',
  }
);

const emit = defineEmits<{
  textChange: [value: string];
  uploadStart: [];
  uploadFinish: [];
  uploadError: [message: string];
}>();

const { uploadSingleFile, isUploading } = useUploadFile();

const uploadImages = async (files: File[]) => {
  const images = files.filter((file) => file.type.startsWith('image/'));
  if (!images.length) return false;

  emit('uploadStart');
  try {
    for (const file of images) {
      const uploaded = await uploadSingleFile(file, {
        type: 'project-content-image',
        accessType: 'public',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 8 * 1024 * 1024,
      });
      editor.value?.chain().focus().setImage({ src: uploaded.url, alt: uploaded.filename }).run();
    }
    return true;
  } catch (error) {
    emit('uploadError', error instanceof Error ? error.message : 'Image upload failed');
    return true;
  } finally {
    emit('uploadFinish');
  }
};

const editor = useEditor({
  content: model.value,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: {
        class: 'rounded-md border',
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Youtube.configure({
      controls: true,
      nocookie: true,
    }),
  ],
  editorProps: {
    handleDrop: (_view, event) => {
      if (!event.dataTransfer?.files?.length) return false;
      void uploadImages(Array.from(event.dataTransfer.files));
      return true;
    },
    handlePaste: (_view, event) => {
      if (!event.clipboardData?.files?.length) return false;
      void uploadImages(Array.from(event.clipboardData.files));
      return true;
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    model.value = currentEditor.getJSON();
    emit('textChange', currentEditor.getText().trim());
  },
});

const canUseEditor = computed(() => !!editor.value && !props.disabled);
const fileInput = ref<HTMLInputElement | null>(null);

const run = (command: () => void) => {
  if (!canUseEditor.value) return;
  command();
};

const setLink = () => {
  if (!editor.value) return;
  const previousUrl = editor.value.getAttributes('link').href as string | undefined;
  const url = window.prompt('URL', previousUrl ?? '');

  if (url === null) return;
  if (!url) {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

const addYoutube = () => {
  if (!editor.value) return;
  const src = window.prompt('YouTube URL');
  if (!src) return;
  editor.value.chain().focus().setYoutubeVideo({ src, width: 640, height: 360 }).run();
};

const pickImage = () => {
  if (!canUseEditor.value) return;
  fileInput.value?.click();
};

const handlePickedImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  await uploadImages(Array.from(input.files));
  input.value = '';
};

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled);
  }
);

watch(
  model,
  (value) => {
    if (!editor.value || JSON.stringify(editor.value.getJSON()) === JSON.stringify(value)) return;
    editor.value.commands.setContent(value);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="overflow-hidden rounded-md border bg-background">
    <div class="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Heading 1" @click="run(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())">
        <Heading1 class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Heading 2" @click="run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())">
        <Heading2 class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Bold" @click="run(() => editor?.chain().focus().toggleBold().run())">
        <Bold class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Italic" @click="run(() => editor?.chain().focus().toggleItalic().run())">
        <Italic class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Inline code" @click="run(() => editor?.chain().focus().toggleCode().run())">
        <Code class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Bullet list" @click="run(() => editor?.chain().focus().toggleBulletList().run())">
        <List class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Ordered list" @click="run(() => editor?.chain().focus().toggleOrderedList().run())">
        <ListOrdered class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Quote" @click="run(() => editor?.chain().focus().toggleBlockquote().run())">
        <Quote class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Horizontal rule" @click="run(() => editor?.chain().focus().setHorizontalRule().run())">
        <Minus class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Link" @click="setLink">
        <LinkIcon class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor || isUploading" title="Image" @click="pickImage">
        <ImageIcon class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="Table" @click="run(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())">
        <TableIcon class="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" :disabled="!canUseEditor" title="YouTube" @click="addYoutube">
        <YoutubeIcon class="size-4" />
      </Button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handlePickedImage" />
    </div>

    <EditorContent :editor="editor" class="project-content-editor" />
  </div>
</template>

<style scoped>
.project-content-editor :deep(.ProseMirror) {
  min-height: 360px;
  padding: 1rem;
  outline: none;
}

.project-content-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: hsl(var(--muted-foreground));
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.project-content-editor :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 2.25rem;
}

.project-content-editor :deep(h2) {
  font-size: 1.5rem;
  font-weight: 650;
  line-height: 2rem;
}

.project-content-editor :deep(h3) {
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1.75rem;
}

.project-content-editor :deep(ul),
.project-content-editor :deep(ol) {
  padding-left: 1.5rem;
}

.project-content-editor :deep(ul) {
  list-style: disc;
}

.project-content-editor :deep(ol) {
  list-style: decimal;
}

.project-content-editor :deep(blockquote) {
  border-left: 3px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  padding-left: 1rem;
}

.project-content-editor :deep(pre) {
  border-radius: 0.375rem;
  background: hsl(var(--muted));
  overflow-x: auto;
  padding: 0.75rem;
}

.project-content-editor :deep(table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

.project-content-editor :deep(td),
.project-content-editor :deep(th) {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem;
  vertical-align: top;
}

.project-content-editor :deep(th) {
  background: hsl(var(--muted));
  font-weight: 600;
}

.project-content-editor :deep(img) {
  max-width: 100%;
}
</style>
