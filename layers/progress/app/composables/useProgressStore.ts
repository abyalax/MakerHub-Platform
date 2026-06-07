import { defineStore } from 'pinia';
import type { LessonProgress, ProjectProgress } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetLessonProgress() for fetching lesson progress
// - useUpdateLessonProgress() for updating lesson progress
// - useGetProjectProgress() for fetching project progress
// - useUpdateProjectProgress() for updating project progress
// TanStack Query handles caching, loading states, and error handling automatically.

export const useProgressStore = defineStore('progress', () => {
  const lessonProgress = ref<Map<number, LessonProgress>>(new Map());
  const projectProgress = ref<Map<number, ProjectProgress>>(new Map());

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setLessonProgress(lessonId: number, data: LessonProgress) {
    lessonProgress.value.set(lessonId, data);
  }

  function setProjectProgress(projectId: number, data: ProjectProgress) {
    projectProgress.value.set(projectId, data);
  }

  function getLessonProgressById(lessonId: number): LessonProgress | undefined {
    return lessonProgress.value.get(lessonId);
  }

  function getProjectProgressById(projectId: number): ProjectProgress | undefined {
    return projectProgress.value.get(projectId);
  }

  async function fetchLessonProgress(_lessonId: number) {
    // TODO: Implement using useGetLessonProgress() composable
    console.warn('fetchLessonProgress is deprecated, use useGetLessonProgress() composable instead');
  }

  async function updateLessonProgress(_lessonId: number, _data: { status: string }) {
    // TODO: Implement using useUpdateLessonProgress() composable
    console.warn('updateLessonProgress is deprecated, use useUpdateLessonProgress() composable instead');
  }

  return {
    lessonProgress,
    projectProgress,
    setLessonProgress,
    setProjectProgress,
    getLessonProgressById,
    getProjectProgressById,
    fetchLessonProgress,
    updateLessonProgress,
  };
});
