import { defineStore } from 'pinia';
import type { BookmarkWithDetails } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetBookmarks() for fetching bookmarks
// - useAddBookmark() for adding bookmarks
// - useRemoveBookmark() for removing bookmarks
// - useToggleFavorite() for toggling favorites
// TanStack Query handles caching, loading states, and error handling automatically.

export const useBookmarksStore = defineStore('bookmarks', () => {
  const bookmarks = ref<BookmarkWithDetails[]>([]);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setBookmarks(data: BookmarkWithDetails[]) {
    bookmarks.value = data;
  }

  return {
    bookmarks,
    setBookmarks,
  };
});
