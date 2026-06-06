import { onUnmounted } from 'vue';

interface CustomFileObject {
  filePath?: string;
  url?: string;
  path?: string;
}

type ImageInput = Blob | File | string | CustomFileObject | null | undefined;

export function useResolveImage() {
  // Map to store File/Blob as Key and generated URL as Value
  // Using WeakMap because File objects are typically garbage collected
  const urlCache = new WeakMap<Blob | File, string>();

  // Set to track all active URLs for manual revocation
  const activeUrls = new Set<string>();

  /**
   * getImageUrl with Caching & Leak Prevention
   */
  const getImageUrl = (file: ImageInput): string => {
    if (!file) return '';
    if (typeof file === 'string') return file;

    if (file instanceof Blob || file instanceof File) {
      if (urlCache.has(file)) return urlCache.get(file)!;

      const url = URL.createObjectURL(file);
      urlCache.set(file, url);
      activeUrls.add(url);
      return url;
    }

    return file.filePath || file.url || file.path || '';
  };

  // Final cleanup: avoid memory leaks when component is destroyed
  onUnmounted(() => {
    activeUrls.forEach((url) => URL.revokeObjectURL(url));
    activeUrls.clear();
  });

  return getImageUrl;
}
