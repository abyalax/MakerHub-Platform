<script setup lang="ts">
import { onMounted } from 'vue';
import { useEnrollmentsStore } from '~/layers/enrollments/app/composables/useEnrollmentsStore';

const enrollmentsStore = useEnrollmentsStore();

onMounted(() => {
  enrollmentsStore.fetchLearningLibrary();
  enrollmentsStore.fetchContinueLearning();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">My Learning</h1>

    <!-- Continue Learning Section -->
    <div v-if="enrollmentsStore.continueLearning?.projectId" class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Continue Learning</h2>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="font-semibold text-lg">
          {{ enrollmentsStore.continueLearning.projectTitle }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ enrollmentsStore.continueLearning.lessonTitle }}
        </p>
        <NuxtLink
          :to="`/projects/${enrollmentsStore.continueLearning.projectSlug}`"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue
        </NuxtLink>
      </div>
    </div>

    <!-- Learning Library -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Enrolled Projects</h2>

      <div v-if="enrollmentsStore.loading" class="text-center py-8">
        <p>Loading...</p>
      </div>

      <div v-else-if="enrollmentsStore.error" class="text-red-500 py-8">
        <p>{{ enrollmentsStore.error }}</p>
      </div>

      <div v-else>
        <div v-if="enrollmentsStore.learningLibrary.length === 0" class="text-center py-8">
          <p class="text-gray-500">No enrolled projects yet</p>
          <NuxtLink to="/projects" class="text-blue-600 hover:underline"> Browse projects </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in enrollmentsStore.learningLibrary" :key="project.id" class="bg-white rounded-lg shadow overflow-hidden border">
            <div
              v-if="project.coverAsset"
              class="h-48 bg-gray-200"
              :style="{
                backgroundImage: `url(${project.coverAsset.publicUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            />
            <div v-else class="h-48 bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400">No cover</span>
            </div>

            <div class="p-4">
              <h3 class="font-semibold mb-2">{{ project.title }}</h3>

              <div class="mb-3">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{{ project.progressPercent }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${project.progressPercent}%` }" />
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span
                  :class="{
                    'bg-green-100 text-green-800': project.status === 'COMPLETED',
                    'bg-blue-100 text-blue-800': project.status === 'ACTIVE',
                  }"
                  class="px-2 py-1 rounded text-xs font-medium"
                >
                  {{ project.status }}
                </span>
                <NuxtLink :to="`/projects/${project.slug}`" class="text-blue-600 hover:underline text-sm"> View </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
