<script setup lang="ts">
import Page from '~/layers/shared/app/components/layouts/Page.vue';

const route = useRoute();
const { data, pending, error } = await useFetch<{ data: { id: number; name: string; mentorProfile?: { id: number } | null } }>(
  `/api/profiles/${route.params.id}`
);
const profile = computed(() => data.value?.data);
</script>

<template>
  <Page
    title="Profile"
    :breadcrumbs="[
      { title: 'Profiles', url: '/profiles', active: false },
      { title: profile?.name ?? 'Profile', url: `/profiles/${profile?.id}`, active: true },
    ]"
  >
    <section class="mx-auto max-w-3xl px-6 py-10">
      <p v-if="pending" class="text-sm text-muted-foreground">Loading profile...</p>
      <div v-else-if="error || !profile">
        <h1 class="text-2xl font-semibold">Profile not found</h1>
      </div>
      <div v-else class="space-y-4">
        <h1 class="text-3xl font-semibold tracking-tight">{{ profile.name }}</h1>
        <NuxtLink v-if="profile.mentorProfile" :to="`/mentors/${profile.mentorProfile.id}`" class="text-sm underline underline-offset-4">
          View mentor profile
        </NuxtLink>
      </div>
    </section>
  </Page>
</template>
