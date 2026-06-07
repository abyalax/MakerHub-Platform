import { defineStore } from 'pinia';
import type { Enrollment, ProjectWithProgress, ContinueLearningResponse } from './types';

// TODO: This store is deprecated. Use TanStack Query composables directly:
// - useGetEnrollments() for fetching enrollments
// - useGetLearningLibrary() for fetching learning library
// - useGetContinueLearning() for fetching continue learning
// TanStack Query handles caching, loading states, and error handling automatically.

export const useEnrollmentsStore = defineStore('enrollments', () => {
  const enrollments = ref<Enrollment[]>([]);
  const learningLibrary = ref<ProjectWithProgress[]>([]);
  const continueLearning = ref<ContinueLearningResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Legacy methods for backward compatibility
  // Consider migrating components to use TanStack Query composables directly
  function setEnrollments(data: Enrollment[]) {
    enrollments.value = data;
  }

  function setLearningLibrary(data: ProjectWithProgress[]) {
    learningLibrary.value = data;
  }

  function setContinueLearning(data: ContinueLearningResponse | null) {
    continueLearning.value = data;
  }

  async function fetchLearningLibrary() {
    // TODO: Implement using useGetLearningLibrary() composable
    console.warn('fetchLearningLibrary is deprecated, use useGetLearningLibrary() composable instead');
  }

  async function fetchContinueLearning() {
    // TODO: Implement using useGetContinueLearning() composable
    console.warn('fetchContinueLearning is deprecated, use useGetContinueLearning() composable instead');
  }

  return {
    enrollments,
    learningLibrary,
    continueLearning,
    loading,
    error,
    setEnrollments,
    setLearningLibrary,
    setContinueLearning,
    fetchLearningLibrary,
    fetchContinueLearning,
  };
});
