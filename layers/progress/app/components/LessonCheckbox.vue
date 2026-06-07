<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProgressStore } from '~/layers/progress/app/composables/useProgressStore';

interface Props {
  lessonId: number;
  initialCompleted?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['change']);

const progressStore = useProgressStore();
const isCompleted = ref(props.initialCompleted || false);
const loading = ref(false);

onMounted(async () => {
  const progress = progressStore.getLessonProgressById(props.lessonId);
  if (progress) {
    isCompleted.value = progress.status === 'COMPLETED';
  } else {
    await progressStore.fetchLessonProgress(props.lessonId);
    const fetchedProgress = progressStore.getLessonProgressById(props.lessonId);
    if (fetchedProgress) {
      isCompleted.value = fetchedProgress.status === 'COMPLETED';
    }
  }
});

async function toggleCompletion() {
  loading.value = true;
  try {
    const newStatus = isCompleted.value ? 'NOT_STARTED' : 'COMPLETED';
    await progressStore.updateLessonProgress(props.lessonId, { status: newStatus });
    isCompleted.value = !isCompleted.value;
    emit('change', isCompleted.value);
  } catch (error) {
    console.error('Failed to update lesson progress:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    :disabled="loading"
    @click="toggleCompletion"
    class="flex items-center gap-2"
  >
    <div
      :class="{
        'bg-blue-600 border-blue-600': isCompleted,
        'bg-white border-gray-300': !isCompleted,
      }"
      class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
    >
      <svg
        v-if="isCompleted"
        class="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    <span v-if="loading" class="text-sm text-gray-500">Saving...</span>
  </button>
</template>
